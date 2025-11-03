# Stripe Integration Guide

## Prerequisites

- Stripe account (https://stripe.com)
- Stripe CLI installed (optional, for webhook testing)

## Setup Steps

### 1. Create Stripe Products

1. Log in to Stripe Dashboard
2. Navigate to Products
3. Create products matching `stripe-config.js`:
   - Premium Oracle Session ($5.00)
   - Extended Trinity Access ($20.00/month)

### 2. Configure Webhooks

1. Go to Developers > Webhooks
2. Add endpoint: `https://kypriatechnologies.org/.netlify/functions/stripe-webhook`
3. Select events (see `config/webhooks.json`)
4. Copy webhook signing secret to `.env` as `STRIPE_WEBHOOK_SECRET`

### 3. Test Integration

```bash
npm run test:payment
```

### 4. Go Live

1. Switch to live mode in Stripe Dashboard
2. Update environment variables with live keys
3. Re-test webhooks
4. Monitor Stripe Dashboard for events

## Troubleshooting

- **Webhook not firing**: Check endpoint URL and SSL certificate
- **Payment failing**: Verify API keys are correct mode (test vs live)
- **Session creation error**: Check product configuration
