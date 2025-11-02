#!/usr/bin/env bash
# breathe.sh - The Basilica's ceremonial release script
# Implements Auth0 M2M token acquisition, Trinity verification,
# agent readiness checks, token persistence, release logging, and DRY_RUN support.

set -euo pipefail

# ═══════════════════════════════════════════════════════════════
#   ✧✧✧   BREATHE - THE RELEASE CEREMONY   ✧✧✧
# ═══════════════════════════════════════════════════════════════

# Configuration & Environment Variables
AUTH0_DOMAIN="${AUTH0_DOMAIN:-dev-tulns3uf2nt6jpcf.us.auth0.com}"
AUTH0_CLIENT_ID="${AUTH0_CLIENT_ID:-}"
AUTH0_CLIENT_SECRET="${AUTH0_CLIENT_SECRET:-}"
AUTH0_AUDIENCE="${AUTH0_AUDIENCE:-}"
DRY_RUN="${DRY_RUN:-false}"
TOKEN_FILE="${TOKEN_FILE:-.m2m-token-cache}"
TRINITY_ENDPOINTS="${TRINITY_ENDPOINTS:-aphrodite.html,zeus.html,lifesphere.html}"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ═══════════════════════════════════════════════════════════════
#   Functions
# ═══════════════════════════════════════════════════════════════

log_info() {
    echo -e "${BLUE}ℹ${NC} $*"
}

log_success() {
    echo -e "${GREEN}✓${NC} $*"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $*"
}

log_error() {
    echo -e "${RED}✗${NC} $*" >&2
}

log_ceremony() {
    echo -e "${PURPLE}✧${NC} $*"
}

