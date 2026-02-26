module.exports = {
  layout: 'layouts/bookshelf.njk',
  eleventyComputed: {
    title: data => {
      // Capitalize shelf name for page title
      return data.shelf.charAt(0).toUpperCase() + data.shelf.slice(1).replace(/-/g, ' ');
    },
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
    pageTitleClasses: () => 'text-center'
  }
};
