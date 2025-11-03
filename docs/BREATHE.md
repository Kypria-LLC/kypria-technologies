# 🔥 BREATHE - The Basilica's Release Ceremony

The `breathe.sh` script is the ceremonial release tool for the Basilica of Kypria. It orchestrates Auth0 M2M token acquisition, Trinity verification, agent readiness checks, and release logging — all with the option for safe dry-run testing.

---

## 📋 Quick Start

### Prerequisites

- `bash` (version 4.0 or higher)
- `curl` - for API requests
- `jq` - for JSON parsing

Install on Ubuntu/Debian:
```bash
sudo apt-get install curl jq
```

Install on macOS:
```bash
brew install curl jq
```

---

## 🔐 Environment Variables

The script requires the following environment variables to be set:

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `AUTH0_DOMAIN` | Your Auth0 tenant domain | Yes | `dev-tulns3uf2nt6jpcf.us.auth0.com` |
| `AUTH0_CLIENT_ID` | Auth0 M2M application client ID | Yes | _(none)_ |
| `AUTH0_CLIENT_SECRET` | Auth0 M2M application client secret | Yes | _(none)_ |
| `AUTH0_AUDIENCE` | Auth0 API identifier/audience | Yes | _(none)_ |
| `DRY_RUN` | Enable dry-run mode (no actual changes) | No | `false` |
| `TOKEN_FILE` | Path to save the acquired token | No | `.m2m-token-cache` |
| `TRINITY_ENDPOINTS` | Comma-separated Trinity HTML files | No | `aphrodite.html,zeus.html,lifesphere.html` |

### Setting Environment Variables

**For a single run:**
```bash
export AUTH0_CLIENT_ID="your_client_id_here"
export AUTH0_CLIENT_SECRET="your_client_secret_here"
export AUTH0_AUDIENCE="your_api_identifier"
./breathe.sh
```

**Using a .env file (recommended):**
```bash
# Create .env file (DO NOT commit to git!)
cat > .env.local << 'EOF'
export AUTH0_CLIENT_ID="your_client_id_here"
export AUTH0_CLIENT_SECRET="your_client_secret_here"
export AUTH0_AUDIENCE="your_api_identifier"
EOF

# Source it before running
source .env.local
./breathe.sh
```

**⚠️ Security Note:** Never commit secrets to version control. Add `.env.local` and similar files to `.gitignore`.

---

## 🌫️ DRY_RUN Mode

The `DRY_RUN` feature allows you to test the release ceremony without making actual changes.

**Enable DRY_RUN:**
```bash
DRY_RUN=true ./breathe.sh
```

**What happens in DRY_RUN mode:**
- ✅ All dependency checks are performed
- ✅ Environment validation runs
- ✅ Trinity verification proceeds
- ✅ Agent readiness checks execute
- 🌫️ Auth0 token request is **mocked** (no actual API call)
- 🌫️ Token persistence is **simulated** (no file write)
- ✅ All logging and output is shown

**Use DRY_RUN when:**
- Testing the script for the first time
- Verifying your environment configuration
- Debugging issues before a live release
- Demonstrating the ceremony flow

---

## 🚀 How to Run

### 1. Basic Execution

```bash
# Make sure the script is executable
chmod +x breathe.sh

# Run with environment variables set
./breathe.sh
```

### 2. With DRY_RUN

```bash
# Test run without making changes
DRY_RUN=true ./breathe.sh
```

### 3. Custom Token File Location

```bash
# Save token to a specific location
TOKEN_FILE="/secure/path/to/token" ./breathe.sh
```

### 4. Full Example

```bash
# Complete example with all options
export AUTH0_CLIENT_ID="abc123xyz"
export AUTH0_CLIENT_SECRET="supersecret456"
export AUTH0_AUDIENCE="https://api.kypria.tech"
export DRY_RUN=false
export TOKEN_FILE=".tokens/m2m-current"

./breathe.sh
```

---

## 📝 What the Script Does

The ceremony follows these steps in order:

1. **Dependency Check** - Verifies `curl` and `jq` are installed
2. **Environment Validation** - Confirms all required variables are set
3. **Release Logging** - Records ceremony start with timestamp
4. **Trinity Verification** - Checks that Divine Trinity endpoints exist:
   - `docs/divine-trinity/aphrodite.html`
   - `docs/divine-trinity/zeus.html`
   - `docs/divine-trinity/lifesphere.html`
