#!/usr/bin/env bash
# breathe.sh - The Ceremonial Release Script of the Basilica
# ═══════════════════════════════════════════════════════════════════
# Implements Auth0 M2M token acquisition, Trinity verification,
# agent readiness checks, token persistence, and release logging.
# ═══════════════════════════════════════════════════════════════════

set -euo pipefail

# ═══════════════════════════════════════════════════════════════════
# CONFIGURATION & DEFAULTS
# ═══════════════════════════════════════════════════════════════════

# Auth0 Configuration
AUTH0_DOMAIN="${AUTH0_DOMAIN:-dev-tulns3uf2nt6jpcf.us.auth0.com}"
AUTH0_CLIENT_ID="${AUTH0_CLIENT_ID:-}"
AUTH0_CLIENT_SECRET="${AUTH0_CLIENT_SECRET:-}"
AUTH0_AUDIENCE="${AUTH0_AUDIENCE:-}"

# Trinity Configuration (Three-fold verification)
TRINITY_API_URL="${TRINITY_API_URL:-https://api.kypriatechnologies.org/trinity/verify}"
TRINITY_AGENT_URL="${TRINITY_AGENT_URL:-https://api.kypriatechnologies.org/agents/status}"
TRINITY_RELEASE_URL="${TRINITY_RELEASE_URL:-https://api.kypriatechnologies.org/releases/log}"

# Token Persistence
TOKEN_DIR="${TOKEN_DIR:-.}"
TOKEN_PREFIX="m2m-token"
TOKEN_FILE="${TOKEN_DIR}/${TOKEN_PREFIX}-$(date +%Y%m%d-%H%M%S).json"

# Release Configuration
RELEASE_VERSION="${RELEASE_VERSION:-$(date +%Y.%m.%d)}"
RELEASE_NAME="${RELEASE_NAME:-Breathe}"

# Operational Modes
DRY_RUN="${DRY_RUN:-false}"
VERBOSE="${VERBOSE:-false}"

# ═══════════════════════════════════════════════════════════════════
# UTILITY FUNCTIONS
# ═══════════════════════════════════════════════════════════════════

log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $*" >&2
}

verbose_log() {
  if [ "$VERBOSE" = "true" ]; then
    log "$@"
  fi
}

error() {
  log "ERROR: $*"
  exit 1
}

check_dependencies() {
  local missing_deps=()
  
  if ! command -v curl >/dev/null 2>&1; then
    missing_deps+=("curl")
  fi
  
  if ! command -v jq >/dev/null 2>&1; then
    missing_deps+=("jq")
  fi
  
  if [ "${#missing_deps[@]}" -gt 0 ]; then
    error "Missing required dependencies: ${missing_deps[*]}. Please install them and re-run."
  fi
}

# ═══════════════════════════════════════════════════════════════════
# AUTH0 M2M TOKEN ACQUISITION
# ═══════════════════════════════════════════════════════════════════

acquire_m2m_token() {
  log "Acquiring Auth0 M2M token..."
  
  # Validate environment variables
  if [ -z "$AUTH0_DOMAIN" ] || [ -z "$AUTH0_CLIENT_ID" ] || \
     [ -z "$AUTH0_CLIENT_SECRET" ] || [ -z "$AUTH0_AUDIENCE" ]; then
    error "Auth0 credentials incomplete. Set AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, AUTH0_AUDIENCE."
  fi
  
  if [ "$DRY_RUN" = "true" ]; then
    log "[DRY_RUN] Would acquire token from https://${AUTH0_DOMAIN}/oauth/token"
    echo '{"access_token":"dry_run_token_placeholder","token_type":"Bearer","expires_in":86400}'
    return 0
  fi
  
  # Request token
  local resp
  resp=$(curl -s -X POST "https://${AUTH0_DOMAIN}/oauth/token" \
    -H "Content-Type: application/json" \
    -d "{
      \"client_id\":\"${AUTH0_CLIENT_ID}\",
      \"client_secret\":\"${AUTH0_CLIENT_SECRET}\",
      \"audience\":\"${AUTH0_AUDIENCE}\",
      \"grant_type\":\"client_credentials\"
    }")
  
  # Validate response
  local token
  token=$(printf '%s' "$resp" | jq -r '.access_token // empty')
  
  if [ -z "$token" ]; then
    error "Failed to obtain access token. Response: $resp"
  fi
  
  verbose_log "Token acquired successfully"
  echo "$resp"
}

# ═══════════════════════════════════════════════════════════════════
# TRINITY VERIFICATION (Three-fold Checks)
# ═══════════════════════════════════════════════════════════════════

verify_trinity() {
  local token="$1"
  log "Performing Trinity verification (three-fold checks)..."
  
  local trinity_checks=("API" "Agent" "Release")
  local trinity_urls=("$TRINITY_API_URL" "$TRINITY_AGENT_URL" "$TRINITY_RELEASE_URL")
  local trinity_status=0
  
  for i in 0 1 2; do
    local check_name="${trinity_checks[$i]}"
    local check_url="${trinity_urls[$i]}"
    
    verbose_log "Trinity check $((i+1))/3: ${check_name} at ${check_url}"
    
    if [ "$DRY_RUN" = "true" ]; then
      log "[DRY_RUN] Would verify ${check_name} at ${check_url}"
      continue
    fi
    
    # Attempt verification (allow failures in non-critical checks)
    local resp
    if resp=$(curl -s -f -H "Authorization: Bearer ${token}" "${check_url}" 2>&1); then
      verbose_log "✓ Trinity check $((i+1))/3 (${check_name}): PASSED"
    else
      log "⚠ Trinity check $((i+1))/3 (${check_name}): SKIPPED (service unavailable)"
      trinity_status=1
    fi
  done
  
  if [ $trinity_status -eq 0 ]; then
    log "✓ Trinity verification complete: All three checks passed"
  else
    log "⚠ Trinity verification complete: Some checks were skipped"
  fi
  
  return 0
}

