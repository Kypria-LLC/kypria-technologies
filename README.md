# Kypria Technologies

[![Netlify Status](https://api.netlify.com/api/v1/badges/kypria-technologies/deploy-status)](https://app.netlify.com/sites/kypria-technologies/deploys)
[![License: MIT](https://img.shields.io/badge/License-MIT-gold.svg)](./LICENSE)

---

Kypria Technologies is a subscription-based AI persona generation platform built on a Greek mythology theme. Members choose a tier — **Zeus**, **Aphrodite**, or **Lifesphere** — and receive a curated AI persona experience delivered through a modern, temple-inspired web interface. The platform integrates Stripe for payments, Supabase for persona data management, Meta Business Suite for marketing and messaging, and a layered automation stack (Power Automate + n8n) to orchestrate onboarding, notifications, and persona lifecycle events.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Design System](#design-system)
- [Local Development](#local-development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)
- [Benediction Hall & Breathe](#benediction-hall--breathe)

---

## Architecture Overview

The platform operates across three primary layers:

**Website Layer** — Static HTML/CSS/JS pages hosted on Netlify, with edge logic handled by a Cloudflare Worker (`meta-pixel-injector`) that injects the Meta Pixel on all page responses without modifying source files. A `_redirects` file and `netlify.toml` manage routing, headers, and build settings.

**Payment Pipeline** — Stripe processes subscription purchases across the three tiers. Webhooks trigger downstream automation flows (via Zapier and n8n) that provision persona records in Supabase and fire onboarding communications.

**Automation Layer** — Power Automate handles Microsoft-ecosystem integrations (email, calendar, internal notifications). n8n (self-hosted via Docker) orchestrates cross-platform workflows including persona provisioning, Meta Business events, and lifecycle reminders.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, JavaScript (Vanilla) |
| CSS Tooling | PostCSS |
| Hosting | [Netlify](https://netlify.com) |
| CDN / Edge Workers | [Cloudflare Workers](https://workers.cloudflare.com) |
| Payments | [Stripe](https://stripe.com) |
| Database / Auth | [Supabase](https://supabase.com) |
| Marketing & Messaging | [Meta Business Suite](https://business.facebook.com) (Pixel, Catalog, WhatsApp) |
| Automation (Microsoft) | [Power Automate](https://make.powerautomate.com) |
| Automation (Self-hosted) | [n8n](https://n8n.io) (Docker) |
| CI/CD | GitHub → Netlify auto-deploy |

---

## Project Structure

```
kypria-technologies/
├── index.html              # Homepage / landing page
├── pricing.html            # Subscription tier selection
├── ai-hub.html             # AI persona hub dashboard
├── codex.html              # The Codex — documentation / lore pages
├── quickref.html           # Quick reference guide
├── oracle-pricing.html     # Oracle pricing details
├── privacy.html            # Privacy policy
├── terms.html              # Terms of service
├── data-deletion.html      # Data deletion request page (Meta compliance)
├── messenger.js            # Meta Messenger chat integration
├── breathe.sh              # Ceremonial deploy / breathe script
├── _redirects              # Netlify redirect rules
├── netlify.toml            # Netlify build & header configuration
├── package.json            # Node dependencies (PostCSS, tooling)
├── postcss.config.js       # PostCSS configuration
│
├── .github/                # GitHub Actions workflows
├── achievements/           # Achievement system assets & logic
├── assets/                 # Shared static assets
├── css/                    # Stylesheets (global, components, themes)
├── data/                   # Static data files (JSON, config)
├── docs/                   # Additional documentation
├── favicon_io/             # Favicon variants (all sizes)
├── images/                 # Image assets
├── js/                     # JavaScript modules
└── netlify/                # Netlify serverless functions
```

---

## Design System

The visual identity draws from Greek temple architecture and mythology.

### Colors

| Token | Name | Hex |
|---|---|---|
| Primary | Zeus Purple | `#7B3FF2` |
| Accent | Divine Gold | `#FFD700` |
| Background | Charcoal | `#1F2125` |

### Typography

| Role | Font |
|---|---|
| Headings / Ceremonial | Georgia (serif) |
| Body / UI | Inter (sans-serif) |

---

## Local Development

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9
- A Netlify CLI account (optional, for local function testing)

### Setup

```bash
# Clone the repository
git clone https://github.com/Kypria-LLC/kypria-technologies.git
cd kypria-technologies

# Install dependencies
npm install

# Build CSS (PostCSS)
npm run build

# Serve locally (any static server works)
npx serve .
# or
python3 -m http.server 8080
```

### Environment Variables

Create a `.env` file (never committed) for any local secrets:

```env
# Stripe
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# Meta
META_PIXEL_ID=your-pixel-id
```

> **Note:** Never commit credentials. Use Netlify environment variables for production secrets.

---

## Deployment

Kypria Technologies is deployed continuously via **Netlify** with auto-deploy from the `main` branch.

### Deploy Flow

1. Push changes to `main` on GitHub.
2. Netlify detects the push and triggers a build.
3. PostCSS compiles stylesheets per `postcss.config.js`.
4. Built files are deployed to the Netlify CDN.
5. Cloudflare Workers handle edge-layer pixel injection transparently.
6. The site is live at [kypriatechnologies.org](https://kypriatechnologies.org).

### Netlify Configuration

Key settings are in `netlify.toml`:

- Build command and publish directory
- HTTP security headers (CSP, HSTS, X-Frame-Options)
- Redirect rules (also in `_redirects`)
- Serverless function directory (`netlify/`)

### Manual Deploy

```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

---

## Contributing

Contributions, improvements, and issue reports are welcome.

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "feat: describe your change"`
4. Push to your fork: `git push origin feature/your-feature-name`
5. Open a Pull Request against `main`.

### Guidelines

- Follow the existing HTML/CSS/JS conventions and naming patterns.
- Keep the Greek mythology theming consistent in any new UI copy.
- Do not commit secrets, tokens, or credentials of any kind.
- Test locally before opening a PR.
- Include a brief description of what the PR does and why.

---

## License

This project is licensed under the [MIT License](./LICENSE).

---

## Contact

For support, billing questions, or general inquiries:

**Email:** support@kypriatechnologies.org  
**Website:** [kypriatechnologies.org](https://kypriatechnologies.org)  
**GitHub:** [Kypria-LLC](https://github.com/Kypria-LLC)

---

## Benediction Hall & Breathe

The `breathe.sh` script at the root of this repository is a ceremonial touch — a moment of intentional pause before a deploy or major push. Run it when you want to ground yourself before sending your work into the world.

```bash
bash breathe.sh
```

The **Benediction Hall** is the spiritual heart of the Kypria interface — the place where a new member's persona is formally welcomed into the Pantheon. It is less a feature than a philosophy: that technology, at its best, should feel like a rite of passage.

> *"Enter with intention. Build with care. Deploy with grace."*
