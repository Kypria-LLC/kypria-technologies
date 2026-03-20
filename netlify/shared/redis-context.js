/**
 * Redis Context Module - Stub Implementation
 * Provides user context management functions
 * Note: This is a stub implementation for build compatibility
 */

// In-memory storage for development/fallback
const contextStore = new Map();

/**
 * Get user context from storage
 * @param {string} userId - User ID
 * @returns {Promise<object|null>} User context or null
 */
async function getUserContext(userId) {
  try {
    // Return from memory store (or would query Redis in production)
    return contextStore.get(userId) || null;
  } catch (error) {
    console.error('Error getting user context:', error);
    return null;
  }
}

/**
 * Set user context in storage
 * @param {string} userId - User ID
 * @param {object} context - User context data
 * @returns {Promise<void>}
 */
async function setUserContext(userId, context) {
  try {
    // Store in memory (or would save to Redis in production)
    contextStore.set(userId, context);
  } catch (error) {
    console.error('Error setting user context:', error);
  }
}

/**
 * Mock Redis client for compatibility
 */
const redis = {
  async zadd(key, score, value) {
    console.log(`[Redis Mock] zadd: ${key}`);
    return 1;
  },
  async incrbyfloat(key, increment) {
    console.log(`[Redis Mock] incrbyfloat: ${key} by ${increment}`);
    return increment;
  }
};

module.exports = {
  getUserContext,
  setUserContext,
  redis
};
