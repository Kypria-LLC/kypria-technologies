/**
 * Stripe Integration Configuration
 * Trinity Monetization Stack - Payment Processing
 */

const STRIPE_CONFIG = {
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
  secretKey: process.env.STRIPE_SECRET_KEY || '',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  
  products: {
    premiumOracle: {
      name: '⚡ Premium Oracle Session',
      description: '30 minutes of divine connection',
      price: 500, // $5.00 in cents
    },
    extendedAccess: {
      name: '🏛️ Extended Trinity Access',
      description: 'Monthly subscription to premium features',
      price: 2000, // $20.00 in cents
    }
  },
  
  successUrl: 'https://kypriatechnologies.org/payment-success?session_id={CHECKOUT_SESSION_ID}',
  cancelUrl: 'https://kypriatechnologies.org/payment-canceled'
};

module.exports = STRIPE_CONFIG;
