require('dotenv').config()

const rssPlugin = require('@11ty/eleventy-plugin-rss');

const wpContent = require('./src/collections/blog.js');
const books = require('./src/collections/books.js');
const blogroll = require('./src/collections/blogroll.js');

const simpleDateFilter = require('./src/filters/simpleDate.js');
const notePostsFilter = require('./src/filters/notesPosts.js');
const genericPostsFilter = require('./src/filters/genericPosts.js');
const nowPageUpdatesFilter = require('./src/filters/nowPosts.js');
const limitFilter = require('./src/filters/limit.js');

module.exports = function (config) {
  // Creates a global variable for the current __dirname to make including and
  // working with files in the pattern library a little easier
  global.__basedir = __dirname;


  // Filters
  config.addFilter("limit", limitFilter);
  config.addFilter("simpleDate", simpleDateFilter);
  config.addFilter("getNotes", notePostsFilter);
  config.addFilter("getPosts", genericPostsFilter);
  config.addFilter("getNowEntries", nowPageUpdatesFilter);

  // Add all Wordpress posts as its own collection
  config.addCollection('wpContent', async function collectionCallback(collectionApi) {
    const allContent = await wpContent();
    return allContent;
  });
  
  // Add books as its own collection
  config.addCollection('books', books);
  
  // Add blogroll as its own collection
  config.addCollection('blogroll', blogroll);

  // Pass through fonts and images
  config.addPassthroughCopy('./src/fonts');
  config.addPassthroughCopy('./src/images');
  config.addPassthroughCopy('./src/js');
  config.addPassthroughCopy('./src/_redirects');

  // Add RSS plugin
  config.addPlugin(rssPlugin);

  return {
    markdownTemplateEngine: 'njk',
    dataTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
    dir: {
      input: "src",
      output: "dist"
    }
  }
}