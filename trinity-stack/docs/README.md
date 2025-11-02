# Trinity Monetization Stack Documentation

## Overview

The Trinity Monetization Stack is a comprehensive payment and authentication system for the Kypria Technologies Basilica. It combines:

- **Stripe Integration**: Payment processing for premium features
- **Auth0 M2M**: Secure machine-to-machine authentication
- **Webhook Processing**: Real-time event handling
- **Configuration Management**: Environment-based settings

## Architecture

```
Trinity Monetization Stack
├── Stripe Layer (Payments)
│   ├── Checkout sessions
│   ├── Webhook handlers
│   └── Product management
├── Auth0 Layer (M2M Auth)
│   ├── Token acquisition
│   ├── Token caching
│   └── Scope management
└── Integration Layer
    ├── User access control
    ├── Subscription management
    └── Event processing
```

## Quick Start

1. Set environment variables (see Configuration)
2. Install dependencies: `npm install`
3. Configure webhooks in Stripe dashboard
4. Test integration: `npm run test:payment`

## Configuration

Required environment variables:

```bash
# Stripe
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Auth0
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret
AUTH0_AUDIENCE=https://api.kypriatechnologies.org
```

## Support

For issues or questions, refer to the integration guides in `/trinity-stack/integration-guides/`
