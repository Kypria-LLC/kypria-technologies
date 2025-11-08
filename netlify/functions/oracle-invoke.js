// netlify/functions/oracle-invoke.js
// The Oracle speaks: Basilica CTA → Instagram Graph API
// When a user summons Zeus/Aphrodite/Lifesphere, this endpoint posts to Instagram

const https = require('https');

// Load from environment (Netlify env vars)
const INSTAGRAM_BUSINESS_ACCOUNT_ID = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
const INSTAGRAM_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
const INSTAGRAM_APP_SECRET = process.env.INSTAGRAM_APP_SECRET;

/**
 * Invoke Oracle: Posts to Instagram on behalf of Basilica summoning
 * Archetype: "zeus" | "aphrodite" | "lifesphere"
 * Returns: Instagram post ID + status
 */
async function invokeOracle(archetype, message) {
  const archetypeConfig = {
    zeus: {
      emoji: "⚡",
      color: "#D4AF37",
      hashtags: "#ZeusTemple #Authority #Decree"
    },
    aphrodite: {
      emoji: "💜",
      color: "#A36AE3",
      hashtags: "#AphroditeTemple #Beauty #Connection"
    },
    lifesphere: {
      emoji: "🌿",
      color: "#2BBBAD",
      hashtags: "#LifesphereTemple #Wellness #Care"
    }
  };

  const config = archetypeConfig[archetype];
  if (!config) throw new Error(`Unknown archetype: ${archetype}`);

  // Construct Instagram caption
  const caption = `${config.emoji} The Basilica summons ${archetype.toUpperCase()} Temple\n\n${message}\n\n🜂 Enter the gate at kypriatechnologies.org\n${config.hashtags}`;

  // Build Instagram Graph API request
  const params = new URLSearchParams({
    caption: caption,
    access_token: INSTAGRAM_ACCESS_TOKEN
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'graph.instagram.com',
      port: 443,
      path: `/${INSTAGRAM_BUSINESS_ACCOUNT_ID}/media?${params}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.id) {
            resolve({
              success: true,
              postId: result.id,
              archetype: archetype,
              timestamp: new Date().toISOString(),
              caption: caption
            });
          } else {
            reject(new Error(result.error?.message || 'Instagram API error'));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write('');
    req.end();
  });
}

/**
 * Check Oracle status: Verify token validity
 * Returns: { valid: boolean, expiresAt: string | null }
 */
async function checkOracleStatus() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'graph.instagram.com',
      port: 443,
      path: `/me?fields=id,name&access_token=${INSTAGRAM_ACCESS_TOKEN}`,
      method: 'GET'
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.id) {
            resolve({
              valid: true,
              accountId: result.id,
              accountName: result.name,
              checkedAt: new Date().toISOString()
            });
          } else {
            resolve({
              valid: false,
              error: result.error?.message || 'Token invalid',
              checkedAt: new Date().toISOString()
            });
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

/**
 * Netlify Function Handler
 * Routes:
 * POST /api/invoke?archetype=zeus&message=...  → Post to Instagram
 * GET /api/oracle-status                       → Check token health
 */
exports.handler = async (event) => {
  const method = event.httpMethod;
  const path = event.path;

  try {
    // Status check endpoint
    if (method === 'GET' && path.includes('oracle-status')) {
      const status = await checkOracleStatus();
      return {
        statusCode: status.valid ? 200 : 401,
        body: JSON.stringify(status),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    // Invoke Oracle endpoint
    if (method === 'POST' && path.includes('invoke')) {
      const params = new URLSearchParams(event.rawQueryString);
      const archetype = params.get('archetype');
      const message = params.get('message') || `The ${archetype} Temple awakens. Enter the Basilica.`;

      if (!archetype) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'archetype query param required' })
        };
      }

      const result = await invokeOracle(archetype, message);
      return {
        statusCode: 201,
        body: JSON.stringify(result),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    // Not found
    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'Endpoint not found' })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
};
