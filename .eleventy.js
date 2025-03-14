const { DateTime } = require("luxon");
require('dotenv').config()

const wpContent = require('./src/collections/blog.js');
const books = require('./src/collections/books.js');

module.exports = function (eleventyConfig) {
  eleventyConfig.addFilter("simpleDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj).toLocaleString(DateTime.DATE_FULL);
  });

  // Get 'notes' from Wordpress content
  eleventyConfig.addFilter("getNotes", (arr) => {
    return arr.filter(note => note.categories.hasOwnProperty('Notes'));
  });

  // Get 'blog posts' from Wordpress content
  eleventyConfig.addFilter("getPosts", (arr) => {
    return arr.filter(note => !note.categories.hasOwnProperty('Notes'));
  });

  // Add all Wordpress posts as its own collection
  eleventyConfig.addCollection('wpContent', async function collectionCallback(collectionApi) {
    const allContent = await wpContent();
    return allContent;
  });
  
  // Add books as its own collection
  eleventyConfig.addCollection('books', books);

  // For now, we want all our styles to be copied over
  eleventyConfig.addPassthroughCopy('./src/css/**/*.css');
  eleventyConfig.addPassthroughCopy('./src/images');
  eleventyConfig.addPassthroughCopy('./src/js/**/*.js');

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