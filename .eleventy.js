const { DateTime } = require("luxon");
require('dotenv').config()

const blog = require('./src/collections/blog.js');
const books = require('./src/collections/books.js');

module.exports = function (eleventyConfig) {
  eleventyConfig.addFilter("simpleDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj).toLocaleString(DateTime.DATE_FULL);
  });

  eleventyConfig.addCollection('blog', blog);
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