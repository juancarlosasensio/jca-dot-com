require('dotenv').config();

const axios = require('axios');
const { AssetCache } = require('@11ty/eleventy-fetch');

module.exports = async function () {
  // Step 1: Use cached asset if cache is still valid
  const asset = new AssetCache('blogroll');
  // if (asset.isCacheValid('8h')) {
  //   // If the cache is valid (within 8 hours), return the cached data
  //   return asset.getCachedValue();
  // }

  // Step 2: Fetch blog URLs from Feedbin using the correct URL and credentials
  const feedbinUrl = 'https://api.feedbin.com/v2/subscriptions.json';
  const auth = {
    username: process.env.FEEDBIN_USERNAME, // Feedbin username from environment variables
    password: process.env.FEEDBIN_PASSWORD, // Feedbin password from environment variables
  };

  try {
    // Fetch the list of subscriptions (blogs) from Feedbin
    const response = await axios.get(feedbinUrl, { auth });
    const subscriptions = response.data; // Array of blog subscriptions

    console.log(subscriptions);

    // // Step 3: Update JSON to include the latest post for each blog URL
    // const blogroll = await Promise.all(
    //   subscriptions.map(async (subscription) => {
    //     const { feed_id, title, site_url } = subscription;

    //     // Fetch the latest post for the blog using Feedbin's entries API
    //     const entriesUrl = `https://api.feedbin.com/v2/feeds/${feed_id}/entries.json?per_page=1`;
    //     const entriesResponse = await axios.get(entriesUrl, { auth });
    //     const latestPost = entriesResponse.data[0]; // Get the most recent post

    //     return {
    //       title, // Blog title
    //       site_url, // Blog URL
    //       latest_post: latestPost
    //         ? {
    //             title: latestPost.title,
    //             url: latestPost.url,
    //             published: latestPost.published,
    //           }
    //         : null, // If no posts are available, set to null
    //     };
    //   })
    // );

    
    // // Step 4: Save the updated JSON to the asset cache and return the data
    // asset.save(blogroll, 'json'); // Save the blogroll data to the cache
    // return blogroll; // Return the blogroll data

    asset.save(subscriptions, 'json'); // Save the blogroll data to the cache
    return subscriptions; // Return the blogroll data

  } catch (error) {
    console.error('Error fetching data from Feedbin:', error.message);
    throw new Error('Failed to fetch blogroll data');
  }
};
