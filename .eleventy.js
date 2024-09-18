module.exports = function (eleventyConfig) {
  // Tell 11ty to use the .eleventyignore and ignore our .gitignore file
  eleventyConfig.setUseGitIgnore(false);

  // For now, we want all our styles to be copied over
  eleventyConfig.addPassthroughCopy('./src/css/**/*.css');

  return {
    dir: {
      input: "src",
      output: "dist"
    }
  }
}