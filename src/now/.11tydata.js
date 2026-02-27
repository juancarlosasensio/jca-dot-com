const nowPostsFilter = require('../filters/nowPostsFilter.js');

module.exports = {
  layout: "layouts/content-item.njk",
  showDisclaimer: false,
  backLink: '/now/archive',
  backLinkText: 'Now Entries archive',
  pageStylesheets: ["../../css/wordpress.css"],
  pagination: {
    data: "collections.wpContent",
    size: 1,
    alias: "entry",
    before: function(paginationData) {
      return nowPostsFilter(paginationData);
    }
  },
  eleventyComputed: {
    title: data => data.entry?.title?.rendered || '',
    permalink: data => {
      if (!data.entry) return false;
      return `/${data.entry.slug}/index.html`;
    }
  }
};