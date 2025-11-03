/**
 * M2M Token Manager
 * Handles Auth0 token acquisition and caching
 */

const axios = require('axios');
const AUTH0_CONFIG = require('./auth0-config');

class TokenManager {
  constructor() {
    this.token = null;
    this.expiresAt = null;
  }
  
  async getToken() {
    if (this.token && this.expiresAt && Date.now() < this.expiresAt) {
      return this.token;
    }
    
    const response = await axios.post(
      `https://${AUTH0_CONFIG.domain}/oauth/token`,
      {
        client_id: AUTH0_CONFIG.clientId,
        client_secret: AUTH0_CONFIG.clientSecret,
        audience: AUTH0_CONFIG.audience,
        grant_type: 'client_credentials'
      }
    );
    
    this.token = response.data.access_token;
    this.expiresAt = Date.now() + (response.data.expires_in * 1000);
    
    return this.token;
  }
}

module.exports = new TokenManager();
