# Changelog

All notable changes to the Basilica of Kypria Technologies will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- **breathe.sh** - Ceremonial release script implementing:
  - Auth0 M2M token acquisition using client credentials flow
  - Trinity verification with three-fold checks (API, Agent, Release)
  - Agent readiness validation
  - Token persistence with timestamped files and metadata enrichment
  - Release logging to Trinity endpoint
  - DRY_RUN mode for safe testing
  - Comprehensive error handling and logging
  - Security: Token files saved with 600 permissions
- **RELEASE.md** - Release documentation with ceremonial poem and metadata
- **docs/BREATHE.md** - Comprehensive usage guide including:
  - Environment variable documentation
  - Usage examples for various scenarios
  - CI/CD integration guidance
  - Troubleshooting section
  - Security best practices
  - Next steps and customization ideas

### Documentation
- Added detailed usage instructions for breathe.sh
- Documented all environment variables and their defaults
- Provided examples for standard execution, dry runs, and CI/CD integration

### Security
- Token files automatically created with restrictive 600 permissions
- Secrets managed exclusively through environment variables
- No secrets committed to source control

---

## Historical Context

This is the inaugural changelog entry for the Basilica. Previous work has been preserved in the repository's git history and ceremonial documentation (see [BENEDICTION.md](docs/BENEDICTION.md)).

---

**⟡ Every change a seal, every release a proclamation ⟡**
