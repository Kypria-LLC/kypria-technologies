# FUNNEL CONTRACT — kypriatechnologies.org Mythic Persona Funnel

> Space: AI Lab. Machine-readable truth of the funnel. No agent redesigns from vibes;
> any change to this contract requires a PR that updates the code AND this file.

| | |
|---|---|
| **Version** | 1.2 — compiled 2026-10-24 (EDT) |
| **Status vocabulary** | shared with OPERATIONS-HANDBOOK |
| **Source of record** | PR #83 diff (`demos/mythic-persona-quiz/index.html` + `supabase/functions/capture-lead/index.ts`), merged to main 2026-10-23 06:42:43 UTC; mapping, CTA structure, and live schema re-verified 2026-10-24 against repo code and the deployed endpoint |
| **Repo** | Kypria-LLC/kypria-technologies |
| **Supersedes** | v1.1 (2026-10-23) |

---

## 1. The quiz's public API — VERIFIED 2026-10-24, live end-to-end

| Field | Value |
|---|---|
| **Endpoint** | `https://baizupiweobjkarchsyc.supabase.co/functions/v1/capture-lead` |
| **Method** | `POST` (`OPTIONS` returns 204 preflight; any other non-POST returns 405) |
| **Transport** | `navigator.sendBeacon` with Blob type `application/json` (survives page transition) |
| **CORS** | `Access-Control-Allow-Origin` only for `https://kypriatechnologies.org`; other origins get `"null"` |
| **Body format** | JSON only; malformed JSON → `400 {"error":"invalid json"}` |
| **JWT** | `verify_jwt = false` (anonymous beacon by design; `sendBeacon` cannot set an `Authorization` header). Defense is the CORS allowlist + RLS INSERT-only, not JWT. |

### Request payload schema

| Field | Type | Server handling |
|---|---|---|
| `email` | string | lowercased, trimmed, max 254, regex `^[^\s@]+@[^\s@]+\.[^\s@]+$` else `400 {"error":"invalid email"}` |
| `archetype` | string | trimmed max 64 → mapped via `ARCHETYPE_TO_PERSONA` → `leads.persona_result` (see §1a) |
| `utm_source` / `utm_medium` / `utm_campaign` / `utm_content` / `utm_term` | string | trimmed max 128 each |
| `referrer` | string | `document.referrer` or null, max 512 |
| `landing_path` | string | `window.location.pathname`, max 512 |

### Response semantics

- **200** `{"ok": true, "lead_id": "<uuid>"}` — row inserted into `public.leads`.
- **400** — invalid JSON or invalid email. Nothing written.
- **405** — wrong method. Nothing written.
- **500** `{"error":"insert failed"}` — DB rejected the insert; see constraint traps.

### 1a. Archetype → persona mapping (the stored layer) — VERIFIED 2026-10-24

The quiz copy advertises 6 archetypes. The stored column `leads.persona_result` holds the **temple persona**, not the raw archetype key. The function maps the key before insert; the map is mirrored between `demos/mythic-persona-quiz/index.html` and `supabase/functions/capture-lead/index.ts` and must be kept in sync.

| Quiz archetype key | Stored `persona_result` (temple) |
|---|---|
| `architect` | `zeus` |
| `visionary` | `zeus` |
| `executor` | `zeus` |
| `analyst` | `lifesphere` |
| `curator` | `lifesphere` |
| `synthesizer` | `aphrodite` |

Any archetype key not in this map stores `NULL` (function default), never an unmapped raw key. If archetypes expand, add the mapping in BOTH files AND migrate the CHECK constraint FIRST, then ship quiz code.

### 1b. Live end-to-end verification (the owed synthetic test) — CLOSED 2026-10-24

Canary submission 2026-10-24 18:29 UTC through the live public path returned `200 {"ok":true,"lead_id":"8ea538b3-…"}`; the row read back with `persona_result='zeus'` (archetype `architect` mapped), `source='quiz'`, and all five `utm_*` fields intact (`utm_source=testorganic`, `utm_medium=post`, `utm_campaign=zeus_b00`, `utm_content=canary2`, `utm_term=2026-10-24`). Closes the v1.1 seam "end-to-end synthetic lead test still owed."

### Idempotency: NONE — VERIFIED in function source

No dedupe key, no unique constraint on `leads.email`. The beacon fires per result render — retakes and refreshes create duplicate rows. Dedupe downstream:

