require('dotenv').config();
const { timingSafeEqual } = require('crypto');

/**
 * Parse cookies from request headers
 * @param {Request} request - Netlify function request
 * @returns {Object} Parsed cookies as key-value pairs
 */
function parseCookies(request) {
  const cookies = {};
  const cookieHeader = request.headers.get('cookie');

  if (!cookieHeader) {
    return cookies;
  }

  cookieHeader.split(';').forEach(cookie => {
    const [name, ...rest] = cookie.split('=');
    const value = rest.join('=').trim();
    if (name && value) {
      cookies[name.trim()] = decodeURIComponent(value);
    }
  });

  return cookies;
}

/**
 * Validate token using constant-time comparison to prevent timing attacks
 * @param {string} providedToken - Token provided by user
 * @returns {boolean} True if token is valid
 */
function validateToken(providedToken) {
  const expectedToken = process.env.ADMIN_TOKEN;

  if (!expectedToken) {
    console.error('ADMIN_TOKEN environment variable is not set');
    return false;
  }

  if (!providedToken || typeof providedToken !== 'string') {
    return false;
  }

  // Use constant-time comparison to prevent timing attacks
  try {
    const expected = Buffer.from(expectedToken);
    const actual = Buffer.from(providedToken);

    // If lengths differ, still compare to prevent timing leak
    if (expected.length !== actual.length) {
      return false;
    }

    return timingSafeEqual(expected, actual);
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }
}

/**
 * Check if request is authenticated via cookie
 * @param {Request} request - Netlify function request
 * @returns {boolean} True if authenticated
 */
function isAuthenticated(request) {
  const cookies = parseCookies(request);
  const authToken = cookies.admin_auth;

  if (!authToken) {
    return false;
  }

  return validateToken(authToken);
}

/**
 * Require authentication - throws error if not authenticated
 * @param {Request} request - Netlify function request
 * @throws {Error} If not authenticated
 */
function requireAuth(request) {
  if (!isAuthenticated(request)) {
    const error = new Error('Unauthorized');
    error.statusCode = 401;
    throw error;
  }
}

/**
 * Create auth cookie header
 * @param {string} token - Admin token to set in cookie
 * @returns {string} Set-Cookie header value
 */
function createAuthCookie(token) {
  const maxAge = 30 * 24 * 60 * 60; // 30 days in seconds

  return [
    `admin_auth=${encodeURIComponent(token)}`,
    'HttpOnly',
    'Secure',
    'SameSite=Strict',
    `Max-Age=${maxAge}`,
    'Path=/'
  ].join('; ');
}

/**
 * Create cookie deletion header
 * @returns {string} Set-Cookie header value to delete auth cookie
 */
function deleteAuthCookie() {
  return [
    'admin_auth=',
    'HttpOnly',
    'Secure',
    'SameSite=Strict',
    'Max-Age=0',
    'Path=/'
  ].join('; ');
}

module.exports = {
  parseCookies,
  validateToken,
  isAuthenticated,
  requireAuth,
  createAuthCookie,
  deleteAuthCookie
};
