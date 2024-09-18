module.exports = function (eleventyConfig) {
  // Tell 11ty to use the .eleventyignore and ignore our .gitignore file
  config.setUseGitIgnore(false);
  
  return {
    dir: {
      input: "src",
      output: "dist"
    }
  }
}