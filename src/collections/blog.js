require('dotenv').config();

const axios = require('axios');
const {AssetCache} = require('@11ty/eleventy-fetch');

module.exports = async function () {
  const url = `${process.env.WP_ROOT_URL}?&per_page=100`;
  
  const asset = new AssetCache('blog');

  // If saved in cache, return that instead of fetching all the data
  if (asset.isCacheValid('8h')) {
    return asset.getCachedValue();
  }

  // Grab the first page of posts
  let res = await axios.get(url);

  // Use the header to determine how many pages there are left to get
  const totalPages = parseInt(res.headers['x-wp-totalpages']);

  // Turn the initial page into consumable JSON
  let data = await res.data;

  // Set a counter and a return array, setting the initial page of data as it's value
  let pageCount = 0;
  let items = data.posts;

  function decodeHtmlCharCodes(str) { 
    return str.replace(/(&#(\d+);)/g, function(match, capture, charCode) {
      return String.fromCharCode(charCode);
  });
}

  // Loop until page limit exceeded
  while (pageCount < totalPages) {
    pageCount++;

    // Ditch this iteration if we're on page one
    if (pageCount === 1) {
      continue;
    }

    // Smoosh the rest of the data in
    res = await axios.get(url + `&page=${pageCount}`);
    data = await res.data;

    items = [...items, data].flat();

    continue;
  }

  items.forEach((item) => {
    console.log(item);
    item.title = decodeHtmlCharCodes(item.title);
  })



  // Stick in cache for later
  console.log(items)
  asset.save(items, 'json');
  return items;
};
