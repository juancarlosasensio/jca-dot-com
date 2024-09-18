module.exports = function (eleventyConfig) {
  // Tell 11ty to use the .eleventyignore and ignore our .gitignore file
  eleventyConfig.setUseGitIgnore(false);

  eleventyConfig.addPassthroughCopy('./src/css/**/*.css');

  return {
    dir: {
      input: "src",
      output: "dist"
    }
  }
}