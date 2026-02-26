---js
{
  pagination: {
    data: "collections.books",
    size: 1,
    alias: "shelf",
    before: function(paginationData) {
      // Extract unique shelf names from books collection
      const uniqueShelves = [...new Set(paginationData.map(book => book.shelf))];
      return uniqueShelves;
    }
  },
  permalink: "/bookshelf/{{ shelf | slugify }}/index.html"
}
---

<!-- Content rendered by layout using computed data from shelf.11tydata.js -->
