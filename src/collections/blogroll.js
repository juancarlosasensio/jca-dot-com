require('dotenv').config();

const axios = require('axios');
const { AssetCache } = require('@11ty/eleventy-fetch');

module.exports = async function () {
  // Use cached asset if cache is still valid
  const asset = new AssetCache('blogroll');
  if (asset.isCacheValid('8h')) {
    return asset.getCachedValue();
  }

  // Fetch blog URLs from Feedbin using the correct URL and credentials
  const feedbinUrl = 'https://api.feedbin.com/v2/subscriptions.json';
  const auth = {
    username: process.env.FEEDBIN_USERNAME,
    password: process.env.FEEDBIN_PASSWORD,
  };

  try {
    // Fetch the list of subscriptions (blogs) from Feedbin
    const response = await axios.get(feedbinUrl, { auth });
    const subscriptions = response.data; // Array of blog subscriptions

    // Update JSON to include the latest post for each blog URL
    const blogroll = await Promise.all(
      subscriptions.map(async (subscription) => {
        const { feed_id, title, site_url } = subscription;

        // Fetch the latest post for the blog using Feedbin's entries API
        const entriesUrl = `https://api.feedbin.com/v2/feeds/${feed_id}/entries.json?per_page=1`;
        const entriesResponse = await axios.get(entriesUrl, { auth });
        // And get the most recent post
        const latestPost = entriesResponse.data[0];

        return {
          title,
          site_url,
          latest_post: latestPost
            ? {
                title: latestPost.title,
                url: latestPost.url,
                published: latestPost.published,
              }
            : null, // If no posts are available, set to null
        };
      })
    );
    // Save the blogroll data to the cache and return it
    asset.save(blogroll, 'json');
    return blogroll;

  } catch (error) {
    console.error('Error fetching data from Feedbin:', error.message);
    return asset.getCachedValue();
  }
};
