require('dotenv').config()

const wpContent = require('./src/collections/blog.js');
const books = require('./src/collections/books.js');

const simpleDateFilter = require('./src/filters/simpleDate.js');
const notePostsFilter = require('./src/filters/notesPosts.js');
const genericPostsFilter = require('./src/filters/genericPosts.js');

module.exports = function (config) {
  // Creates a global variable for the current __dirname to make including and
  // working with files in the pattern library a little easier
  global.__basedir = __dirname;

  
  // Filters
  config.addFilter("simpleDate", simpleDateFilter);
  config.addFilter("getNotes", notePostsFilter);

  // Get 'blog posts' from Wordpress content
  config.addFilter("getPosts", genericPostsFilter)

  // Add all Wordpress posts as its own collection
  config.addCollection('wpContent', async function collectionCallback(collectionApi) {
    const allContent = await wpContent();
    return allContent;
  });
  
  // Add books as its own collection
  config.addCollection('books', books);

  // Pass through fonts and images
  config.addPassthroughCopy('./src/fonts');
  config.addPassthroughCopy('./src/images');
  config.addPassthroughCopy('./src/js');
  config.addPassthroughCopy('./src/_redirects');

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