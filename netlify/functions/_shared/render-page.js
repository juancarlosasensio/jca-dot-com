/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
  if (!text) return '';

  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };

  return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Render HTML page with consistent layout
 * @param {Object} options - Page options
 * @param {string} options.title - Page title
 * @param {string} options.content - Page content (HTML)
 * @param {number} options.statusCode - HTTP status code (default: 200)
 * @returns {Response} Netlify function response
 */
function renderPage({ title, content, statusCode = 200 }) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="/css/global.css">
  <style>
    .page-container {
      max-width: 50rem;
      margin-inline: auto;
      padding: var(--space-m, 1rem);
    }
    .flow > * + * {
      margin-top: var(--flow-space, 1rem);
    }
    .alert {
      padding: var(--space-s, 0.75rem);
      border-radius: var(--radius-s, 0.2rem);
      border: 1px solid;
      margin-block: var(--space-m, 1rem);
    }
    .alert.success {
      background: var(--color-dark-glare, #2d2816);
      border-color: var(--color-primary, #fccd26);
      color: var(--color-light, #fafafa);
    }
    .alert.error {
      background: var(--color-dark, #050505);
      border-color: #e74c3c;
      color: #e74c3c;
    }
    .alert.warning {
      background: var(--color-dark-glare, #2d2816);
      border-color: #f39c12;
      color: #f39c12;
    }
    .cluster {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-s, 0.75rem);
      align-items: center;
    }
    .button {
      display: inline-block;
      padding: 0.5em 1em;
      background: var(--color-primary, #fccd26);
      color: var(--color-dark, #050505);
      text-decoration: none;
      border-radius: var(--radius-s, 0.2rem);
      border: none;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    .button:hover {
      opacity: 0.9;
    }
    .button.secondary {
      background: transparent;
      color: var(--color-light, #fafafa);
      border: 1px solid var(--color-mid, grey);
    }
    .preview-cover {
      max-width: 200px;
      height: auto;
      border-radius: var(--radius-s, 0.2rem);
      margin-block: var(--space-m, 1rem);
    }
    form > * + * {
      margin-top: var(--flow-space, 1rem);
    }
    label {
      display: block;
      line-height: 1.2;
      font-weight: 600;
      margin-bottom: 0.25rem;
    }
    input[type="text"],
    input[type="url"] {
      width: 100%;
      padding: 0.5em 0.8em;
      border-radius: var(--radius-s, 0.2rem);
      border: 1px solid var(--color-mid, grey);
      background: var(--color-dark, #050505);
      color: var(--color-light, #fafafa);
      font-size: 1rem;
    }
    input[readonly] {
      opacity: 0.7;
      cursor: not-allowed;
    }
  </style>
</head>
<body>
  <div class="page-container flow">
    ${content}
  </div>
</body>
</html>`;

  return new Response(html, {
    status: statusCode,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Security-Policy': "default-src 'self'; img-src 'self' https:; style-src 'self' 'unsafe-inline'",
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    }
  });
}

/**
 * Render error page
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 500)
 * @returns {Response} Netlify function response
 */
function renderError(message, statusCode = 500) {
  const content = `
    <a href="/add-book/">← Back to Add Book</a>
    <h1>Error</h1>
    <div class="alert error" role="alert">
      ${escapeHtml(message)}
    </div>
    <p>Please try again or contact support if the problem persists.</p>
  `;

  return renderPage({
    title: 'Error',
    content,
    statusCode
  });
}

module.exports = {
  renderPage,
  renderError,
  escapeHtml
};
