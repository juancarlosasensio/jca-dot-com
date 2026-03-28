require('dotenv').config();
const Airtable = require('airtable');
const { requireAuth } = require('./_shared/auth');
const { renderPage, renderError, escapeHtml } = require('./_shared/render-page');

const PLACEHOLDER_IMAGE = '/images/book-placeholder.svg';

/**
 * Create book record in Airtable
 * POST /create with form data: { title, authors, coverImage, shelf }
 * Returns HTML success page
 */
export default async function handler(req, context) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', {
      status: 405,
      headers: { 'Allow': 'POST' }
    });
  }

  try {
    // Require authentication
    requireAuth(req);

    // Parse form data
    const formData = await req.formData();
    const title = formData.get('title');
    const authors = formData.get('authors');
    const coverImage = formData.get('coverImage');
    const shelf = formData.get('shelf') || 'Queued';

    // Validate required fields
    if (!title || !title.trim()) {
      return renderError('Title is required', 422);
    }

    if (!authors || !authors.trim()) {
      return renderError('Author(s) is required', 422);
    }

    // Sanitize inputs
    const sanitizedTitle = title.trim().substring(0, 1000);
    const sanitizedAuthors = authors.trim().substring(0, 1000);
    const sanitizedCoverImage = (coverImage && coverImage.trim()) || PLACEHOLDER_IMAGE;
    const sanitizedShelf = shelf.trim().substring(0, 100);

    // Initialize Airtable
    const base = new Airtable({
      apiKey: process.env.AIRTABLE_API_KEY
    }).base(process.env.AIRTABLE_BASE_ID);

    // Create record in Airtable
    const record = await base('Table 1').create({
      'Title': sanitizedTitle,
      'Author(s)': sanitizedAuthors,
      'coverImage': sanitizedCoverImage,
      'Tags': [sanitizedShelf],
      'isPublishable': true
    });

    // Success! Render success page
    const content = `
      <h1>✓ Book Added Successfully!</h1>

      <div class="alert success" role="alert">
        <strong>${escapeHtml(sanitizedTitle)}</strong> has been added to your library.
      </div>

      <div class="flow">
        <h2>Book Details</h2>

        <dl>
          <dt><strong>Title:</strong></dt>
          <dd>${escapeHtml(sanitizedTitle)}</dd>

          <dt style="margin-top: 0.5rem;"><strong>Author(s):</strong></dt>
          <dd>${escapeHtml(sanitizedAuthors)}</dd>

          <dt style="margin-top: 0.5rem;"><strong>Shelf:</strong></dt>
          <dd>${escapeHtml(sanitizedShelf)}</dd>

          ${sanitizedCoverImage !== PLACEHOLDER_IMAGE ? `
          <dt style="margin-top: 0.5rem;"><strong>Cover:</strong></dt>
          <dd>
            <img src="${escapeHtml(sanitizedCoverImage)}" alt="Book cover" class="preview-cover" loading="lazy">
          </dd>
          ` : ''}
        </dl>

        <div class="cluster" style="margin-top: 2rem;">
          <a href="/add-book/" class="button">Add Another Book</a>
          <a href="/books/" class="button secondary">View Library</a>
        </div>

        <details style="margin-top: 2rem;">
          <summary style="cursor: pointer;">Technical details</summary>
          <p style="margin-top: 0.5rem; font-size: 0.875rem; color: var(--color-mid);">
            Record ID: ${escapeHtml(record.id)}
          </p>
        </details>
      </div>
    `;

    return renderPage({
      title: 'Book Added Successfully',
      content
    });

  } catch (error) {
    console.error('Create error:', error);

    if (error.statusCode === 401) {
      return new Response(null, {
        status: 302,
        headers: {
          'Location': '/add-book/?auth=failed&error=expired'
        }
      });
    }

    // Check for specific Airtable errors
    if (error.statusCode === 401 || error.statusCode === 403) {
      return renderError('Airtable authentication failed. Please check your API credentials.', 500);
    }

    if (error.statusCode === 404) {
      return renderError('Airtable base or table not found. Please check your configuration.', 500);
    }

    if (error.statusCode === 422) {
      return renderError(`Airtable validation error: ${error.message}`, 422);
    }

    return renderError(error.message || 'Failed to add book to library', 500);
  }
}

export const config = {
  path: '/create'
};
