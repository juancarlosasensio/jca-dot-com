module.exports = {
  layout: 'layouts/bookshelf.njk',
  permalink: '/bookshelf/index.html',
  eleventyComputed: {
    items: data => {
      // Return all books for the main page
      return data.collections.books;
    },
    shelves: data => {
      // Compute shelf data with counts for navigation
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
    isMainPage: () => true,
    currentShelf: () => null,
    pageTitleClasses: () => 'text-center'
  }
};
