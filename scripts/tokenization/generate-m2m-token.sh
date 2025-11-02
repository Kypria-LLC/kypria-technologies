#!/usr/bin/env bash
set -euo pipefail

echo "================ AUTH0 M2M Token ================="

# Replace these before running script, or export in your shell
export AUTH0_DOMAIN="dev-tulns3uf2nt6jpcf.us.auth0.com"
export AUTH0_CLIENT_ID="[YOUR_CLIENT_ID]"
export AUTH0_CLIENT_SECRET="[YOUR_CLIENT_SECRET]"
export AUTH0_AUDIENCE="[YOUR_API_IDENTIFIER]"

TOKEN=$(curl -s -X POST "https://${AUTH0_DOMAIN}/oauth/token" \
  -H "Content-Type: application/json" \
  -d "{\n    \"client_id\":\"${AUTH0_CLIENT_ID}\",
    \"client_secret\":\"${AUTH0_CLIENT_SECRET}\",
    \"audience\":\"${AUTH0_AUDIENCE}\",
    \"grant_type\":\"client_credentials\"
  }" | jq -r '.access_token')

echo "ACCESS_TOKEN=${TOKEN}"

# You can now use $TOKEN for authenticated API calls below...