```sql
select email, count(*) from leads group by email having count(*) > 1;
```

Do not fix client-side without a migration; document any change here.

## Database constraint traps — VERIFIED in live schema 2026-10-24

- **`leads.source`** allowed values: `quiz`, `waitlist`, `dm_oracle`, `dm_subscribe`, `dm_mirror`, `comment`, `direct`. Function hardcodes `"quiz"`.
- **`leads.persona_result`** allowed values: `zeus`, `aphrodite`, `lifesphere`, or `NULL`. Only these three persona names will insert; an unmapped value now fails the CHECK constraint and returns 500.
- **`leads.status`** defaults to `'new'`; allowed: `new`, `contacted`, `converted`, `churned`.

**Silent-loss guard:** the client swallows errors by design ("analytics must never block capture"), so a 500 loses the lead silently. The §1a map plus the now-enforcing CHECK constraint (§1c) together prevent silent loss: the map guarantees only valid personas are sent, and the constraint rejects anything that slips through.

### 1c. Constraint integrity — the NULL footgun fix — CHANGED 2026-10-24

On 2026-10-24 a live audit found the original `leads_persona_result_check` placed `NULL::text` inside the `ANY()` array. Because `x = ANY(array_with_null)` never evaluates FALSE under three-valued logic, the constraint passed everything and had guarded nothing since creation. Migration **`fix_leads_persona_result_check_null_footgun`** (2026-10-24) dropped and recreated it:

```sql
CHECK ((persona_result IS NULL) OR (persona_result = ANY (ARRAY['zeus','aphrodite','lifesphere'])))  -- convalidated: true
```

The migration also conformed one pre-mapping canary row (`architect`→`zeus`) and deleted a probe row. Any persona claim about rows dated before 2026-10-24 must be re-checked against this rebuild date: a stored `architect` value from before the fix proves the constraint was vacuous, not that the value was ever valid.

### Function env

