const { DateTime } = require("luxon");
require('dotenv').config()

const wpContent = require('./src/collections/blog.js');
const books = require('./src/collections/books.js');

module.exports = function (config) {
  // Creates a global variable for the current __dirname to make including and
  // working with files in the pattern library a little easier
  global.__basedir = __dirname;

  config.addFilter("simpleDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj).toLocaleString(DateTime.DATE_FULL);
  });

  // Get 'notes' from Wordpress content
  config.addFilter("getNotes", (arr) => {
    return arr.filter(note => note.categories.hasOwnProperty('Notes'));
  });

  // Get 'blog posts' from Wordpress content
  config.addFilter("getPosts", (arr) => {
    return arr.filter(note => !note.categories.hasOwnProperty('Notes'));
  });

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