// Facebook Data Deletion Callback — Netlify Function
// Zeus App (ID: 1161892008605801) | kypriatechnologies.org
// Compliant with Facebook Platform Policy §4.1

exports.handler = async (event, context) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Data Deletion Status | Kypria Technologies</title></head>
<body style="font-family:sans-serif;max-width:600px;margin:40px auto;padding:20px">
  <h1>Data Deletion Request</h1>
  <p>Kypria Technologies does not store personal Facebook user data on our servers.</p>
  <p>If you used Facebook Login with Zeus AI, any session data has been cleared.</p>
  <p>For questions: <a href="mailto:admin@kypriatechnologies.org">admin@kypriatechnologies.org</a></p>
</body></html>`,
    };
  }

  if (event.httpMethod === 'POST') {
    try {
      const crypto = require('crypto');
      const body = event.body || '';
      const params = new URLSearchParams(body);
      const signedRequest = params.get('signed_request');

      if (!signedRequest) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Missing signed_request parameter' }),
        };
      }

      const [encodedSig, payload] = signedRequest.split('.');
      const data = JSON.parse(
        Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
      );

      const userId = data.user_id || 'unknown';

      const confirmationCode = crypto
        .createHash('sha256')
        .update(`${userId}-${Date.now()}-kypria-zeus`)
        .digest('hex')
        .substring(0, 16);

      console.log(`[Data Deletion] Request received. Confirmation: ${confirmationCode}`);

      // Facebook-required response shape
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          url: `https://kypriatechnologies.org/data-deletion?code=${confirmationCode}`,
          confirmation_code: confirmationCode,
        }),
      };
    } catch (err) {
      console.error('[Data Deletion] Error:', err.message);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Internal server error' }),
      };
    }
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' }),
  };
};