5. **Agent Readiness** - Scans `.github/agents/` for configured agents
6. **Token Acquisition** - Requests Auth0 M2M access token
7. **Token Persistence** - Saves token to file with secure permissions (600)
8. **Ceremony Completion** - Logs success and displays final status

---

## 🔍 Output Example

```
░█▄█░█▀█░█▀▄░█▀▀░█▀▄░█▀█░█
░█░█░█▀█░█▀▄░█▀▀░█▀▄░█▀█░░
░▀░▀░▀░▀░▀░▀░▀▀▀░▀░▀░▀░▀░▀

🔥 BREATHE - The Basilica's Release Ceremony 🔥

ℹ Checking dependencies...
✓ All dependencies present
ℹ Validating environment configuration...
✓ Environment validated

═══════════════════════════════════════════════════════════════
   RELEASE CEREMONY COMMENCED
   Timestamp: 2025-11-02T16:45:00Z
   Mode: LIVE
═══════════════════════════════════════════════════════════════

ℹ Verifying Divine Trinity endpoints...
✓ Trinity endpoint verified: aphrodite.html
✓ Trinity endpoint verified: zeus.html
✓ Trinity endpoint verified: lifesphere.html
✧ The Divine Trinity is complete (3/3)

ℹ Checking agent readiness...
✓ Found 1 agent(s) ready

ℹ Acquiring Auth0 M2M token...
✓ M2M token acquired
ℹ Persisting token to .m2m-token-cache...
✓ Token persisted securely

═══════════════════════════════════════════════════════════════
   ✨ RELEASE CEREMONY COMPLETE ✨
   The breath has been taken. The Basilica stands ready.
═══════════════════════════════════════════════════════════════

✓ All checks passed. Breathe complete.
```

---

## 🎯 Next Steps for Agents

After running `breathe.sh` successfully, the acquired token is available for use by automation agents and scripts.

### For GitHub Actions

```yaml
- name: Run Release Ceremony
  env:
    AUTH0_CLIENT_ID: ${{ secrets.AUTH0_CLIENT_ID }}
    AUTH0_CLIENT_SECRET: ${{ secrets.AUTH0_CLIENT_SECRET }}
    AUTH0_AUDIENCE: ${{ secrets.AUTH0_AUDIENCE }}
  run: ./breathe.sh

- name: Use Acquired Token
  run: |
    TOKEN=$(cat .m2m-token-cache)
    curl -H "Authorization: Bearer $TOKEN" https://api.example.com/endpoint
```

### For Local Development

```bash
# Run ceremony
./breathe.sh

# Token is now available
TOKEN=$(cat .m2m-token-cache)

# Use in API calls
curl -H "Authorization: Bearer $TOKEN" \
  https://api.kypria.tech/protected-endpoint
```

### For CI/CD Pipelines

1. Store Auth0 credentials as secrets in your CI/CD platform
2. Run `breathe.sh` as an early step in your pipeline
3. Subsequent steps can read the token from `TOKEN_FILE`
4. Clean up the token file after use for security

---

## 🛡️ Security Best Practices

- **Never commit** Auth0 credentials to git
- **Always use** environment variables or secrets management
- **Restrict permissions** on token files (script sets `chmod 600`)
- **Rotate secrets** regularly in Auth0 dashboard
- **Use DRY_RUN** first to verify configuration
- **Clean up** token files after use in CI/CD contexts

---

## 🐛 Troubleshooting

### "Missing required dependencies"
- Install `curl` and `jq` using your package manager

### "Failed to obtain access token"
- Verify Auth0 credentials are correct
- Check that `AUTH0_AUDIENCE` matches your API identifier
- Ensure the M2M application has proper grants in Auth0

### "Trinity verification incomplete"
- Confirm `docs/divine-trinity/` directory exists
- Check that Trinity HTML files are present
- Verify file names match `TRINITY_ENDPOINTS` configuration

### "No agents configured"
- This is informational only, not an error
- Agents are optional; the ceremony will continue

---

## 📚 Related Documentation

- [RELEASE.md](../RELEASE.md) - The ceremonial poem and release metadata
- [CHANGELOG.md](../CHANGELOG.md) - History of changes
- [scripts/get-auth0-token.sh](../scripts/get-auth0-token.sh) - Simpler token script (no ceremony)

---

**⟡ The Documentation is Complete ⟡**  
*May your releases be ceremonial, intentional, and blessed.*
