require('dotenv').config();

const Airtable = require('airtable');
const { AssetCache } = require("@11ty/eleventy-fetch");

// takes an airtable record and returns a javascript object with the fields I want
const createBookFromRecord = (record) => ({
    title: record.get('Title'),
    authors: record.get('Author(s)'),
    coverImage: record.get('coverImage'),
    shelf: record.get('Tags')[0]

  });

module.exports = async function() {
  // create a connection to airtable base
  var base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY}).base(process.env.AIRTABLE_BASE_ID);

  // set up an object we'll populate with data.
  const books = [];

  // any unique-to-our-app key will work as the argument to the AssetCache constructor
  const asset = new AssetCache("books");

  // check if the cache is fresh within the last day
  if (asset.isCacheValid("1h")) {
    // return cached data.
    return asset.getCachedValue();
  }

  try {
    await base('Table 1').select({
      maxRecords: 100,
      view: "Grid view",
      filterByFormula: "{isPublishable}"
    }).eachPage(function page(records, fetchNextPage) {
      // This function (`page`) will get called for each page of records.
      try {
        // sometimes a page comes back with no records, hence the optional chaining (?) operator
        records?.forEach(function(record) {
          if (record.get('Title')) {
            const book = createBookFromRecord(record);
            books.push(book)
          }

        });
      } catch (error) {
        console.log(error);
      }
        // To fetch the next page of records, call `fetchNextPage`.
        // If there are more records, `page` will get called again.
        // If there are no more records, the promise will resolve.
        fetchNextPage();
    });
    console.log("saving");

    console.log(books)

    await asset.save(books, "json");
    return books;

  } catch (err) {
    
    return asset.getCachedValue();
  }
};