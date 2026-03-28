const { URL } = require('url');

/**
 * Validate URL and prevent Server-Side Request Forgery (SSRF) attacks
 * @param {string} urlString - URL to validate
 * @returns {Object} { valid: boolean, url: URL|null, error: string|null }
 */
function validateUrl(urlString) {
  // Check if URL is provided
  if (!urlString || typeof urlString !== 'string') {
    return {
      valid: false,
      url: null,
      error: 'URL is required'
    };
  }

  // Parse URL
  let url;
  try {
    url = new URL(urlString);
  } catch (error) {
    return {
      valid: false,
      url: null,
      error: 'Invalid URL format'
    };
  }

  // Only allow HTTP and HTTPS protocols
  if (!['http:', 'https:'].includes(url.protocol)) {
    return {
      valid: false,
      url: null,
      error: 'Only HTTP and HTTPS URLs are allowed'
    };
  }

  // Extract hostname for validation
  const hostname = url.hostname.toLowerCase();

  // Block localhost
  if (hostname === 'localhost' || hostname === '0.0.0.0') {
    return {
      valid: false,
      url: null,
      error: 'Cannot fetch from localhost'
    };
  }

  // Block loopback addresses (127.0.0.0/8)
  if (/^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
    return {
      valid: false,
      url: null,
      error: 'Cannot fetch from loopback addresses'
    };
  }

  // Block private IPv4 ranges
  // 10.0.0.0/8
  if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
    return {
      valid: false,
      url: null,
      error: 'Cannot fetch from private network'
    };
  }

  // 172.16.0.0/12
  if (/^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
    return {
      valid: false,
      url: null,
      error: 'Cannot fetch from private network'
    };
  }

  // 192.168.0.0/16
  if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
    return {
      valid: false,
      url: null,
      error: 'Cannot fetch from private network'
    };
  }

  // Block link-local addresses (169.254.0.0/16)
  // This includes AWS/GCP/Azure metadata endpoints
  if (/^169\.254\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
    return {
      valid: false,
      url: null,
      error: 'Cannot fetch from link-local addresses'
    };
  }

  // Block IPv6 loopback and local addresses
  if (hostname === '::1' || hostname.startsWith('fe80:')) {
    return {
      valid: false,
      url: null,
      error: 'Cannot fetch from local IPv6 addresses'
    };
  }

  // URL is valid
  return {
    valid: true,
    url: url,
    error: null
  };
}

/**
 * Fetch URL with safety checks and timeout
 * @param {string} urlString - URL to fetch
 * @param {number} timeoutMs - Timeout in milliseconds (default: 10000)
 * @returns {Promise<Response>} Fetch response
 */
async function safeFetch(urlString, timeoutMs = 10000) {
  // Validate URL first
  const validation = validateUrl(urlString);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(urlString, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BookBot/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Encoding': 'gzip, deflate',
      }
    });

    clearTimeout(timeout);
    return response;

  } catch (error) {
    clearTimeout(timeout);

    if (error.name === 'AbortError') {
      throw new Error('Request timeout - URL took too long to respond');
    }

    throw new Error(`Failed to fetch URL: ${error.message}`);
  }
}

module.exports = {
  validateUrl,
  safeFetch
};
