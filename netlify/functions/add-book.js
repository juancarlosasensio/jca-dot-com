var Airtable = require('airtable');
var base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY}).base(process.env.AIRTABLE_BASE_ID);

export default async function handler(req, context) {
  const { title, author, coverImage } = context.params;
  console.log(title, author, coverImage);

  const bookRecord = {
    "fields": {
      "Title": `${decodeURIComponent(title)}`,
      "Author(s)": `${decodeURIComponent(author)}`,
      "Tags": ["Queued"]
    }
  }
  
  if (coverImage && coverImage !== 'no-cover') {
    bookRecord.fields.coverImage = `${decodeURIComponent(coverImage)}`;
  }

  console.log(bookRecord);

  try {
    base('Table 1').create([bookRecord], function(err, records) {
      if (err) {
        console.log(err)
        throw new Error(err);
      }
      console.log('REcord created successfully', records)
        // Return the results as JSON
      return new Response(JSON.stringify(records), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    });
  } catch (error) {
    console.log(error, error.message)
    return new Response(error.message, {
      status: 204,
      headers: { 'Content-Type': 'text/html' }
    })
  }
}

export const config = { path: "/add-book/:title/:author/:coverImage" };