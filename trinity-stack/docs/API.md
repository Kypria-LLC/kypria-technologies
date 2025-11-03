# Trinity Stack API Documentation

## Payment Endpoints

### Create Checkout Session

**POST** `/api/checkout/create`

Creates a new Stripe checkout session.

```json
{
  "productType": "premiumOracle",
  "userId": "user_123",
  "metadata": {
    "deity": "zeus",
    "sessionType": "premium"
  }
}
```

### Webhook Handler

**POST** `/.netlify/functions/stripe-webhook`

Receives Stripe webhook events.

## Authentication Endpoints

### Get M2M Token

**POST** `/api/auth/token`

Retrieves Auth0 M2M access token (server-side only).

```json
{
  "grant_type": "client_credentials",
  "audience": "https://api.kypriatechnologies.org"
}
```

## Response Codes

- `200 OK`: Success
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Missing or invalid token
- `500 Internal Server Error`: Server error
