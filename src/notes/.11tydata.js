const notePostsFilter = require('../filters/notesPosts.js');

module.exports = {
  layout: "layouts/page.njk",
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
      // Only generate permalink for pagination items, not the template itself
      if (!data.item) return false;
      return `/${data.item.slug}/index.html`;
    }
  }
};
