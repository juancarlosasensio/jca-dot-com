const { parseHTML } = require('linkedom');
const { safeFetch } = require('./validate-url');

/**
 * Extract metadata from Open Library API
 * @param {string} url - Open Library URL
 * @returns {Promise<Object|null>} Extracted metadata or null
 */
async function extractFromOpenLibraryAPI(url) {
  try {
    // Extract book ID from URL
    // Format: https://openlibrary.org/books/OL123456M/book-title
    const match = url.match(/openlibrary\.org\/books\/([^\/]+)/);
    if (!match) return null;

    const bookId = match[1];
    const apiUrl = `https://openlibrary.org/books/${bookId}.json`;

    const response = await safeFetch(apiUrl);
    if (!response.ok) return null;

    const data = await response.json();

    // Extract title
    const title = data.title || null;

    // Extract authors - may need to fetch author details
    let authors = null;
    if (data.authors && data.authors.length > 0) {
      // Authors might be references, so just use the first one's key
      // For simplicity, we'll try to get the name from the by_statement
      authors = data.by_statement || null;
    }

    // Extract cover image
    let coverImage = null;
    if (data.covers && data.covers.length > 0) {
      const coverId = data.covers[0];
      coverImage = `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`;
    }

    return {
      title,
      authors,
      coverImage,
      source: 'Open Library API',
      confidence: 'high'
    };

  } catch (error) {
    console.error('Error extracting from Open Library API:', error);
    return null;
  }
}

/**
 * Extract Open Graph metadata from HTML
 * @param {Document} document - Parsed HTML document
 * @returns {Object} Extracted metadata
 */
function extractOpenGraph(document) {
  const metadata = {
    title: null,
    authors: null,
    coverImage: null
  };

  // Get all meta tags with property starting with "og:"
  const ogTags = document.querySelectorAll('meta[property^="og:"]');

  ogTags.forEach(tag => {
    const property = tag.getAttribute('property');
    const content = tag.getAttribute('content');

    if (!content) return;

    switch (property) {
      case 'og:title':
        metadata.title = content;
        break;
      case 'og:image':
        metadata.coverImage = content;
        break;
      case 'og:description':
        // Try to extract author from description if not found elsewhere
        if (!metadata.authors) {
          const authorMatch = content.match(/by\s+([^,\.]+)/i);
          if (authorMatch) {
            metadata.authors = authorMatch[1].trim();
          }
        }
        break;
    }
  });

  return metadata;
}

/**
 * Extract Schema.org JSON-LD metadata
 * @param {Document} document - Parsed HTML document
 * @returns {Object} Extracted metadata
 */
function extractSchemaOrg(document) {
  const metadata = {
    title: null,
    authors: null,
    coverImage: null
  };

  // Find all JSON-LD script tags
  const scripts = document.querySelectorAll('script[type="application/ld+json"]');

  scripts.forEach(script => {
    try {
      const data = JSON.parse(script.textContent);

      // Handle both single objects and arrays
      const items = Array.isArray(data) ? data : [data];

      items.forEach(item => {
        // Look for Book type
        if (item['@type'] === 'Book' || (Array.isArray(item['@type']) && item['@type'].includes('Book'))) {
          if (item.name && !metadata.title) {
            metadata.title = item.name;
          }

          if (item.author && !metadata.authors) {
            if (typeof item.author === 'string') {
              metadata.authors = item.author;
            } else if (item.author.name) {
              metadata.authors = item.author.name;
            } else if (Array.isArray(item.author)) {
              metadata.authors = item.author
                .map(a => typeof a === 'string' ? a : a.name)
                .filter(Boolean)
                .join(', ');
            }
          }

          if (item.image && !metadata.coverImage) {
            if (typeof item.image === 'string') {
              metadata.coverImage = item.image;
            } else if (item.image.url) {
              metadata.coverImage = item.image.url;
            } else if (Array.isArray(item.image) && item.image.length > 0) {
              metadata.coverImage = typeof item.image[0] === 'string' ? item.image[0] : item.image[0].url;
            }
          }
        }
      });
    } catch (error) {
      // Invalid JSON, skip
    }
  });

  return metadata;
}

/**
 * Extract metadata from common HTML patterns
 * @param {Document} document - Parsed HTML document
 * @returns {Object} Extracted metadata
 */
