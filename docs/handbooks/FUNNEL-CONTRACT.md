# FUNNEL CONTRACT — kypriatechnologies.org Mythic Persona Funnel

Space: AI Lab. Machine-readable truth of the funnel. No agent redesigns from vibes; any
change to this contract requires a PR that updates the code AND this file.
Version 1.1 — compiled 2026-10-23 (EDT). Status vocabulary shared with OPERATIONS-HANDBOOK.

---

## 1. The quiz's public API [VERIFIED 2026-10-23 at commit 153cf039]

Source of record: PR #83 diff (demos/mythic-persona-quiz/index.html +
supabase/functions/capture-lead/index.ts), merged to main 2026-10-23 06:42:43 UTC.

| Field | Value |
|---|---|
| Endpoint | https://baizupiweobjkarchsyc.supabase.co/functions/v1/capture-lead |
| Method | POST (OPTIONS returns 204 preflight; any other non-POST returns 405) |
| Transport | navigator.sendBeacon with Blob type application/json (survives page transition) |
| CORS | Access-Control-Allow-Origin only for https://kypriatechnologies.org; other origins get "null" |
| Body format | JSON only; malformed JSON -> 400 {"error":"invalid json"} |

### Request payload schema
| Field | Type | Server handling |
|---|---|---|
| email | string | lowercased, trimmed, max 254, regex ^[^\s@]+@[^\s@]+\.[^\s@]+$ else 400 {"error":"invalid email"} |
| archetype | string | trimmed max 64 -> leads.persona_result |
| utm_source / utm_medium / utm_campaign / utm_content / utm_term | string | trimmed max 128 each |
| referrer | string | document.referrer or null, max 512 |
| landing_path | string | window.location.pathname, max 512 |

### Response semantics
- 200 {"ok": true, "lead_id": "<uuid>"} — row inserted into public.leads.
- 400 — invalid JSON or invalid email. Nothing written.
- 405 — wrong method. Nothing written.
- 500 {"error":"insert failed"} — DB rejected the insert; see constraint traps.

### Idempotency: NONE [VERIFIED in function source]
No dedupe key, no unique constraint on leads.email. The beacon fires per result render —
retakes and refreshes create duplicate rows. Dedupe downstream:
`select email, count(*) from leads group by email having count(*) > 1;`
Do not fix client-side without a migration; document any change here.

### Database constraint traps [VERIFIED in live schema]
- leads.source allowed values: quiz, waitlist, dm_oracle, dm_subscribe, dm_mirror,
  comment, direct. Function hardcodes "quiz".
- leads.persona_result allowed values: zeus, aphrodite, lifesphere, or NULL. The quiz
  copy advertises 6 archetypes; ONLY these three key names will insert. Any new
  archetype key -> insert fails -> 500 -> silent lead loss (client swallows errors by
  design: "analytics must never block capture"). If archetypes expand, migrate the CHECK
  constraint FIRST, then ship quiz code.
- leads.status defaults to 'new'; allowed: new, contacted, converted, churned.

### Function env
SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY — read from edge-function secrets, never pasted
into dashboards. Verify presence via function behavior (200 vs 500), never print values.

---

## 2. UTM contract (posts -> quiz, never Stripe)

Pattern: utm_source=<platform>organic&utm_medium=post&utm_campaign=<archetype><batch>
Quiz URL: https://kypriatechnologies.org/demos/mythic-persona-quiz/
- Buy links surface ONLY on the quiz result page. Posts never link Stripe, m.me, or Patreon.
- All five utm_* fields flow end-to-end into the leads row. utm_content and utm_term are
  pass-through — use them for A/B caption ID and batch date respectively.
- GA4 event quiz_capture fires with the archetype; Meta Lead event fires with
  content_name = archetype. Both are try/catch-wrapped and must never block capture
  [VERIFIED in PR #83].

---

## 3. Voice / mapping registry: archetype -> temple -> Stripe -> return

Stripe product map verified 2026-05-18 via Stripe API (PRs #81, #82). Re-probe before edits.

| Archetype key | Temple | Stripe | Buy link (canonical) | Status |
|---|---|---|---|---|
| zeus | Zeus — $49/mo or $490/yr | prod_TVGm7qxwJwd2eU, price_1SYGFAADK1uzxo0bLHS82RMu, plink_1SlffkADK1uzxo0bBxG4J6Ml | https://buy.stripe.com/6oUbJ095Bcsfcopd6Z1gs0E (5 site refs) | [VERIFIED 2026-05-18; #81] |
| aphrodite | Aphrodite — $79/mo or $790/yr | price IDs: [OPEN] re-probe Stripe | quiz result: buy.stripe.com/5kQfZg3Lhak73RTgjb1gs0O; homepage: buy.stripe.com/eVqeVc0z5csfdst8QJ1gs0s | canon URLs; IDs re-verify |
| lifesphere | Lifesphere — $149/mo or $1490/yr | price IDs: [OPEN] re-probe Stripe | buy.stripe.com/3cI28q81xeAnbklff71gs0t | canon URLs; IDs re-verify |

Deactivated 2026-05-18 (PR #82), never reactivate: plink_1SYGWEADK1uzxo0bL3dxioCk,
plink_1TLN30ADK1uzxo0bX5YhqUiD, plink_1TMO03ADK1uzxo0bDPYqiCBo. Backup metadata:
docs/runbooks/stripe-deprecated-plinks.json.

### Return-URL / branded-copy discipline (the drift lesson)
- Branded copy never hardcodes platform URLs. The registry above is the only place buy
  links live; templates reference the registry, not string literals.
- Founding $19 tier is RETIRED (2026-05-15). Never mention.
- Any reference to Gumroad in shipped copy is drift: fail pre-flight.
- Site-wide hygiene probe: search the repo and the deployed HTML for storefront strings
  after every cache purge (see Operations Handbook Signature C).

---

## 4. The three blocked-then-unblocked checkpoints

| # | Checkpoint | Resolution | Anchor |
|---|---|---|---|
| 1 | Pixel ID correction | Registry said 750068155374586 / 1236706014984822; a session note cited 759068155374586; the code actually ships 1024027273624000 | [VERIFIED] repo code search at 153cf039: fbq init 1024027273624000 across all HTML pages (28 hits incl. inject-analytics.sh). [OPEN] confirm Events Manager dataset ownership |
| 2 | Email-gate default | Was localStorage-only with a Skip button (lead evaporated on device change) | [VERIFIED] PR #83: commit 2bdf507e + merge 153cf039, 2026-10-23 06:42 UTC. localStorage retained as fallback; beacon is primary |
| 3 | Google-Form bypass | Google Form waitlist still live alongside the gate | [OPEN] form ID on file with operator. Decide: retire it, or treat submissions as source=waitlist and reconcile into leads. Must not stay ambiguous |

---

## 5. Known seams for next session

- 4 competing CTAs on the quiz result page (pre-existing; untouched by PR #83).
- leads had 3 rows at compile time; end-to-end synthetic lead test still owed: submit
  the quiz with utm test params, expect 200 + row with source=quiz.
- Edge-cache lag observed post-merge: live text probe at ~03:10 EDT still returned the
  retired Gumroad note. Purge, re-probe, then close.

Changelog
- 2026-10-23 v1.1: corrected pixel hit-count wording; tightened hygiene probe wording.
- 2026-10-23 v1.0: initial compile from PR #83 diff + live schema dump.
