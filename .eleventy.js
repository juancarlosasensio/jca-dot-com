const { DateTime } = require("luxon");
require('dotenv').config()

const blog = require('./src/collections/blog.js');
const books = require('./src/collections/books.js');

module.exports = function (eleventyConfig) {
  eleventyConfig.addFilter("simpleDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj).toLocaleString(DateTime.DATE_FULL);
  });

  // Add 'blog' as its own collection
  eleventyConfig.addCollection('blog', async function collectionCallback(collectionApi) {
    const allPosts = await blog();

    // Posts are all posts that are not notes
    const posts = allPosts.filter(post => !post.categories.hasOwnProperty('Notes'));

    return posts;
  });

  // TODO: avoid caling await blog() twice.
  // Add 'notes' as its own collection
  eleventyConfig.addCollection('notes', async function collectionCallback(collectionApi) {
    const allPosts = await blog();

    // Notes are all posts that have a category of Notes
    const notes = allPosts.filter(note => note.categories.hasOwnProperty('Notes'));

    return notes;
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