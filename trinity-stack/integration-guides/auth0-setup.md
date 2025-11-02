# Auth0 M2M Integration Guide

## Prerequisites

- Auth0 account (https://auth0.com)
- Auth0 tenant created

## Setup Steps

### 1. Create M2M Application

1. Log in to Auth0 Dashboard
2. Navigate to Applications > Applications
3. Click "Create Application"
4. Choose "Machine to Machine Application"
5. Name it "Trinity Stack M2M"
6. Select your API or create new one

### 2. Configure API

1. Go to Applications > APIs
2. Create API with identifier: `https://api.kypriatechnologies.org`
3. Add permissions:
   - `read:premium_content`
   - `write:user_metadata`
   - `manage:subscriptions`

### 3. Set Environment Variables

```bash
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=<from M2M app>
AUTH0_CLIENT_SECRET=<from M2M app>
AUTH0_AUDIENCE=https://api.kypriatechnologies.org
```

### 4. Test Token Acquisition

```bash
./scripts/get-auth0-token.sh
```

## Security Best Practices

- Never commit client secrets
- Rotate secrets regularly
- Use environment-specific tenants (dev/staging/prod)
- Enable token caching to reduce API calls
