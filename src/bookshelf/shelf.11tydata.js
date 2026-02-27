module.exports = {
  layout: 'layouts/bookshelf.njk',
  title: 'Now Reading',
  pageTitleClasses: 'text-center',
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
  permalink: "/bookshelf/{{ shelf | slugify }}/index.html",
  eleventyComputed: {
    items: data => {
      // Filter books to only those on current shelf
      return data.collections.books.filter(book => book.shelf === data.shelf);
    },
    shelves: data => {
      // Compute shelf data with counts for navigation (same as main page)
      const books = data.collections.books;
      const shelfCounts = {};

      books.forEach(book => {
        if (book.shelf) {
          shelfCounts[book.shelf] = (shelfCounts[book.shelf] || 0) + 1;
        }
      });

      return Object.keys(shelfCounts).map(shelf => ({
        name: shelf,
        slug: shelf.toLowerCase().replace(/\s+/g, '-'),
        count: shelfCounts[shelf]
      }));
    },
    allBooksCount: data => {
      return data.collections.books.length;
    },
    isMainPage: () => false,
    currentShelf: data => data.shelf,  // Pass current shelf name to layout
  }
};
