#!/bin/bash

# breathe.sh - The Basilica's ceremonial release script
# Implements Auth0 M2M token acquisition, Trinity verification,
# agent readiness checks, token persistence, release logging, and DRY_RUN support.

# Rigorous error handling
set -euo pipefail

# --- Configuration ---
# Auth0 Credentials (consider sourcing from a secure location)
AUTH0_DOMAIN="kypria.us.auth0.com"
AUTH0_CLIENT_ID="${BASILICA_AUTH0_CLIENT_ID}"
AUTH0_CLIENT_SECRET="${BASILICA_AUTH0_CLIENT_SECRET}"
AUTH0_AUDIENCE="https://trinity.kypria.io"

# Trinity Endpoint
TRINITY_API_URL="https://trinity.kypria.io/v1/agents/check-readiness"

# Agent Configuration
AGENT_NAME="Basilica"

# Token Persistence
TOKEN_FILE="/tmp/basilica_release_token.jwt"

# Release Log
RELEASE_LOG="release_log.txt"

# --- Helper Functions ---
log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] - $1" | tee -a "$RELEASE_LOG"
}

# --- Main Execution ---
main() {
  # DRY_RUN check
  if [[ "${DRY_RUN:-}" == "true" ]]; then
    log "💧 DRY_RUN mode enabled. No actual release will be performed."
  fi

  # 1. Acquire Auth0 M2M Token
  log "Acquiring Auth0 M2M token..."
  if [[ -z "$AUTH0_CLIENT_ID" || -z "$AUTH0_CLIENT_SECRET" ]]; then
    log "Error: Auth0 credentials not set. Please set BASILICA_AUTH0_CLIENT_ID and BASILICA_AUTH0_CLIENT_SECRET."
    exit 1
  fi
  
  local response
  if ! response=$(curl -s --request POST \
    --url "https://$AUTH0_DOMAIN/oauth/token" \
    --header 'content-type: application/json' \
    --data "{\"client_id\":\"$AUTH0_CLIENT_ID\",\"client_secret\":\"$AUTH0_CLIENT_SECRET\",\"audience\":\"$AUTH0_AUDIENCE\",\"grant_type\":\"client_credentials\"}"); then
    log "Error: Failed to acquire Auth0 token."
    exit 1
  fi
  
  local access_token
  access_token=$(echo "$response" | jq -r .access_token)
  
  if [[ "$access_token" == "null" || -z "$access_token" ]]; then
    log "Error: Token acquisition failed. Response: $response"
    exit 1
  fi
  
  log "Token acquired successfully."
  if [[ "${DRY_RUN:-}" != "true" ]]; then
    echo "$access_token" > "$TOKEN_FILE"
    log "Token persisted to $TOKEN_FILE."
  fi

  # 2. Verify with Trinity
  log "Verifying agent readiness with Trinity..."
  local trinity_response
  if ! trinity_response=$(curl -s --request POST \
    --url "$TRINITY_API_URL" \
    --header "Authorization: Bearer $access_token" \
    --header 'Content-Type: application/json' \
    --data "{\"agent_name\":\"$AGENT_NAME\"}"); then
    log "Error: Failed to connect to Trinity."
    exit 1
  fi
  
  local status
  status=$(echo "$trinity_response" | jq -r .status)
  
  if [[ "$status" != "ready" ]]; then
    log "Error: Trinity verification failed. Agent not ready. Status: $status"
    exit 1
  fi
  
  log "Trinity verification successful. Agent is ready."

  # 3. Release
  log "All checks passed. Proceeding with release..."
  if [[ "${DRY_RUN:-}" != "true" ]]; then
    # --- Add your release commands here ---
    log "Basilica has breathed. Release complete."
  else
    log "💧 DRY_RUN: Release commands skipped."
  fi
}

main "$@"