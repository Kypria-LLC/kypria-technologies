module.exports = {
  facebook: {
    appId: process.env.FB_APP_ID,
    appSecret: process.env.FB_APP_SECRET,
    pageId: process.env.FB_PAGE_ID,
    pageAccessToken: process.env.PAGE_ACCESS_TOKEN,
    webhookVerifyToken: process.env.FB_WEBHOOK_VERIFY_TOKEN || 'divine_trinity_webhook_2025',
    redirectUri: 'https://kypriatechnologies.org/auth/callback',
    scopes: ['email', 'public_profile']
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    prices: {
      oracleSession: { amount: 500, currency: 'usd', name: 'Premium Oracle Session' }
    }
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4',
    maxTokens: 500,
    temperature: 0.85
  },
  redis: {
    url: process.env.REDIS_URL,
    ttl: 86400
  },
  deities: {
    zeus: { name: 'Zeus', emoji: '⚡', systemPrompt: 'You are Zeus. Speak with commanding authority.' },
    aphrodite: { name: 'Aphrodite', emoji: '💜', systemPrompt: 'You are Aphrodite. Speak with warmth.' },
    lifesphere: { name: 'Lifesphere', emoji: '🌿', systemPrompt: 'You are Lifesphere. Speak with gentle wisdom.' }
  },
  features: {
    premiumEnabled: true,
    analyticsEnabled: true
  },
  urls: {
    site: 'https://kypriatechnologies.org',
    dashboard: 'https://kypriatechnologies.org/dashboard'
  }
};
