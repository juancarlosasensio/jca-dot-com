const { DateTime } = require("luxon");

module.exports = function (eleventyConfig) {
  // Tell 11ty to use the .eleventyignore and ignore our .gitignore file
  eleventyConfig.setUseGitIgnore(false);

  eleventyConfig.addFilter("simpleDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj).toLocaleString(DateTime.DATE_FULL);
  });

  // For now, we want all our styles to be copied over
  eleventyConfig.addPassthroughCopy('./src/css/**/*.css');
  eleventyConfig.addPassthroughCopy('./src/images');
  eleventyConfig.addPassthroughCopy('./src/js/main.js');

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