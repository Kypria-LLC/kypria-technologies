#!/usr/bin/env bash
# Trinity Stack Deployment Script

set -euo pipefail

echo "🚀 Deploying Trinity Monetization Stack..."

# Validate environment variables
if [ -z "${STRIPE_SECRET_KEY:-}" ]; then
  echo "❌ Error: STRIPE_SECRET_KEY not set"
  exit 1
fi

if [ -z "${AUTH0_CLIENT_SECRET:-}" ]; then
  echo "❌ Error: AUTH0_CLIENT_SECRET not set"
  exit 1
fi

# Build step
echo "📦 Building application..."
npm run build

# Deploy to Netlify
echo "🌐 Deploying to Netlify..."
netlify deploy --prod

echo "✅ Deployment complete!"
