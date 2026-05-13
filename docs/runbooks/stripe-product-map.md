# Kypria / Godly Zeus Stripe Product Map — v1.1 (May 12 2026, Founding tier shipped)

> **WARNING: livemode = true. All transactions are real money. There is no sandbox here. Every product created, price set, or payment link generated is live.**

---

## Account Snapshot — May 12 2026

| Field | Value |
|---|---|
| Mode | livemode = true |
| Connector | `stripe` (CONNECTED) |
| Sender email | (redacted — Stripe account owner email; see Stripe Dashboard → Settings → Business details) |
| Customers | 0 |
| Payment intents (all time) | 0 |
| Active subscriptions | 0 |
| Current balance | $0 |
| Products in catalog | 20+ |
| Products sold from website | 3 (Zeus Oracle, Aphrodite Mirror, Lifesphere Balance) |

---

## Canonical Product Table

| Persona | Product Name | Price | Product ID | Buy Link(s) |
|---|---|---|---|---|
| Zeus | Zeus Oracle (display name on site) | $49 one-time | TODO: resolve concrete `prod_...` ID. Stripe currently holds multiple Zeus-named products (Zeus Temple x3, Zeus AI - Pro/Starter/Enterprise/Annual/Setup). Match buy link `6oUbJ095Bcsfcopd6Z1gs0E` against price.product on the dashboard before automating against this row. | https://buy.stripe.com/6oUbJ095Bcsfcopd6Z1gs0E |
| Aphrodite | Aphrodite Mirror | $79 one-time | prod_ULLD9uSHwzaznx | Quiz: https://buy.stripe.com/5kQfZg3Lhak73RTgjb1gs0O — Homepage: https://buy.stripe.com/eVqeVc0z5csfdst8QJ1gs0s |
| Lifesphere | Lifesphere Balance | $149 one-time | prod_TjrqhMKSxlZ8hH | https://buy.stripe.com/3cI28q81xeAnbklff71gs0t |
| All three | Founding Member | $19/mo recurring | prod_UVO81vjCKsEdfp (price_1TWNLoADK1uzxo0bLyjACyzu, cap 50 seats) | https://buy.stripe.com/4gMbJ0chN2RF0FH0kd1gs0P |

---

## Persona-to-Product Mapping (Stripe Welcome Email Cron 4c04e762)

The cron reads the product ID from the completed payment intent and assigns a persona voice for the welcome email.

| Product ID | Persona Voice |
|---|---|
| prod_ULLD9uSHwzaznx | Aphrodite |
| prod_TjrqhMKSxlZ8hH | Lifesphere |
| prod_UVO81vjCKsEdfp (Founding Member) | Quiz result metadata persona; default Zeus if unavailable |
| (all other product IDs) | Zeus (default) |

---

## Quiz Result → Buy Link Routing

| Quiz Result | Buy Link |
|---|---|
| Zeus | https://buy.stripe.com/6oUbJ095Bcsfcopd6Z1gs0E |
| Aphrodite | https://buy.stripe.com/5kQfZg3Lhak73RTgjb1gs0O |
| Lifesphere | https://buy.stripe.com/3cI28q81xeAnbklff71gs0t |

Always use the quiz-specific Aphrodite link (ending `gjb1gs0O`), not the homepage link, when serving from the quiz result page.

The result page should collapse to ONE persona-matched Stripe Buy hero + the $19 Founding Member anchor below it. Do not surface competing CTAs.

---

## Founding Member Tier (SHIPPED May 12 2026 via commit 0d99ce7)

| Field | Value |
|---|---|
| Name | Kypria Temple — Founding Member |
| Description | All three oracles. Founding 50 seats. Locked at $19/mo for life. |
| Product ID | prod_UVO81vjCKsEdfp |
| Price ID | price_1TWNLoADK1uzxo0bLyjACyzu |
| Price | $19.00 USD recurring monthly |
| Payment Link | https://buy.stripe.com/4gMbJ0chN2RF0FH0kd1gs0P |
| Metadata: tier | founding |
| Metadata: seat_cap | 50 |
| Metadata: seats_remaining | 50 (psychological cap; no hard enforcement) |
| Metadata: persona | all |
| Placement | Anchor below persona-matched Stripe Buy hero on quiz result page only |
| Seat-cap monitor | Cron 1853ff0d, hourly at :16 UTC, alerts at 40 active, critical at 50 |
| State file | `cron_tracking/founding_seat_cap/state.json` (path relative to the cron runtime workspace; configurable via `KYPRIA_CRON_STATE_DIR` env var) |

---

## Active Cron Summary

| Cron ID | Name | Status | Notes |
|---|---|---|---|
| 4c04e762 | Stripe Welcome Email | PAUSED | Waiting for first paid subscriber. Do not resume manually — it triggers on payment intent confirmation. |

---

## Pitfalls

| Pitfall | Details |
|---|---|
| livemode vs test mode | This account is livemode only. Test-mode creations appear in the Stripe test dashboard and have no effect on production. Confirm you are in livemode before creating any resource. |
| Duplicate products | Always call `list_products` before creating a new product. The catalog already holds 20+ entries; duplicates will create buy-link confusion. |
| Forgetting to update this file | After creating any new tier, immediately update the Canonical Product Table and Persona-to-Product Mapping above. Future threads and crons read this file as the source of truth. |
| Calling stripe.connect from cron | The Stripe Welcome Email cron (4c04e762) explicitly silences the connect call. Do not add `stripe.connect` calls inside cron logic — it adds noise and is unnecessary when the connector is already authenticated. |
| Wrong Aphrodite link | There are two Aphrodite buy links. Use the quiz link (`5kQfZg3Lhak73RTgjb1gs0O`) from the quiz result page and the homepage link (`eVqeVc0z5csfdst8QJ1gs0s`) from the main site only. |

---

## Change Log

| Version | Date | Notes |
|---|---|---|
| v1.0 | May 12 2026 | Initial canonical map authored after revenue playbook diagnosis. |
| v1.1 | May 12 2026 | Founding Member tier shipped (prod_UVO81vjCKsEdfp, price_1TWNLoADK1uzxo0bLyjACyzu, $19/mo). Quiz result page wired to new buy link (commit 0d99ce7). Seat-cap monitor cron 1853ff0d deployed. |
