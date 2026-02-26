const notePostsFilter = require('../filters/notesPosts.js');

module.exports = {
  layout: "layouts/content-item.njk",
  showDisclaimer: true,
  backLink: '/thinking',
  backLinkText: 'Notes',
  pagination: {
    data: "collections.wpContent",
    size: 1,
    alias: "item",
    before: function(paginationData) {
      return notePostsFilter(paginationData);
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