`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — read from edge-function secrets, never pasted into dashboards. Verify presence via function behavior (200 vs 500), never print values.

---

## 2. UTM contract (posts → quiz, never Stripe)

Pattern:

```
utm_source=<platform>organic&utm_medium=post&utm_campaign=<archetype><batch>
```

- Quiz URL: `https://kypriatechnologies.org/demos/mythic-persona-quiz/`
- Buy links surface ONLY on the quiz result page. Posts never link Stripe, m.me, or Patreon.
- All five `utm_*` fields flow end-to-end into the leads row. `utm_content` and `utm_term` are pass-through — use them for A/B caption ID and batch date respectively.
- GA4 event `quiz_capture` fires with the archetype; Meta `Lead` event fires with `content_name = archetype`. Both are try/catch-wrapped and must never block capture (VERIFIED in PR #83).
- Launch campaign convention: `utm_campaign=trinityb01` is the first tracked organic batch.

---

## 3. Voice / mapping registry: archetype → temple → Stripe → return

Stripe product map verified 2026-05-18 via Stripe API (PRs #81, #82). Re-probe before edits.

| Archetype key | Temple | Stripe | Buy link (canonical) | Status |
|---|---|---|---|---|
| `zeus` | Zeus — $49/mo or $490/yr | `prod_TVGm7qxwJwd2eU`, `price_1SYGFAADK1uzxo0bLHS82RMu`, `plink_1SlffkADK1uzxo0bBxG4J6Ml` | `https://buy.stripe.com/6oUbJ095Bcsfcopd6Z1gs0E` | VERIFIED 2026-05-18; #81 |
| `aphrodite` | Aphrodite — $79/mo or $790/yr | price IDs: [OPEN] re-probe Stripe | quiz result: `buy.stripe.com/5kQfZg3Lhak73RTgjb1gs0O`; homepage: `buy.stripe.com/eVqeVc0z5csfdst8QJ1gs0s` | canon URLs; IDs re-verify |
| `lifesphere` | Lifesphere — $149/mo or $1490/yr | price IDs: [OPEN] re-probe Stripe | `buy.stripe.com/3cI28q81xeAnbklff71gs0t` | canon URLs; IDs re-verify |

Deactivated 2026-05-18 (PR #82), never reactivate: `plink_1SYGWEADK1uzxo0bL3dxioCk`, `plink_1TLN30ADK1uzxo0bX5YhqUiD`, `plink_1TMO03ADK1uzxo0bDPYqiCBo`. Backup metadata: `docs/runbooks/stripe-deprecated-plinks.json`.

### Result-page CTA structure — VERIFIED 2026-10-24

The result page renders exactly **2 primary CTAs**: (1) a single persona-matched **Temple Buy** hero linking the persona's canonical Stripe URL, and (2) a **Share Your Archetype** button. Secondary affordances: an "Explore the full Pantheon" link, a dynamic "Visit the Temple" link, and a "Retake the Trial" button. This supersedes the v1.1 note "4 competing CTAs": the design intent is a single Temple Buy hero + share, with no competing buy CTAs.

### Return-URL / branded-copy discipline (the drift lesson)

- Branded copy never hardcodes platform URLs. The registry above is the only place buy links live; templates reference the registry, not string literals.
- Founding $19 tier is RETIRED (2026-05-15). Never mention.
- Any reference to Gumroad in shipped copy is drift: fail pre-flight. (The deployed quiz HTML was probed 2026-10-24 and contains NO Gumroad or Google-Form waitlist strings — this file is clean.)
- Site-wide hygiene probe: search the repo and the deployed HTML for storefront strings after every cache purge (see Operations Handbook Signature C).

---

## 4. The three blocked-then-unblocked checkpoints

| # | Checkpoint | Resolution | Anchor |
|---|---|---|---|
| 1 | Pixel ID correction | Registry said `750068155374586` / `1236706014984822`; a session note cited `759068155374586`; the code actually ships `1024027273624000` | [VERIFIED] repo code search at `153cf039`: `fbq init 1024027273624000` across all HTML pages (28 hits). [OPEN] confirm Events Manager dataset ownership |
| 2 | Email-gate default | Was localStorage-only with a Skip button (lead evaporated on device change) | [VERIFIED] PR #83: commit `2bdf507e` + merge `153cf039`, 2026-10-23 06:42 UTC. localStorage retained as fallback; beacon is primary |
| 3 | Google-Form bypass | Google Form waitlist was live alongside the gate | [RESOLVED 2026-10-24] legacy Google Form retired; quiz email gate is the sole capture path (corroborated in code: "the legacy Google Form is retired"). The standalone form (ID on file with operator) may still accept stale submissions — treat any that arrive as `source=waitlist` and reconcile via an authorized path, not capture-lead. |

---

## 5. Known seams for next session

- **Result-page CTAs.** Resolved — exactly 2 primary CTAs (Temple Buy + Share). See §3.
- **Synthetic lead test.** CLOSED 2026-10-24 — see §1b. A verified canary row now exists.
- **Google Form.** Standalone form may still exist outside the page even though the on-page bypass is retired. Decide retire vs. reconcile-as-waitlist; must not stay ambiguous.
- **Historical form responses.** Any pre-retirement Google Form responses are PENDING operator export; import as `source=waitlist` via an authorized path (not capture-lead).
- **Stripe price IDs.** `aphrodite` and `lifesphere` price IDs are [OPEN]; re-probe Stripe before edits.
- **Pixel dataset ownership.** Checkpoint 1 sub-item: confirm Events Manager dataset ownership for pixel `1024027273624000`.
- **Edge-cache lag.** Observed post-merge on 2026-10-23: a live text probe still returned the retired Gumroad note at ~03:10 EDT. Purge, re-probe, then close after the next copy change.
- **Pre-2026-10-24 persona data.** Any `persona_result` assertion about rows written before the §1c constraint rebuild must be re-validated; the old constraint was vacuous.

---

## Changelog

| Version | Date | Change |
|---|---|---|
| **v1.2** | 2026-10-24 | Added §1a archetype→persona mapping and §1b live end-to-end verification; rewrote constraint traps to reflect the armed CHECK constraint; added §1c NULL-footgun migration record; marked checkpoint 3 RESOLVED; corrected the result-page CTA description to the verified 2-CTA structure (superseding "4 competing CTAs"); confirmed the quiz HTML is free of Gumroad/waitlist strings; added the `trinityb01` launch-campaign convention. |
| **v1.1** | 2026-10-23 | corrected pixel hit-count wording; tightened hygiene probe wording. |
| **v1.0** | 2026-10-23 | initial compile from PR #83 diff + live schema dump. |
