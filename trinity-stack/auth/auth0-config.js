/**
 * Auth0 M2M Authentication Configuration
 * Trinity Monetization Stack - Machine-to-Machine Auth
 */

const AUTH0_CONFIG = {
  domain: process.env.AUTH0_DOMAIN || 'dev-tulns3uf2nt6jpcf.us.auth0.com',
  clientId: process.env.AUTH0_CLIENT_ID || '',
  clientSecret: process.env.AUTH0_CLIENT_SECRET || '',
  audience: process.env.AUTH0_AUDIENCE || '',
  
  // Token caching settings
  tokenCache: {
    enabled: true,
    ttl: 3600 // 1 hour
  },
  
  // API scopes
  scopes: [
    'read:premium_content',
    'write:user_metadata',
    'manage:subscriptions'
  ]
};

module.exports = AUTH0_CONFIG;
