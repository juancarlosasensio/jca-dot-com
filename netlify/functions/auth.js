const { validateToken, createAuthCookie } = require('./_shared/auth');

/**
 * Authentication endpoint - validates admin token and sets auth cookie
 * POST /auth with form data: { token: "xxx" }
 * Redirects back to /add-book/ with success/failure query param
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
    // Parse form data
    const formData = await req.formData();
    const token = formData.get('token');

    // Validate token
    if (!token) {
      return new Response(null, {
        status: 302,
        headers: {
          'Location': '/add-book/?auth=failed&error=missing'
        }
      });
    }

    const isValid = validateToken(token);

    if (isValid) {
      // Token is valid - set auth cookie and redirect
      return new Response(null, {
        status: 302,
        headers: {
          'Location': '/add-book/?auth=success',
          'Set-Cookie': createAuthCookie(token)
        }
      });
    } else {
      // Token is invalid - redirect with error
      return new Response(null, {
        status: 302,
        headers: {
          'Location': '/add-book/?auth=failed&error=invalid'
        }
      });
    }

  } catch (error) {
    console.error('Auth error:', error);
    return new Response(null, {
      status: 302,
      headers: {
        'Location': '/add-book/?auth=failed&error=server'
      }
    });
  }
}

export const config = {
  path: '/auth'
};