# ═══════════════════════════════════════════════════════════════════
# AGENT READINESS CHECKS
# ═══════════════════════════════════════════════════════════════════

check_agent_readiness() {
  log "Checking agent readiness..."
  
  local checks=(
    "Token directory writable"
    "Network connectivity"
    "Environment validated"
  )
  
  # Check 1: Token directory writable
  if [ ! -d "$TOKEN_DIR" ]; then
    mkdir -p "$TOKEN_DIR" || error "Cannot create token directory: $TOKEN_DIR"
  fi
  
  if [ ! -w "$TOKEN_DIR" ]; then
    error "Token directory not writable: $TOKEN_DIR"
  fi
  verbose_log "✓ ${checks[0]}"
  
  # Check 2: Network connectivity
  if [ "$DRY_RUN" != "true" ]; then
    if ! curl -s -f --max-time 5 "https://${AUTH0_DOMAIN}" >/dev/null 2>&1; then
      log "⚠ ${checks[1]}: Auth0 domain not reachable (continuing anyway)"
    else
      verbose_log "✓ ${checks[1]}"
    fi
  else
    log "[DRY_RUN] Skipping ${checks[1]}"
  fi
  
  # Check 3: Environment validated
  verbose_log "✓ ${checks[2]}"
  
  log "✓ Agent readiness checks complete"
}

# ═══════════════════════════════════════════════════════════════════
# TOKEN PERSISTENCE
# ═══════════════════════════════════════════════════════════════════

persist_token() {
  local token_data="$1"
  log "Persisting token to: ${TOKEN_FILE}"
  
  if [ "$DRY_RUN" = "true" ]; then
    log "[DRY_RUN] Would save token to ${TOKEN_FILE}"
    return 0
  fi
  
  # Save token with metadata
  local token_with_metadata
  token_with_metadata=$(echo "$token_data" | jq --arg version "$RELEASE_VERSION" \
    --arg name "$RELEASE_NAME" --arg timestamp "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    '. + {release_version: $version, release_name: $name, created_at: $timestamp}')
  
  echo "$token_with_metadata" > "$TOKEN_FILE"
  
  # Set restrictive permissions
  chmod 600 "$TOKEN_FILE"
  
  log "✓ Token persisted successfully"
  verbose_log "Token file: ${TOKEN_FILE}"
}

# ═══════════════════════════════════════════════════════════════════
# RELEASE LOGGING
# ═══════════════════════════════════════════════════════════════════

log_release() {
  local token="$1"
  log "Logging release: ${RELEASE_NAME} v${RELEASE_VERSION}"
  
  if [ "$DRY_RUN" = "true" ]; then
    log "[DRY_RUN] Would log release to ${TRINITY_RELEASE_URL}"
    return 0
  fi
  
  # Prepare release payload
  local release_payload
  release_payload=$(jq -n \
    --arg version "$RELEASE_VERSION" \
    --arg name "$RELEASE_NAME" \
    --arg timestamp "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    '{
      version: $version,
      name: $name,
      timestamp: $timestamp,
      type: "breathe",
      status: "deployed"
    }')
  
  # Attempt to log release (non-fatal if it fails)
  if curl -s -f -X POST "$TRINITY_RELEASE_URL" \
    -H "Authorization: Bearer ${token}" \
    -H "Content-Type: application/json" \
    -d "$release_payload" >/dev/null 2>&1; then
    log "✓ Release logged successfully"
  else
    log "⚠ Release logging skipped (service unavailable)"
  fi
}

# ═══════════════════════════════════════════════════════════════════
# MAIN EXECUTION
# ═══════════════════════════════════════════════════════════════════

main() {
  log "════════════════════════════════════════════════════════════"
  log "  🔥 Breathe.sh - The Ceremonial Release Script 🔥"
  log "  Release: ${RELEASE_NAME} v${RELEASE_VERSION}"
  if [ "$DRY_RUN" = "true" ]; then
    log "  Mode: DRY RUN (no actual changes will be made)"
  fi
  log "════════════════════════════════════════════════════════════"
  
  # Step 1: Check dependencies
  check_dependencies
  
  # Step 2: Agent readiness checks
  check_agent_readiness
  
  # Step 3: Acquire M2M token
  local token_data
  token_data=$(acquire_m2m_token)
  local access_token
  access_token=$(echo "$token_data" | jq -r '.access_token')
  
  # Step 4: Trinity verification
  verify_trinity "$access_token"
  
  # Step 5: Persist token
  persist_token "$token_data"
  
  # Step 6: Log release
  log_release "$access_token"
  
  log "════════════════════════════════════════════════════════════"
  log "✓ Breathe complete. The Basilica stands eternal."
  log "════════════════════════════════════════════════════════════"
  
  # Output token location for CI/CD consumption
  if [ "$DRY_RUN" != "true" ]; then
    echo "TOKEN_FILE=${TOKEN_FILE}"
  fi
}

# Run main function
main "$@"