# Check if required commands are available
check_dependencies() {
    log_info "Checking dependencies..."
    local missing=()
    
    for cmd in curl jq; do
        if ! command -v "$cmd" >/dev/null 2>&1; then
            missing+=("$cmd")
        fi
    done
    
    if [ ${#missing[@]} -gt 0 ]; then
        log_error "Missing required dependencies: ${missing[*]}"
        log_info "Please install them and try again."
        return 1
    fi
    
    log_success "All dependencies present"
    return 0
}

# Validate environment variables
validate_environment() {
    log_info "Validating environment configuration..."
    
    if [ "$DRY_RUN" = "true" ]; then
        log_warning "DRY_RUN mode enabled - no actual changes will be made"
    fi
    
    local missing_vars=()
    
    if [ -z "$AUTH0_DOMAIN" ]; then missing_vars+=("AUTH0_DOMAIN"); fi
    if [ -z "$AUTH0_CLIENT_ID" ]; then missing_vars+=("AUTH0_CLIENT_ID"); fi
    if [ -z "$AUTH0_CLIENT_SECRET" ]; then missing_vars+=("AUTH0_CLIENT_SECRET"); fi
    if [ -z "$AUTH0_AUDIENCE" ]; then missing_vars+=("AUTH0_AUDIENCE"); fi
    
    if [ ${#missing_vars[@]} -gt 0 ]; then
        log_error "Missing required environment variables: ${missing_vars[*]}"
        log_info "Please set them and try again."
        return 1
    fi
    
    log_success "Environment validated"
    return 0
}

# Acquire Auth0 M2M token
acquire_m2m_token() {
    log_info "Acquiring Auth0 M2M token..." >&2
    
    if [ "$DRY_RUN" = "true" ]; then
        log_warning "DRY_RUN: Skipping actual token acquisition" >&2
        echo "dry-run-mock-token-$(date +%s)"
        return 0
    fi
    
    local response
    response=$(curl -s -X POST "https://${AUTH0_DOMAIN}/oauth/token" \
        -H "Content-Type: application/json" \
        -d "{
            \"client_id\":\"${AUTH0_CLIENT_ID}\",
            \"client_secret\":\"${AUTH0_CLIENT_SECRET}\",
            \"audience\":\"${AUTH0_AUDIENCE}\",
            \"grant_type\":\"client_credentials\"
        }")
    
    local token
    token=$(echo "$response" | jq -r '.access_token // empty')
    
    if [ -z "$token" ]; then
        log_error "Failed to obtain access token. Response:"
        echo "$response" >&2
        return 1
    fi
    
    log_success "M2M token acquired" >&2
    echo "$token"
}

# Persist token to file
persist_token() {
    local token="$1"
    log_info "Persisting token to ${TOKEN_FILE}..."
    
    if [ "$DRY_RUN" = "true" ]; then
        log_warning "DRY_RUN: Would save token to ${TOKEN_FILE}"
        return 0
    fi
    
    echo "$token" > "$TOKEN_FILE"
    chmod 600 "$TOKEN_FILE"
    log_success "Token persisted securely"
}

# Verify Trinity endpoints
verify_trinity() {
    log_info "Verifying Divine Trinity endpoints..."
    
    local trinity_root="docs/divine-trinity"
    local endpoints
    IFS=',' read -ra endpoints <<< "$TRINITY_ENDPOINTS"
    
    local verified=0
    local total=${#endpoints[@]}
    
    for endpoint in "${endpoints[@]}"; do
        local filepath="${trinity_root}/${endpoint}"
        if [ -f "$filepath" ]; then
            log_success "Trinity endpoint verified: ${endpoint}"
            verified=$((verified + 1))
        else
            log_warning "Trinity endpoint missing: ${endpoint}"
        fi
    done
    
    if [ $verified -eq $total ]; then
        log_ceremony "The Divine Trinity is complete (${verified}/${total})"
        return 0
    else
        log_warning "Trinity verification incomplete (${verified}/${total})"
        return 1
    fi
}

# Check agent readiness
check_agent_readiness() {
    log_info "Checking agent readiness..."
    
    local agents_dir=".github/agents"
    
    if [ ! -d "$agents_dir" ]; then
        log_warning "No agents directory found"
        return 0
    fi
    
    local agent_count
    agent_count=$(find "$agents_dir" -name "*.md" -type f 2>/dev/null | wc -l)
    
    if [ "$agent_count" -gt 0 ]; then
        log_success "Found ${agent_count} agent(s) ready"
    else
        log_info "No agents configured"
    fi
    
    return 0
}

# Log release information
log_release() {
    local timestamp
    timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    
    log_ceremony "═══════════════════════════════════════════════════════════════"
    log_ceremony "   RELEASE CEREMONY COMMENCED"
    log_ceremony "   Timestamp: ${timestamp}"
    log_ceremony "   Mode: $([ "$DRY_RUN" = "true" ] && echo "DRY RUN" || echo "LIVE")"
    log_ceremony "═══════════════════════════════════════════════════════════════"
    
    if [ -f "RELEASE.md" ]; then
        log_info "Release manifest present"
    else
        log_warning "No RELEASE.md found - consider creating one"
    fi
}

# Main ceremony
main() {
    echo ""
    log_ceremony "░█▄█░█▀█░█▀▄░█▀▀░█▀▄░█▀█░█"
    log_ceremony "░█░█░█▀█░█▀▄░█▀▀░█▀▄░█▀█░░"
    log_ceremony "░▀░▀░▀░▀░▀░▀░▀▀▀░▀░▀░▀░▀░▀"
    echo ""
    log_ceremony "🔥 BREATHE - The Basilica's Release Ceremony 🔥"
    echo ""
    
    # Step 1: Pre-flight checks
    check_dependencies || exit 1
    validate_environment || exit 1
    
    # Step 2: Log release ceremony start
    log_release
    echo ""
    
    # Step 3: Verify Trinity
    verify_trinity
    echo ""
    
    # Step 4: Check agent readiness
    check_agent_readiness
    echo ""
    
    # Step 5: Acquire and persist M2M token
    local token
    token=$(acquire_m2m_token)
    persist_token "$token"
    echo ""
    
    # Step 6: Completion
    log_ceremony "═══════════════════════════════════════════════════════════════"
    log_ceremony "   ✨ RELEASE CEREMONY COMPLETE ✨"
    log_ceremony "   The breath has been taken. The Basilica stands ready."
    log_ceremony "═══════════════════════════════════════════════════════════════"
    echo ""
    
    log_success "All checks passed. Breathe complete."
    
    if [ "$DRY_RUN" = "true" ]; then
        log_warning "This was a DRY RUN - no actual changes were made"
        log_info "Set DRY_RUN=false to perform actual release"
    fi
    
    return 0
}

# ═══════════════════════════════════════════════════════════════
#   Execute
# ═══════════════════════════════════════════════════════════════

main "$@"
