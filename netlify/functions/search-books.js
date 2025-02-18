export default async function handler(req, context) {
  const { query } = context.params;
  // Book Search functionality using the Open Library Search API
  try {
    // Construct the API URL for the Open Library Search API
    // const query = 'the lord of the rings';
    const apiUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`;

    // Fetch data from the API
    const response = await fetch(apiUrl);

    // If the response is not OK, throw an error
    if (!response.ok) {
      throw new Error(`An error occurred: ${response.statusText}`);
    }

    // Parse the API response as JSON
    const data = await response.json();
    const results = [];

    if (data.docs && data.docs.length > 0) {
         data.docs.forEach(book => {
            const bookData = {
              coverImage: {src: '', alt: ''},
              title: '',
              author: '',
              year: ''
            }
            // If a cover ID exists, use it to create the image URL
            if (book.cover_i) {
              bookData.coverImage.src = `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`;
              bookData.coverImage.alt = `${book.title} cover`;
            } else {
              // Otherwise, use a placeholder image
              bookData.coverImage.src = 'https://via.placeholder.com/80x120?text=No+Cover';
              bookData.coverImage.alt = 'No book cover available';
            }

            bookData.title = book.title ? book.title : 'No Title Available';
            bookData.author = book.author_name ? book.author_name.join(', ') : 'Unknown Author';
            bookData.year = book.first_publish_year ? book.first_publish_year : 'Year not available';

            results.push(bookData);
        });

      // Return the results as JSON
      return new Response(JSON.stringify(results), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });    
    } else {
      throw new Error('No books found');
    }
  } catch (error) {
    // If an error occurs during the fetch request, alert the user
    return new Response(error.message, {
      status: 500,
      headers: { 'Content-Type': 'text/html' }
    })
  }
}

export const config = { path: "/search-books/:query" };
