const genericPostsFilter = require('../filters/genericPosts.js');

module.exports = {
  layout: "layouts/content-item.njk",
  showDisclaimer: false,
  backLink: '/blog',
  backLinkText: 'blog',
  pageStylesheets: ["../../css/wordpress.css"],
  pagination: {
    data: "collections.wpContent",
    size: 1,
    alias: "item",
    before: function(paginationData) {
      return genericPostsFilter(paginationData);
    }
  },
  eleventyComputed: {
    title: data => data.item?.title?.rendered || '',
    permalink: data => {
      if (!data.item) return false;
      return `/${data.item.slug}/index.html`;
    }
  }
};
