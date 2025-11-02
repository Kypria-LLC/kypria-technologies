# 🔥 Breathe.sh - Usage Guide

The **breathe.sh** script is the ceremonial release automation tool for the Basilica of Kypria. It orchestrates Auth0 M2M token acquisition, Trinity verification, agent readiness checks, token persistence, and release logging.

---

## 📋 Quick Start

### Prerequisites
- `bash` (version 4.0 or higher recommended)
- `curl` (for HTTP requests)
- `jq` (for JSON parsing)

### Basic Usage

1. **Set required environment variables:**
```bash
export AUTH0_CLIENT_ID="your_m2m_client_id"
export AUTH0_CLIENT_SECRET="your_m2m_client_secret"
export AUTH0_AUDIENCE="your_api_audience"
```

2. **Run the script:**
```bash
./breathe.sh
```

3. **The script will:**
   - Acquire an Auth0 M2M access token
   - Perform Trinity verification (three-fold checks)
   - Verify agent readiness
   - Persist the token to a timestamped file
   - Log the release to the Trinity endpoint

---

## 🔧 Environment Variables

### Required Variables

| Variable | Description |
|----------|-------------|
| `AUTH0_CLIENT_ID` | Your Auth0 M2M application's client ID |
| `AUTH0_CLIENT_SECRET` | Your Auth0 M2M application's client secret |
| `AUTH0_AUDIENCE` | The API audience/identifier for your Auth0 API |

### Optional Variables (with defaults)

| Variable | Description | Default |
|----------|-------------|---------|
| `AUTH0_DOMAIN` | Your Auth0 tenant domain | `dev-tulns3uf2nt6jpcf.us.auth0.com` |
| `TRINITY_API_URL` | Trinity API verification endpoint | `https://api.kypriatechnologies.org/trinity/verify` |
| `TRINITY_AGENT_URL` | Trinity agent status endpoint | `https://api.kypriatechnologies.org/agents/status` |
| `TRINITY_RELEASE_URL` | Trinity release logging endpoint | `https://api.kypriatechnologies.org/releases/log` |
| `TOKEN_DIR` | Directory for saving token files | `.` (current directory) |
| `RELEASE_VERSION` | Version identifier for this release | Current date in `YYYY.MM.DD` format |
| `RELEASE_NAME` | Human-readable release name | `Breathe` |
| `DRY_RUN` | Enable dry-run mode (`true`/`false`) | `false` |
| `VERBOSE` | Enable verbose logging (`true`/`false`) | `false` |

---

## 💡 Usage Examples

### Example 1: Standard Production Release
```bash
#!/bin/bash
export AUTH0_CLIENT_ID="abc123xyz"
export AUTH0_CLIENT_SECRET="super_secret_value"
export AUTH0_AUDIENCE="https://api.kypriatechnologies.org"
export RELEASE_VERSION="2025.11.02"
export RELEASE_NAME="November Release"

./breathe.sh
```

### Example 2: Dry Run for Testing
```bash
#!/bin/bash
# Test the script without making actual API calls
export DRY_RUN=true
export VERBOSE=true
export AUTH0_CLIENT_ID="test_client"
export AUTH0_CLIENT_SECRET="test_secret"
export AUTH0_AUDIENCE="test_audience"

./breathe.sh
```

### Example 3: Custom Token Directory
```bash
#!/bin/bash
export AUTH0_CLIENT_ID="abc123xyz"
export AUTH0_CLIENT_SECRET="super_secret_value"
export AUTH0_AUDIENCE="https://api.kypriatechnologies.org"
export TOKEN_DIR="/var/tokens/kypria"

./breathe.sh
```

### Example 4: CI/CD Integration
```bash
#!/bin/bash
# In your CI/CD pipeline (e.g., GitHub Actions, GitLab CI)
# Secrets should be stored in your CI/CD secret management

export AUTH0_CLIENT_ID="${CI_AUTH0_CLIENT_ID}"
export AUTH0_CLIENT_SECRET="${CI_AUTH0_CLIENT_SECRET}"
export AUTH0_AUDIENCE="${CI_AUTH0_AUDIENCE}"
export RELEASE_VERSION="${CI_COMMIT_TAG:-$(date +%Y.%m.%d)}"
export TOKEN_DIR="/tmp/tokens"

./breathe.sh

# The script outputs TOKEN_FILE location for downstream use
# TOKEN_FILE=/tmp/tokens/m2m-token-20251102-165430.json
```

---

## 🔍 What the Script Does

### 1. **Dependency Checks**
Verifies that `curl` and `jq` are installed and available.

### 2. **Agent Readiness**
- Checks that the token directory exists and is writable
- Verifies network connectivity to Auth0 domain
- Validates environment configuration

### 3. **Auth0 Token Acquisition**
- Requests an M2M access token using client credentials flow
- Validates the response and extracts the access token
- Returns error if token acquisition fails

### 4. **Trinity Verification (Three-fold Checks)**
Performs three verification checks:
- **API Check**: Validates Trinity API endpoint
- **Agent Check**: Confirms agent service status  
- **Release Check**: Verifies release logging endpoint

