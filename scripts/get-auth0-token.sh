#!/usr/bin/env bash
# scripts/get-auth0-token.sh
# Request an Auth0 machine-to-machine access token using client_credentials.
# WARNING: Do NOT commit client secrets to source control. Use environment variables or CI secrets.
set -euo pipefail

# Defaults (change AUTH0_DOMAIN if your tenant is different)
AUTH0_DOMAIN="${AUTH0_DOMAIN:-dev-tulns3uf2nt6jpcf.us.auth0.com}"
AUTH0_CLIENT_ID="${AUTH0_CLIENT_ID:-}"
AUTH0_CLIENT_SECRET="${AUTH0_CLIENT_SECRET:-}"
AUTH0_AUDIENCE="${AUTH0_AUDIENCE:-}"

# ensure jq is installed (used to parse JSON)
if ! command -v jq >/dev/null 2>&1; then
  echo "Error: jq is required but not installed. Install jq and re-run." >&2
  exit 1
fi

# basic validation
if [ -z "$AUTH0_DOMAIN" ] || [ -z "$AUTH0_CLIENT_ID" ] || [ -z "$AUTH0_CLIENT_SECRET" ] || [ -z "$AUTH0_AUDIENCE" ]; then
  echo "Error: One or more Auth0 environment variables are empty." >&2
  echo "Please set AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, AUTH0_AUDIENCE." >&2
  exit 1
fi

# request token (store response for debugging on failure)
resp=$(curl -s -X POST "https://${AUTH0_DOMAIN}/oauth/token" \
  -H "Content-Type: application/json" \
  -d "{\n    \"client_id\":\"${AUTH0_CLIENT_ID}\",\n    \"client_secret\":\"${AUTH0_CLIENT_SECRET}\",\n    \"audience\":\"${AUTH0_AUDIENCE}\",\n    \"grant_type\":\"client_credentials\"\n  }")

TOKEN=$(printf '%s' "$resp" | jq -r '.access_token // empty')

if [ -z "$TOKEN" ]; then
  echo "Failed to obtain access token. Full response:" >&2
  printf '%s\n' "$resp" >&2
  exit 1
fi

# Output only the token key-value in a safe one-line form for CI consumption
printf 'ACCESS_TOKEN=%s\n' "$TOKEN"