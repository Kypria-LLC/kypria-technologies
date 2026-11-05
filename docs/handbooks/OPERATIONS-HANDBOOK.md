# OPERATIONS HANDBOOK — Kypria Technologies

Space: Code & Automation. Owner of truth: this file, refreshed by probing — never by memory.
Version 1.2 — compiled 2026-10-23 (EDT), Gate 5 hardened 2026-11-05. Entries carry one of three statuses:
- [VERIFIED 2026-10-23] — confirmed live, with the probe used
- [REPORTED 2026-10-23] — diagnosed in the operator's forensic session; re-verify before acting
- [OPEN] — known gap, not yet resolved

Core rule: probe, don't remember. Every system below has a verification command. If the
command output disagrees with this file, the command wins and this file gets edited.

---

## 1. Environment map

| System | Canonical identity | Responsibility | Verification probe | Status |
|---|---|---|---|---|
| GitHub org | Kypria-LLC | Source of truth for site + automation | `gh api repos/Kypria-LLC/kypria-technologies` | [VERIFIED] repo active, last push 2026-10-23 06:42 UTC |
| GitHub user | alexandros-thomson (Kostadinos J Kyprianos, Kypria LLC) | Commits, merges | Connector `get_me` | [VERIFIED] id 196420087 |
| Site repo | Kypria-LLC/kypria-technologies (main) | kypriatechnologies.org static site, PWA, Cloudflare integration | `gh api repos/Kypria-LLC/kypria-technologies/commits/main` | [VERIFIED] head = 153cf039 (PR #83) |
| Legacy mirror | alexandros-thomson/kypriatechnologies | Old personal copy — stale, never deploy from it | compare `updated_at` (2026-04-16) | [VERIFIED STALE] |
| Automation repo | Kypria-LLC/ops-heartbeats (private) | Cron keepalives (Supabase, API) | `gh api repos/Kypria-LLC/ops-heartbeats` | [VERIFIED] exists, last update 2026-05-16 |
| Netlify | kypriatechnologies.org, auto-deploy from repo main | Hosting + functions | Netlify API `GET /sites` with token from .env; confirm build-settings origin line says repo, not UI | [REPORTED] probe before any deploy claim |
| Cloudflare | zone for kypriatechnologies.org | DNS + cache + SSL | Connector `cloudflare_api_key-list-dns-records` per zone | [OPEN] zone map not yet inventoried |
| Supabase | Org "Kyria" (fnrsrjptqfizkepbaufl), project MythicAssetCatalog ref baizupiweobjkarchsyc, us-east-2, Postgres 17 | Single source of truth for leads/customers | Connector `list_projects`, `list_tables`, `execute_sql` | [VERIFIED] ACTIVE_HEALTHY; 22 public tables incl. `leads` (3 rows) and the empty stripe_* set |
| Stripe | livemode | Payments, payment links | `GET /v1/payment_links?active=true&expand[]=data.line_items` | [VERIFIED 2026-05-18 per PR #81/#82] re-probe before revenue claims |
| Meta | App 1161892008605801, Graph v24.0 | Page/IG publishing via Meta Business Suite only | Local browser session (facebook_pages connector returns null — known limitation) | [STALE since 2026-08-24] |

### Solgate
[REPORTED] Solgate appeared in session context but no live probe has been run. Treat its
role/host as unverified until a dashboard read happens. Do not quote settings from memory.

---

## 2. The three failure signatures

### Signature A — Zombie cron: alive is not working
Symptom: scheduler fires on time, logs show invocation, but the intended side effect never
lands (no row written, no email sent, no state change).
- Detection: compare "job ran" evidence (schedule log) against "world changed" evidence
  (target table row, sent message, state.json mtime). First without second = zombie.
- Cron registry: 06a5c96f Divine Trinity Auto-Reply, schedule 25 * * * * UTC, quiz-only
  CTA, state at cron_tracking/06a5c96f/state.json. 4c04e762 Stripe Welcome Email,
  schedule 8 * * * * UTC, PAUSED until first paid subscriber — silent skip by design,
  do not page on it.
- Retired: Power Automate flow 8ed317ea (Off since 2026-08-24). Never re-auth, never invoke.
- Status: [REPORTED] for the diagnosed instance; the detection pattern is permanent.

### Signature B — Suspended-team domain hostage
Symptom: site or domain dies with no code change. Root cause: billing/team suspension
upstream freezes the domain; the only warning is a single email with a ~1-day fuse that
was not read.
- Detection order: team/billing suspension status BEFORE touching code, DNS, or deploys.
  A suspended team makes every downstream check lie.
- Prevention: billing-warning emails route to a folder that is actually read; domain
  renewals and team status get a monthly calendar probe.
- Status: [REPORTED].

### Signature C — Fetcher false-negatives: agent tools lie
Two directions, both observed:
- False 404: tooling reports a URL missing while a browser loads it fine.
- False stale: tooling returns pre-change content because of edge cache (observed
  2026-10-23 ~03:10 EDT: served quiz copy still showed the Gumroad note removed by PR #83).
- Rule: no "down", "deleted", or "regressed" claim without two independent probes
  (curl with real UA + browser render, or repo source + live response after cache purge).
- Status: [REPORTED] + [VERIFIED this session in the cache direction].

---

## 3. Gates (never done casually)

1. main is merge-deployed only. Every change arrives via PR (the email-gate fix went in
   as PR #83 — that is the pattern). Auto-deploy from merge; no staging.
2. Domain moves require support-ticket discipline: ticket drafted, direction read twice
   ("from X to Y" written out), then filed. Use the direction checklist directly below.
3. Secrets live in .env, never in dashboard paste-fields. The capture-lead edge function
   reads SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from function env [VERIFIED at
   153cf039]. Any secret pasted into a web dashboard field is treated as exposed: rotate.
4. Meta publishing: Meta Business Suite only. facebook_pages connector returning null is
   a known limitation — use local browser sessions, not connector retries.
5. Blacklist — every ID below is never referenced, never spent against:
   - 809223708930617 — never use (blacklisted)
   - 1909290965860482 — never use (blacklisted)
   - 120238801786230646 — never use (blacklisted)
   - pixel 750068155374586 — never use in any ad context
   - ad account 2049364046010873 — never use for new spend without explicit approval

### The ticket-direction checklist (the one that caught the flip)
- [ ] Write the move as two sentences: "CURRENT: <A> serves <domain>." and
      "TARGET: <B> serves <domain>." Read both out loud.
- [ ] Screenshot the current state; attach to the ticket before requesting change.
- [ ] A second reader (human or agent) confirms direction words, not just domain names.
- [ ] After execution: probe the TARGET, then probe that the OLD state is gone.
- [ ] Log ticket number + direction + probe output in this file's changelog.

---

## 4. Recovery drills (run in order, stop at first hit)

### Drill 1 — "Site down?"
1. Team/billing suspension status first (Signature B). Do not touch code.
2. `curl -sI https://kypriatechnologies.org` — Cloudflare up but origin down points at
   Netlify.
3. Netlify deploy log for the last main merge.
4. Only then: repo diff since last known-good deploy.

### Drill 2 — "Deploy broken?"
1. Read the build-config origin line first (repo config vs. UI settings). Assuming UI
   settings while the repo owns config wastes an hour — that was tonight's lesson.
2. Confirm the merge landed on main:
   `gh api repos/Kypria-LLC/kypria-technologies/commits/main`.
3. Purge Cloudflare cache and re-probe before editing anything (Signature C).

### Drill 3 — "Lead missing?"
Trace in exactly this order; each step must produce evidence before moving on:
1. Capture event: did the browser fire sendBeacon? (DevTools Network, filter "capture-lead")
2. Network tab: POST to
   https://baizupiweobjkarchsyc.supabase.co/functions/v1/capture-lead returned 200 with
   {"ok": true, "lead_id": ...}?
3. Function log: Supabase edge-function logs for capture-lead (500 = insert failed; see
   FUNNEL-CONTRACT constraint traps, especially the 3-archetype limit).
4. leads table: `select * from leads order by created_at desc limit 10;`
Rule: the gap is always between two adjacent steps. Find the pair, fix that seam.

---

## 5. Inventory snapshot (VERIFIED 2026-10-23; refresh next session)

- Repo head: 153cf039 "Wire quiz email gate to Supabase lead capture (#83)", 2026-10-23
  06:42 UTC.
- Supabase MythicAssetCatalog: ACTIVE_HEALTHY; leads (3 rows, RLS on); stripe_customers,
  stripe_subscriptions, stripe_payments, payments, stripe_webhook_events all present and
  EMPTY — consistent with baseline: 0 paying customers.
- Meta pixel shipped in source: 1024027273624000 across all HTML pages (28 fbq-init
  pattern hits including the injector script inject-analytics.sh) at commit 153cf039.
  Registry values 750068155374586 / 1236706014984822 are NOT what the site fires.
  Dataset ownership of the live ID: [OPEN] verify in Events Manager.
- Live-page probe at ~03:10 EDT still showed the retired Gumroad note that PR #83
  removed — expected edge-cache lag; confirm gone after purge. [OPEN]

Changelog
- 2026-11-05 v1.2: Gate 5 blacklist rendered as per-line "never use" bullets so any
  single-line grep hit is self-explaining; committed to repo under docs/handbooks/.
- 2026-10-23 v1.1: fixed Gates cross-reference, added cron schedules, corrected pixel
  hit count wording.
- 2026-10-23 v1.0: initial compile from forensic session + live probes (GitHub commits
  and PR #83 diff, Supabase schema dump, repo code search, live page fetch).
