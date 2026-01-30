require('dotenv').config();

const axios = require('axios');
const { AssetCache } = require('@11ty/eleventy-fetch');
const decodeHtmlCharCodes = require('../utils/htmlCharEncoder.js');

module.exports = async function () {
  // Use cached asset if cache is still valid
  const asset = new AssetCache('blogroll');
  if (asset.isCacheValid('8h')) {
    return asset.getCachedValue();
  }

  // Return empty array if Feedbin credentials are not configured
  if (!process.env.FEEDBIN_USERNAME || !process.env.FEEDBIN_PASSWORD) {
    console.log('[blogroll] Feedbin credentials not configured, returning empty collection');
    return [];
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
    const blogrollResults = await Promise.all(
      subscriptions.map(async (subscription) => {
        const { feed_id, title, site_url } = subscription;

        try {
          // Fetch the latest post for the blog using Feedbin's entries API
          const entriesUrl = `https://api.feedbin.com/v2/feeds/${feed_id}/entries.json?per_page=1`;
          const entriesResponse = await axios.get(entriesUrl, { auth });
          // And get the most recent post
          const latestPost = entriesResponse.data[0];

          return {
            // Decode HTML entities like &#8217; to proper characters
            title: decodeHtmlCharCodes(title),
            site_url,
            latest_post: latestPost
              ? {
                  // Decode HTML entities in post title too
                  title: decodeHtmlCharCodes(latestPost.title),
                  url: latestPost.url,
                  published: latestPost.published,
                }
              : null, // Feed has no entries yet
          };
        } catch (error) {
          // If this individual feed fails, log it but don't crash the entire collection
          // This allows the build to succeed even if one feed is temporarily unavailable
          console.error(`Error fetching entries for feed ${feed_id} (${title}):`, error.message);

          // Return the subscription without a latest_post
          // This is better than crashing - the blog will still appear in the list
          return {
            title: decodeHtmlCharCodes(title),
            site_url,
            latest_post: null,
          };
        }
      })
    );

    // Filter out subscriptions that don't have any entries
    const blogroll = blogrollResults.filter(blog => blog.latest_post !== null);

    // Add logging for visibility during builds (matches books.js pattern)
    console.log(`Fetched ${blogroll.length} blogs from Feedbin`);

    // Save the blogroll data to the cache and return it
    await asset.save(blogroll, 'json');
    return blogroll;

  } catch (error) {
    console.error('Error fetching data from Feedbin:', error.message);
    // Return cached data if available, otherwise empty array
    return asset.getCachedValue() || [];
  }
};