function extractFromHTMLPatterns(document) {
  const metadata = {
    title: null,
    authors: null,
    coverImage: null
  };

  // Try to get title from various sources
  if (!metadata.title) {
    // Amazon product title
    const amazonTitle = document.querySelector('#productTitle');
    if (amazonTitle) {
      metadata.title = amazonTitle.textContent.trim();
    }
  }

  if (!metadata.title) {
    // Generic book title patterns
    const titleSelectors = [
      '.book-title',
      '.product-title',
      'h1[itemprop="name"]',
      'h1.title',
      '[data-testid="title"]'
    ];

    for (const selector of titleSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        metadata.title = element.textContent.trim();
        break;
      }
    }
  }

  if (!metadata.title) {
    // Fallback to page title
    const titleTag = document.querySelector('title');
    if (titleTag) {
      metadata.title = titleTag.textContent
        .replace(/\s*[-|:]\s*.+$/, '') // Remove site name
        .trim();
    }
  }

  // Try to get authors
  if (!metadata.authors) {
    // Amazon byline
    const amazonByline = document.querySelector('#bylineInfo');
    if (amazonByline) {
      const authorLink = amazonByline.querySelector('.author a, .contributorNameID');
      if (authorLink) {
        metadata.authors = authorLink.textContent.trim();
      }
    }
  }

  if (!metadata.authors) {
    // Generic author patterns
    const authorSelectors = [
      '.book-author',
      '.author-name',
      '[itemprop="author"]',
      '.contributor',
      '[data-testid="author"]'
    ];

    for (const selector of authorSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        metadata.authors = element.textContent.trim();
        break;
      }
    }
  }

  if (!metadata.authors) {
    // Try meta author tag
    const authorMeta = document.querySelector('meta[name="author"]');
    if (authorMeta) {
      metadata.authors = authorMeta.getAttribute('content');
    }
  }

  // Try to get cover image
  if (!metadata.coverImage) {
    // Amazon main image
    const amazonImage = document.querySelector('#imgBlkFront, #landingImage, #ebooksImgBlkFront');
    if (amazonImage) {
      metadata.coverImage = amazonImage.getAttribute('src') || amazonImage.getAttribute('data-src');
    }
  }

  if (!metadata.coverImage) {
    // Generic book cover patterns
    const imageSelectors = [
      '.book-cover img',
      '.product-image img',
      '[itemprop="image"]',
      '.cover-image',
      '[data-testid="cover-image"]'
    ];

    for (const selector of imageSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        metadata.coverImage = element.getAttribute('src') || element.getAttribute('data-src');
        break;
      }
    }
  }

  return metadata;
}

/**
 * Merge metadata from multiple sources, prioritizing non-null values
 * @param {...Object} metadataSources - Metadata objects to merge
 * @returns {Object} Merged metadata
 */
function mergeMetadata(...metadataSources) {
  const merged = {
    title: null,
    authors: null,
    coverImage: null
  };

  for (const source of metadataSources) {
    if (source.title && !merged.title) merged.title = source.title;
    if (source.authors && !merged.authors) merged.authors = source.authors;
    if (source.coverImage && !merged.coverImage) merged.coverImage = source.coverImage;
  }

  return merged;
}

/**
 * Determine confidence level based on extracted data
 * @param {Object} metadata - Extracted metadata
 * @returns {string} Confidence level: 'high', 'medium', or 'low'
 */
function determineConfidence(metadata) {
  const hasTitle = Boolean(metadata.title);
  const hasAuthors = Boolean(metadata.authors);
  const hasCover = Boolean(metadata.coverImage);

  if (hasTitle && hasAuthors && hasCover) return 'high';
  if (hasTitle && (hasAuthors || hasCover)) return 'medium';
  if (hasTitle) return 'low';
  return 'none';
}

/**
 * Sanitize extracted text
 * @param {string} text - Text to sanitize
 * @returns {string} Sanitized text
 */
function sanitize(text) {
  if (!text || typeof text !== 'string') return '';

  return text
    .trim()
    .substring(0, 1000) // Limit length
    .replace(/[<>]/g, ''); // Remove angle brackets
}

/**
 * Extract book metadata from URL
 * @param {string} url - URL to extract metadata from
 * @returns {Promise<Object>} Extracted metadata with confidence score
 */
async function extractMetadata(url) {
  try {
    // Special handling for Open Library - use API
    if (url.includes('openlibrary.org/books/')) {
      const apiData = await extractFromOpenLibraryAPI(url);
      if (apiData) {
        return {
          title: sanitize(apiData.title),
          authors: sanitize(apiData.authors),
          coverImage: apiData.coverImage,
          source: apiData.source,
          confidence: apiData.confidence,
          needsManualReview: false
        };
      }
    }

    // Fetch and parse HTML for other sites
    const response = await safeFetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const { document } = parseHTML(html);

    // Extract from multiple sources
    const ogMetadata = extractOpenGraph(document);
    const schemaMetadata = extractSchemaOrg(document);
    const htmlMetadata = extractFromHTMLPatterns(document);

    // Merge all metadata sources (priority: OG > Schema > HTML patterns)
    const merged = mergeMetadata(ogMetadata, schemaMetadata, htmlMetadata);

    // Sanitize and determine confidence
    const sanitized = {
      title: sanitize(merged.title),
      authors: sanitize(merged.authors),
      coverImage: merged.coverImage,
      source: url,
      confidence: determineConfidence(merged)
    };

    // Determine if manual review is needed
    sanitized.needsManualReview = sanitized.confidence === 'low' || sanitized.confidence === 'none';

    return sanitized;

  } catch (error) {
    console.error('Error extracting metadata:', error);

    return {
      title: '',
      authors: '',
      coverImage: '',
      source: url,
      confidence: 'none',
      needsManualReview: true,
      error: error.message
    };
  }
}

module.exports = {
  extractMetadata
};