*Note: Trinity checks are non-fatal; the script continues if services are unavailable.*

### 5. **Token Persistence**
- Saves the token to a timestamped JSON file
- Enriches with metadata (version, name, timestamp)
- Sets restrictive permissions (600 - owner read/write only)

### 6. **Release Logging**
- Posts release information to Trinity release endpoint
- Includes version, name, timestamp, and status
- Non-fatal if the endpoint is unavailable

---

## 📤 Output

### Standard Output
The script outputs the token file location in a format suitable for CI/CD consumption:
```
TOKEN_FILE=/path/to/m2m-token-20251102-165430.json
```

### Log Output (stderr)
All operational logs are written to stderr:
```
[2025-11-02 16:54:30] ════════════════════════════════════════════════════════════
[2025-11-02 16:54:30]   🔥 Breathe.sh - The Ceremonial Release Script 🔥
[2025-11-02 16:54:30]   Release: Breathe v2025.11.02
[2025-11-02 16:54:30] ════════════════════════════════════════════════════════════
[2025-11-02 16:54:30] Checking agent readiness...
[2025-11-02 16:54:30] ✓ Agent readiness checks complete
[2025-11-02 16:54:30] Acquiring Auth0 M2M token...
[2025-11-02 16:54:31] Performing Trinity verification (three-fold checks)...
[2025-11-02 16:54:32] ✓ Trinity verification complete: All three checks passed
[2025-11-02 16:54:32] Persisting token to: ./m2m-token-20251102-165430.json
[2025-11-02 16:54:32] ✓ Token persisted successfully
[2025-11-02 16:54:32] Logging release: Breathe v2025.11.02
[2025-11-02 16:54:33] ✓ Release logged successfully
[2025-11-02 16:54:33] ════════════════════════════════════════════════════════════
[2025-11-02 16:54:33] ✓ Breathe complete. The Basilica stands eternal.
[2025-11-02 16:54:33] ════════════════════════════════════════════════════════════
```

---

## 🛡️ Security Best Practices

1. **Never commit secrets** to source control
2. Use environment variables or CI/CD secret management for `AUTH0_CLIENT_SECRET`
3. Token files are automatically created with `600` permissions
4. Regularly rotate Auth0 client secrets
5. Limit token validity period in Auth0 configuration
6. Store tokens in secure, ephemeral locations in CI/CD (e.g., `/tmp`)
7. Delete token files after use when no longer needed

---

## 🐛 Troubleshooting

### Error: "jq is required but not installed"
**Solution:** Install jq:
```bash
# Ubuntu/Debian
sudo apt-get install jq

# macOS
brew install jq

# Alpine
apk add jq
```

### Error: "Auth0 credentials incomplete"
**Solution:** Ensure all required environment variables are set:
```bash
echo "AUTH0_CLIENT_ID: ${AUTH0_CLIENT_ID}"
echo "AUTH0_CLIENT_SECRET: ${AUTH0_CLIENT_SECRET:0:5}..." # Don't print full secret
echo "AUTH0_AUDIENCE: ${AUTH0_AUDIENCE}"
```

### Error: "Failed to obtain access token"
**Possible causes:**
- Incorrect client ID or secret
- Wrong audience value
- Auth0 application not configured for client credentials grant
- Network connectivity issues

**Solution:** Check Auth0 application settings and verify credentials.

### Warning: "Trinity check X/3: SKIPPED (service unavailable)"
**Explanation:** Trinity verification endpoints are optional services. The script will continue even if they're unavailable. This is expected in development or when Trinity services aren't deployed.

---

## 🚀 Next Steps

### Integration Ideas

1. **GitHub Actions Workflow**
   - Add breathe.sh to your deployment workflow
   - Use the generated token for API authentication
   - Store tokens as artifacts for debugging

2. **Scheduled Token Refresh**
   - Run breathe.sh on a cron schedule to maintain fresh tokens
   - Use the token for automated monitoring or health checks

3. **Multi-Environment Releases**
   - Create environment-specific configuration
   - Use different `RELEASE_NAME` values for staging/production
   - Separate `TOKEN_DIR` per environment

4. **Token Rotation**
   - Implement a cleanup script to remove old token files
   - Keep only the N most recent tokens
   - Archive tokens for audit purposes

### Customization

The script is designed to be extensible. Consider:
- Adding custom verification checks in the Trinity section
- Integrating with your monitoring/observability platform
- Sending notifications on successful releases
- Customizing the release metadata schema

---

## 📚 Related Resources

- [RELEASE.md](../RELEASE.md) - Full release notes and ceremonial poem
- [CHANGELOG.md](../CHANGELOG.md) - Version history
- [scripts/get-auth0-token.sh](../scripts/get-auth0-token.sh) - Simpler token acquisition script
- [Auth0 Client Credentials Flow](https://auth0.com/docs/get-started/authentication-and-authorization-flow/client-credentials-flow) - Official Auth0 documentation

---

## 🙏 Support

For issues, questions, or contributions:
- Open an issue in the GitHub repository
- Consult the Basilica documentation
- Review existing scripts in the `scripts/` directory

---

**⟡ May your breathe.sh runs be swift and your tokens eternal ⟡**
