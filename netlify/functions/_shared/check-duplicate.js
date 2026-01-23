require('dotenv').config();
const Airtable = require('airtable');

/**
 * Normalize title for fuzzy matching
 * @param {string} title - Book title to normalize
 * @returns {string} Normalized title
 */
function normalizeTitle(title) {
  if (!title || typeof title !== 'string') return '';

  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' '); // Normalize whitespace
}

/**
 * Check if a book with similar title already exists in Airtable
 * @param {string} title - Book title to check
 * @returns {Promise<Object>} { isDuplicate: boolean, matchedRecords: Array }
 */
async function checkDuplicate(title) {
  if (!title) {
    return {
      isDuplicate: false,
      matchedRecords: []
    };
  }

  try {
    // Initialize Airtable
    const base = new Airtable({
      apiKey: process.env.AIRTABLE_API_KEY
    }).base(process.env.AIRTABLE_BASE_ID);

    const normalizedTitle = normalizeTitle(title);
    const matchedRecords = [];

    // Query all books (we'll filter client-side for fuzzy matching)
    await base('Table 1').select({
      maxRecords: 100,
      view: "Grid view"
    }).eachPage(function page(records, fetchNextPage) {
      records.forEach(record => {
        const recordTitle = record.get('Title');
        if (recordTitle) {
          const normalizedRecordTitle = normalizeTitle(recordTitle);

          // Check for exact normalized match
          if (normalizedRecordTitle === normalizedTitle) {
            matchedRecords.push({
              id: record.id,
              title: recordTitle,
              authors: record.get('Author(s)'),
              shelf: record.get('Tags') ? record.get('Tags')[0] : null
            });
          }
        }
      });

      fetchNextPage();
    });

    return {
      isDuplicate: matchedRecords.length > 0,
      matchedRecords
    };

  } catch (error) {
    console.error('Error checking for duplicates:', error);
    // Don't fail the whole operation if duplicate check fails
    return {
      isDuplicate: false,
      matchedRecords: [],
      error: error.message
    };
  }
}

module.exports = {
  checkDuplicate
};
