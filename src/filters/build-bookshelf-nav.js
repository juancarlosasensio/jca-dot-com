/**
 * Build Bookshelf Navigation Filter
 *
 * Transforms shelf data into a unified navigation array for bookshelf pages.
 * This filter works around Eleventy's limitation with eleventyComputed in paginated contexts.
 *
 * @param {Array} shelves - Array of shelf objects with name, slug, and count
 * @param {number} allBooksCount - Total number of books across all shelves
 * @param {boolean} isMainPage - Whether this is the main "All" books page
 * @param {string|null} currentShelf - Name of current shelf, or null for main page
 * @returns {Array} Navigation items with href, label, count, and isCurrent
 */
module.exports = function(shelves, allBooksCount, isMainPage, currentShelf) {
  const navigation = [];

  // Add "All" navigation item first
  navigation.push({
    href: '/bookshelf/',
    label: 'All',
    count: allBooksCount,
    isCurrent: isMainPage === true
  });

  // Add shelf navigation items
  if (shelves && Array.isArray(shelves)) {
    shelves.forEach(shelf => {
      navigation.push({
        href: `/bookshelf/${shelf.slug}/`,
        label: shelf.name,
        count: shelf.count,
        isCurrent: currentShelf === shelf.name
      });
    });
  }

  return navigation;
};
