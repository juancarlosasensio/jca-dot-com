const { isAuthenticated } = require('./_shared/auth');

/**
 * Check authentication status endpoint
 * GET /check-auth
 * Returns JSON: { authenticated: boolean }
 */
export default async function handler(req, context) {
  // Only accept GET requests
  if (req.method !== 'GET') {
    return new Response('Method Not Allowed', {
      status: 405,
      headers: { 'Allow': 'GET' }
    });
  }

  try {
    const authenticated = isAuthenticated(req);

    return new Response(JSON.stringify({ authenticated }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache'
      }
    });

  } catch (error) {
    console.error('Check auth error:', error);

    return new Response(JSON.stringify({ authenticated: false }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    });
  }
}

export const config = {
  path: '/check-auth'
};
