require('dotenv').config();

const axios = require('axios');
const { AssetCache } = require('@11ty/eleventy-fetch');
const decodeHtmlCharCodes = require('../utils/htmlCharEncoder.js');

module.exports = async function () {
  const url = `${process.env.WP_ROOT_URL}?per_page=100`;

  const asset = new AssetCache('blog');

  // If saved in cache, return that instead of fetching all the data
  if (asset.isCacheValid('8h')) {
    return asset.getCachedValue();
  }

  // Return empty array if WP_ROOT_URL is not configured
  if (!process.env.WP_ROOT_URL) {
    console.log('[blog] WP_ROOT_URL not configured, returning empty collection');
    return [];
  }

  // Grab the first page of posts
  let res;
  try {
    res = await axios.get(url);
  } catch (error) {
    console.log('[blog] Failed to fetch posts, returning empty collection:', error.message);
    return [];
  }

  // Use the header to determine how many pages there are left to get
  const totalPages = parseInt(res.headers['x-wp-totalpages']);

  // Turn the initial page into consumable JSON
  let items = await res.data;
  let data;

  // Set a counter and a return array, setting the initial page of data as it's value
  let pageCount = 0;

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

  // Replace chars like '&#8217' with their HTML-encoded equivalents
  items?.forEach((item) => {
    item.title.rendered = decodeHtmlCharCodes(item.title.rendered);
  })

  // Stick in cache for later
  asset.save(items, 'json');
  return items;
};
