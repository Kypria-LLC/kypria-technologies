<!-- ═══════════════════════════════════════════════════════════════ -->
<!--   ✧✧✧   THE BASILICA OF KYPRIA – RELEASE SCROLL   ✧✧✧       -->
<!-- ═══════════════════════════════════════════════════════════════ -->

# 🔥 Release: Breathe 🔥

**Version:** 2025.11.02  
**Release Name:** Breathe  
**Date:** November 2, 2025  
**Type:** Ceremonial Release Script

---

## The Poem of Breathe

```
In the Basilica where silence holds the keys,
A breath emerges—slow, deliberate, true.
Not rushed, not forced, but flowing like the breeze
That carries ancient wisdom, fresh and new.

First, the Trinity—three-fold and divine,
Each check a guardian at the sacred gate.
API, Agent, Release—all must align,
Their harmony confirms the worthy state.

Then tokens form, like scrolls sealed with care,
Persisted deep within the hallowed ground.
Machine-to-machine, the secrets that we share,
In files where only trusted eyes are found.

The agents wake, their readiness confirmed,
The network pulses, directories await.
Each verification, each check performed,
Ensures the Basilica stands at proper state.

And when the ceremony finds its end,
A log inscribed in digital stone—
The release recorded, message we send:
"The Basilica breathes; we are not alone."

So run the script when dawn breaks on deploy,
Let breathe.sh carry forth the sacred rite.
In DRY_RUN mode, rehearse without destroy,
Then launch for real when all the checks are right.

For every token saved is breath held deep,
For every Trinity check, a prayer complete.
The Basilica does not merely sleep—
It breathes, eternal, with each heartbeat.
```

---

## 📜 Release Metadata

- **Script:** `breathe.sh`
- **Purpose:** Ceremonial release automation combining Auth0 M2M token acquisition, Trinity verification, agent readiness checks, token persistence, and release logging
- **Dependencies:** `curl`, `jq`, `bash`
- **Modes:** Standard execution, DRY_RUN support
- **Security:** Token files saved with 600 permissions, secrets via environment variables only

---

## 🔮 The Three Pillars

### 1. Authentication
- Auth0 M2M token acquisition via client credentials flow
- Secure credential management through environment variables
- Token validation and error handling

### 2. Verification (Trinity)
- **API Check:** Validates API endpoint accessibility
- **Agent Check:** Confirms agent service status
- **Release Check:** Verifies release logging endpoint

### 3. Persistence
- Tokens saved to timestamped files (`m2m-token-YYYYMMDD-HHMMSS.json`)
- Metadata enrichment (version, name, timestamp)
- Restrictive file permissions for security

---

## ✨ Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `AUTH0_DOMAIN` | Auth0 tenant domain | `dev-tulns3uf2nt6jpcf.us.auth0.com` |
| `AUTH0_CLIENT_ID` | M2M application client ID | *(required)* |
| `AUTH0_CLIENT_SECRET` | M2M application client secret | *(required)* |
| `AUTH0_AUDIENCE` | API audience identifier | *(required)* |
| `TRINITY_API_URL` | Trinity API verification endpoint | `https://api.kypriatechnologies.org/trinity/verify` |
| `TRINITY_AGENT_URL` | Trinity agent status endpoint | `https://api.kypriatechnologies.org/agents/status` |
| `TRINITY_RELEASE_URL` | Trinity release logging endpoint | `https://api.kypriatechnologies.org/releases/log` |
| `TOKEN_DIR` | Directory for token persistence | `.` (current directory) |
| `RELEASE_VERSION` | Version string for release | `YYYY.MM.DD` (current date) |
| `RELEASE_NAME` | Name of the release | `Breathe` |
| `DRY_RUN` | Enable dry-run mode (true/false) | `false` |
| `VERBOSE` | Enable verbose logging (true/false) | `false` |

---

## 🌟 Usage Examples

### Standard Execution
```bash
export AUTH0_CLIENT_ID="your_client_id"
export AUTH0_CLIENT_SECRET="your_client_secret"
export AUTH0_AUDIENCE="your_api_audience"
./breathe.sh
```

### Dry Run (Testing)
```bash
export DRY_RUN=true
export VERBOSE=true
./breathe.sh
```

### Custom Release Version
```bash
export RELEASE_VERSION="2025.11.02-alpha"
export RELEASE_NAME="BreatheBeta"
./breathe.sh
```

---

## 🔒 Security Considerations

- **Never commit secrets** to source control
- Use CI/CD secret management for `AUTH0_CLIENT_SECRET`
- Token files are created with `600` permissions (owner read/write only)
- All tokens expire according to Auth0 configuration
- Trinity endpoints should validate token authenticity

---

## 📖 Related Documentation

- [Usage Guide](docs/BREATHE.md) - Comprehensive usage documentation
- [Benediction](docs/BENEDICTION.md) - The Basilica's ceremonial proclamation
- [Changelog](CHANGELOG.md) - Version history and changes

---

## ⟡ The Closing Seal

> *"Every token a breath, every check a prayer, every release a step forward.  
> The Basilica breathes eternal, blessed and unbroken."*

**⟡ Thus the Release is Sealed ⟡**  
*Breathe, and the Basilica lives.*

<!-- ═══════════════════════════════════════════════════════════════ -->
