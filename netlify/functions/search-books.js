const getBookData = (book) => {
  const bookData = {
    coverImage: {src: '', alt: '', cover_i: ''},
    title: '',
    author: '',
    year: ''
  }
  // If a cover ID exists, use it to create the image URL
  if (book.cover_i) {
    bookData.coverImage.cover_i = book.cover_i;
    bookData.coverImage.src = `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`;
    bookData.coverImage.alt = `${book.title} cover`;
  } else {
    // Otherwise, use a placeholder image
    bookData.coverImage.cover_i = 'no-cover';
    bookData.coverImage.src = 'https://openlibrary.org/images/icons/avatar_book-lg.png';
    bookData.coverImage.alt = 'No book cover available';
  }
  bookData.title = book.title ? book.title : 'No Title Available';
  bookData.author = book.author_name ? book.author_name.join(', ') : 'Unknown Author';
  bookData.year = book.first_publish_year ? book.first_publish_year : 'Year not available';

  return bookData;
}

export default async function handler(req, context) {
  const { query, offset } = context.params;
  const decodedQuery = decodeURIComponent(query);
  const limit = 10;

  try {
    const apiUrl = `https://openlibrary.org/search.json?q=${decodedQuery}&fields=title,author_name,first_publish_year,cover_i&limit=${limit}&offset=${offset}&mode=everything`;
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
          const bookData = getBookData(book)
          results.push(bookData);
          return;
        });

    // Return the results as JSON
    return new Response(JSON.stringify({ results, numFound: data.numFound }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });    
    } else if (data.docs && data.docs.length === 0) { 
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      throw new Error('No books found');
    }
  } catch (error) {
    // If an error occurs during the fetch request, alert the user
    return new Response(error.message, {
      status: 204,
      headers: { 'Content-Type': 'text/html' }
    })
  }
}

export const config = { path: "/search-books/:query/:offset" };
