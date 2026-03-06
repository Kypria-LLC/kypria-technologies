# Kypria Technologies — System Architecture

> This document describes the technical architecture of the Kypria Technologies platform as deployed at [kypriatechnologies.org](https://kypriatechnologies.org).

---

## Table of Contents

- [High-Level Architecture](#high-level-architecture)
- [Website Layer](#website-layer)
- [Payment Pipeline](#payment-pipeline)
- [Meta Business Integration](#meta-business-integration)
- [Automation Layer](#automation-layer)
- [Infrastructure](#infrastructure)
- [Security Considerations](#security-considerations)
- [Data Flow Diagrams](#data-flow-diagrams)

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          USER / BROWSER                                 │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │ HTTPS
                               ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       CLOUDFLARE (DNS + Edge)                            │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │  meta-pixel-injector Worker (injects Meta Pixel on all responses)  │  │
│  └────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────┬───────────────────────────────────────────┘
                               │ Proxied Traffic
                               ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         NETLIFY (Hosting + CDN)                          │
│                                                                          │
│   Static Pages          Netlify Functions        netlify.toml / headers  │
│   index.html            /netlify/*.js            CSP, HSTS, X-Frame     │
│   pricing.html          (serverless)             _redirects              │
│   ai-hub.html                                                            │
│   codex.html                                                             │
│   quickref.html                                                          │
│   oracle-pricing.html                                                    │
│   privacy.html                                                           │
│   terms.html                                                             │
│   data-deletion.html                                                     │
└──────┬─────────────────────┬───────────────────────────────────────────────┘
       │                     │
       ▼                     ▼
┌─────────────┐   ┌──────────────────────────────────────────────────────┐
│   STRIPE    │   │              SUPABASE                                │
│  Payments   │   │  Persona Pantheon (PostgreSQL + Auth + Storage)      │
│  Webhooks   │   │  Row-level security per subscription tier            │
└──────┬──────┘   └──────────────────────────────────────────────────────┘
       │
       ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      AUTOMATION LAYER                                    │
│                                                                          │
│   ┌─────────────────────────┐    ┌──────────────────────────────────┐ │
│   │  Power Automate         │    │  n8n (Self-hosted, Docker)         │ │
│   │  (Microsoft ecosystem)  │    │  (Cross-platform orchestration)    │ │
│   └─────────────────────────┘    └──────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
       │
       ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    META BUSINESS SUITE                                   │
│    Meta Pixel  │  Product Catalog  │  WhatsApp Business API             │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Website Layer

### Hosting: Netlify

The website is a static multi-page application (MPA) served from Netlify's global CDN. There is no build-time server rendering; all pages are pre-authored HTML with client-side JavaScript for interactivity.

**Key pages and their roles:**

| Page | Purpose |
|---|---|
| `index.html` | Homepage, hero section, brand introduction |
| `pricing.html` | Subscription tier selection (Zeus / Aphrodite / Lifesphere) |
| `ai-hub.html` | Member-facing AI persona hub |
| `codex.html` | Platform lore, documentation, and feature guide |
| `quickref.html` | Quick reference card for members |
| `oracle-pricing.html` | Oracle-specific pricing details |
| `privacy.html` | Privacy policy (GDPR/CCPA compliant) |
| `terms.html` | Terms of service |
| `data-deletion.html` | Meta-mandated data deletion request handler |

**`netlify.toml` responsibilities:**

- Defines the build command and publish directory
- Sets security HTTP headers (Content-Security-Policy, HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy)
- Configures the Netlify Functions directory
- Environment variable injection for serverless functions

**`_redirects` responsibilities:**

- SPA-style catch-all fallback rules
- Legacy URL redirects
- Force HTTPS redirect rules

### Edge Layer: Cloudflare Workers

A Cloudflare Worker named `meta-pixel-injector` sits in front of the Netlify origin and injects the Meta Pixel `<script>` block into every HTML response at the edge. This approach:

- Keeps pixel code out of source HTML files (single point of configuration)
- Ensures pixel fires even on pages added later without manual edits
- Allows pixel ID rotation or updates without a full site deploy

```
Request → Cloudflare Worker → Netlify Origin
                ↓
         Inject Meta Pixel into <head>
                ↓
         Return modified HTML response to browser
```

### Serverless Functions

The `netlify/` directory contains Netlify Functions (Node.js lambdas) used for:

- Stripe webhook handling
- Supabase write operations that must not run client-side
- Any server-side logic that requires environment variable access

---

## Payment Pipeline

### Subscription Tiers

| Tier | Price | Persona Level |
|---|---|---|
| Zeus | $49/month | Entry tier |
| Aphrodite | $79/month | Mid tier |
| Lifesphere | $149/month | Premium tier |

### Stripe Integration

Stripe manages all payment processing, subscription lifecycle, and billing. The integration flow:

```
  User selects tier on pricing.html
          │
          ▼
  Stripe Checkout Session created
  (via Netlify Function or client-side Stripe.js)
          │
          ▼
  User completes payment on Stripe-hosted page
          │
          ▼
  Stripe fires webhook event
  (checkout.session.completed / customer.subscription.*)
          │
          ▼
  Netlify Function receives webhook
  ├── Validates Stripe signature
  ├── Extracts customer + tier data
  └── Triggers downstream provisioning
          │
          ├── Writes persona record to Supabase
          └── Publishes event to n8n automation flow
```

**Key Stripe objects used:**

- `Customer` — one per subscriber, linked to Supabase user ID
- `Subscription` — tracks active tier, renewal date, status
- `Price` — one per tier (Zeus, Aphrodite, Lifesphere)
- `Webhook Endpoint` — points to Netlify Function URL

### Supabase (Persona Pantheon)

Supabase serves as the primary backend datastore for all persona data.

**Core tables (logical schema):**

```
personas
  ├── id (uuid, PK)
  ├── user_id (references auth.users)
  ├── tier (zeus | aphrodite | lifesphere)
  ├── stripe_customer_id
  ├── stripe_subscription_id
  ├── status (active | paused | cancelled)
  ├── persona_config (jsonb)
  ├── created_at
  └── updated_at

subscription_events
  ├── id (uuid, PK)
  ├── persona_id (references personas)
  ├── event_type (created | upgraded | downgraded | cancelled)
  ├── payload (jsonb)
  └── occurred_at
```

Row-level security (RLS) policies ensure each authenticated user can only read and write their own persona records.

---

## Meta Business Integration

### Meta Pixel

The Meta Pixel tracks user behavior across the website for:

- Conversion tracking (subscription purchases → Stripe checkout completions)
- Retargeting audience building
- Custom event tracking (`ViewContent`, `InitiateCheckout`, `Purchase`)

The pixel is injected at the edge via the Cloudflare Worker (see [Edge Layer](#edge-layer-cloudflare-workers)) to ensure consistent firing.

### Product Catalog

A Meta Product Catalog is maintained for the three subscription tiers, enabling:

- Dynamic ads that reference specific tiers by ID
- Facebook / Instagram catalog-based ad campaigns

### WhatsApp Business API

WhatsApp is integrated via the Meta Business Suite for:

- Post-purchase onboarding messages
- Persona activation confirmations
- Support escalation routing
- `messenger.js` handles the Messenger / WhatsApp chat widget embedded on the site

### Data Deletion Compliance

`data-deletion.html` provides the Meta-required callback URL for users who disconnect Kypria Technologies from their Facebook account and request deletion of their associated data. This page confirms receipt of the request and links to the support contact.

---

## Automation Layer

### Power Automate (Microsoft)

Power Automate is used for Microsoft-ecosystem workflows:

- **Email Notifications** — Subscriber welcome emails, renewal reminders, cancellation confirmations via Outlook/Exchange
- **Internal Alerts** — Teams or email notifications to the Kypria team on new signups, cancellations, and high-value events
- **Calendar Integration** — Optional persona check-in scheduling flows

### n8n (Self-hosted, Docker)

n8n is the primary cross-platform orchestration engine. It runs self-hosted on a Docker instance and handles:

- **Persona Provisioning Flow** — Triggered by Stripe webhook relay; creates Supabase persona record, sends welcome message, fires Meta conversion event
- **Tier Change Flow** — Handles upgrades/downgrades by updating Supabase records and sending confirmation comms
- **Lifecycle Reminders** — Cron-scheduled flows that check Supabase for upcoming renewals or inactive personas
- **Meta Event Sync** — Pushes server-side conversion events to the Meta Conversions API (supplementing browser-side pixel)

**n8n workflow topology (logical):**

```
Stripe Webhook
      │
      ▼
n8n Webhook Trigger
      │
      ├──► Supabase Node (upsert persona record)
      │
      ├──► HTTP Node (Meta Conversions API — server-side event)
      │
      ├──► WhatsApp Node (send onboarding message)
      │
      └──► Power Automate Webhook (trigger Microsoft-side flow)
```

---

## Infrastructure

### DNS

| Record Type | Name | Target |
|---|---|---|
| A / CNAME | kypriatechnologies.org | Cloudflare → Netlify |
| MX | @ | Email provider |
| TXT | @ | SPF, DKIM records |

All DNS is managed through Cloudflare, which provides DDoS protection, CDN caching, and edge worker execution.

### CDN & Caching

- **Cloudflare** caches static assets at the edge globally.
- **Netlify CDN** provides a secondary layer of global distribution.
- Cache-Control headers are set in `netlify.toml` to control asset TTLs.

### Hosting Summary

| Service | Role | Region |
|---|---|---|
| Netlify | Static site hosting + serverless functions | Global CDN |
| Cloudflare | DNS, CDN, edge workers | Global |
| Supabase | PostgreSQL database + auth | Configurable (us-east-1 default) |
| n8n (Docker) | Automation orchestration | Self-hosted VPS |

---

## Security Considerations

### HTTP Headers

Set via `netlify.toml` on all responses:

```
Content-Security-Policy: default-src 'self'; script-src 'self' *.stripe.com *.facebook.net; ...
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### Secrets Management

- All secrets (Stripe keys, Supabase keys, Meta tokens) are stored as **Netlify environment variables** — never in source code.
- n8n credentials are stored encrypted in the n8n credential store.
- The repository contains no `.env` files, tokens, or API keys.

### Stripe Webhook Validation

Every Stripe webhook received by the Netlify Function is validated against the `STRIPE_WEBHOOK_SECRET` signing secret before any processing occurs.

### Supabase Row-Level Security

All Supabase tables that store user persona data have RLS policies enabled. No unauthenticated reads or writes are permitted on user-owned rows.

### Cloudflare Worker Scope

The `meta-pixel-injector` worker has no access to Supabase or Stripe. It performs only HTML string injection and has no persistent state.

---

## Data Flow Diagrams

### New Subscriber Flow

```
  Browser                Stripe            Netlify Fn         Supabase          n8n
     │                     │                   │                 │               │
     │  Select tier         │                   │                 │               │
     │─────────────────────►│                   │                 │               │
     │  Redirect to checkout│                   │                 │               │
     │◄─────────────────────│                   │                 │               │
     │  Complete payment    │                   │                 │               │
     │─────────────────────►│                   │                 │               │
     │                      │  webhook event    │                 │               │
     │                      │──────────────────►│                 │               │
     │                      │                   │  upsert persona │               │
     │                      │                   │────────────────►│               │
     │                      │                   │  trigger flow   │               │
     │                      │                   │─────────────────────────────────►│
     │  Redirect to ai-hub  │                   │                 │               │
     │◄─────────────────────────────────────│                 │               │
     │                      │                   │                 │    WhatsApp + │
     │                      │                   │                 │    Meta event │
     │◄───────────────────────────────────────────────────────────────────────────│
```

### Page Request Flow (Edge Injection)

```
  Browser          Cloudflare Worker          Netlify CDN
     │                    │                       │
     │  GET /pricing.html │                       │
     │───────────────────►│                       │
     │                    │  Forward request       │
     │                    │──────────────────────►│
     │                    │  Return HTML (no pixel)│
     │                    │◄──────────────────────│
     │                    │  Inject Meta Pixel     │
     │                    │  into <head>           │
     │  Return HTML       │                       │
     │  (with pixel)      │                       │
     │◄───────────────────│                       │
```

### Persona Data Access Flow

```
  Member Browser        Supabase Auth           Supabase DB
        │                    │                       │
        │  Login (JWT)        │                       │
        │───────────────────►│                       │
        │  Return JWT token   │                       │
        │◄───────────────────│                       │
        │                    │                       │
        │  GET /personas (Bearer JWT)                 │
        │───────────────────────────────────────────►│
        │                    │  Validate JWT + RLS   │
        │                    │◄──────────────────────│
        │  Return own rows only                       │
        │◄───────────────────────────────────────────│
```

---

*Architecture document maintained by the Kypria Technologies engineering team. Last updated: March 2026.*
