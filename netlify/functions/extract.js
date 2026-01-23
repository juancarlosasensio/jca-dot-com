const { requireAuth } = require('./_shared/auth');
const { validateUrl } = require('./_shared/validate-url');
const { extractMetadata } = require('./_shared/extract-metadata');
const { checkDuplicate } = require('./_shared/check-duplicate');
const { renderPage, renderError, escapeHtml } = require('./_shared/render-page');

const PLACEHOLDER_IMAGE = '/images/book-placeholder.svg';

/**
 * Extract metadata from book URL and render preview/edit page
 * POST /extract with form data: { url: "https://..." }
 * Returns HTML page with editable form
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
    const url = formData.get('url');

    // Validate URL format
    const urlValidation = validateUrl(url);
    if (!urlValidation.valid) {
      return renderError(urlValidation.error, 400);
    }

    // Extract metadata from URL
    const metadata = await extractMetadata(url);

    // Check for duplicates
    const duplicateCheck = await checkDuplicate(metadata.title);

    // Use placeholder if no cover image found
    const coverImage = metadata.coverImage || PLACEHOLDER_IMAGE;

    // Build duplicate warning HTML
    let duplicateWarningHtml = '';
    if (duplicateCheck.isDuplicate) {
      const matchedTitles = duplicateCheck.matchedRecords
        .map(record => `<li>${escapeHtml(record.title)} by ${escapeHtml(record.authors || 'Unknown')}</li>`)
        .join('');

      duplicateWarningHtml = `
        <div class="alert warning" role="alert">
          ⚠️ <strong>Warning:</strong> This book may already be in your library:
          <ul>${matchedTitles}</ul>
          You can still add it if this is a different edition or you want a duplicate.
        </div>
      `;
    }

    // Build manual review notice if needed
    let manualReviewHtml = '';
    if (metadata.needsManualReview) {
      manualReviewHtml = `
        <div class="alert warning" role="alert">
          ℹ️ <strong>Note:</strong> Some information could not be automatically extracted.
          Please review and fill in the fields below manually.
        </div>
      `;
    }

    // Build the preview/edit form
    const content = `
      <a href="/add-book/">← Start Over</a>

      <h1>Review Book Information</h1>

      ${manualReviewHtml}
      ${duplicateWarningHtml}

      <form action="/.netlify/functions/create" method="POST" class="flow">
        <div>
          <label for="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value="${escapeHtml(metadata.title)}"
            required
            placeholder="Enter book title"
          >
        </div>

        <div>
          <label for="authors">Author(s) *</label>
          <input
            type="text"
            id="authors"
            name="authors"
            value="${escapeHtml(metadata.authors)}"
            required
            placeholder="Enter author name(s)"
          >
        </div>

        <div>
          <label for="coverImage">Cover Image URL</label>
          <input
            type="url"
            id="coverImage"
            name="coverImage"
            value="${escapeHtml(coverImage)}"
            placeholder="https://example.com/cover.jpg"
          >
          <small style="display: block; margin-top: 0.25rem; color: var(--color-mid);">
            Leave empty to use placeholder image
          </small>
        </div>

        <div>
          <label for="shelf">Shelf</label>
          <input
            type="text"
            id="shelf"
            name="shelf"
            value="Queued"
            readonly
          >
        </div>

        ${coverImage ? `
        <div>
          <p><strong>Cover Preview:</strong></p>
          <img src="${escapeHtml(coverImage)}" alt="Book cover preview" class="preview-cover" loading="lazy">
        </div>
        ` : ''}

        <div class="cluster">
          <button type="submit" class="button">Add to Library</button>
          <a href="/add-book/" class="button secondary">Cancel</a>
        </div>
      </form>

      <details style="margin-top: 2rem;">
        <summary style="cursor: pointer;">Extraction details</summary>
        <ul style="margin-top: 0.5rem; font-size: 0.875rem; color: var(--color-mid);">
          <li>Source: ${escapeHtml(metadata.source || url)}</li>
          <li>Confidence: ${escapeHtml(metadata.confidence)}</li>
          ${metadata.error ? `<li>Error: ${escapeHtml(metadata.error)}</li>` : ''}
        </ul>
      </details>
    `;

    return renderPage({
      title: 'Review Book - Add to Library',
      content
    });

  } catch (error) {
    console.error('Extract error:', error);

    if (error.statusCode === 401) {
      return new Response(null, {
        status: 302,
        headers: {
          'Location': '/add-book/?auth=failed&error=expired'
        }
      });
    }

    return renderError(error.message || 'Failed to extract book information', 500);
  }
}

export const config = {
  path: '/extract'
};
