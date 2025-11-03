#!/usr/bin/env bash
# Environment Setup Script

set -euo pipefail

echo "🔧 Setting up Trinity Stack environment..."

# Create .env.example if it doesn't exist
if [ ! -f .env.example ]; then
  cat > .env.example << 'ENVEOF'
# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here

# Auth0 Configuration
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret
AUTH0_AUDIENCE=https://api.kypriatechnologies.org

# Application Configuration
NODE_ENV=development
ENVEOF
  echo "✅ Created .env.example"
fi

echo "📋 Remember to:"
echo "  1. Copy .env.example to .env"
echo "  2. Fill in your actual credentials"
echo "  3. Never commit .env to version control"
