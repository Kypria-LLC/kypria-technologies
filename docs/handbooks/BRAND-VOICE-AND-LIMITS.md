# BRAND VOICE AND LIMITS — Kypria / Godly Zeus AI

Space: Brand & Distribution. This file is the line between god-mode theology and
publishable reality. One voice per artifact. Draft until human-approved.
Version 1.1 — compiled 2026-10-23 (EDT). Status vocabulary shared with OPERATIONS-HANDBOOK.

---

## 1. Voice inventory

Canon demo URL (all voices in situ): https://kypriatechnologies.org/demos/mythic-persona-quiz/

| Voice | Syntax | Banned words/patterns | CTA | Anchor line | Cadence limits |
|---|---|---|---|---|---|
| ZEUS | Declarative, 6-8 word lines | "I think", "just", "maybe" | Command: DM ORACLE | "The throne recognizes you, warrior." | — |
| APHRODITE | Flowing, 8-12 words | power/throne/tech vocabulary | Invitation: DM MIRROR | "The mirror catches light you did not know was yours." | max 1-2 posts/week |
| LIFESPHERE | Nature metaphor, 7-10 words | urgency, scarcity | Community CTA | "The roots remember what the mind forgets." | at least 2 posts/week |
| TRINITY | Cross-persona only | single-archetype framing | — | — | the ONLY voice for quiz reels and Three-Temple mentions |

Spelling is canon: Lifesphere with an h. No emoji in caption bodies, ever. Bilingual
EN/Greek — Greek is authored or consciously adapted, never an afterthought dub.

### One voice per artifact
Every asset (post, reel, caption, quiz result block) declares exactly one voice in its
draft row before generation. Mixed-voice output is a defect, not a style.

### Quotas per 7 posts
2 Paradox, 2 Revelation, 1 Ritual, 1 Question, 1 Proof. Temple mentions: exactly 2 —
one Proof + one Revelation, both in Trinity voice, no prices in captions, never inside
Question posts.

### Times (ET) and cross-post
Zeus 19:00, Aphrodite 21:00, Lifesphere 06:00, Trinity 21:00 Sunday. FB cross-post
+30 min. Publisher: Meta Business Suite only; image upload is a human step.

### Visual limits
Gold #d4af37 on navy #0a0a14, Byzantine mosaic language. 9:16 for reels. Must work
sound-off; text overlay added in edit, never baked in by AI (no AI-drawn text). Every
AI visual carries the platform's AI-generated disclosure line.

---

## 2. Production targets and owners

| Surface | Owner | Workflow | Status |
|---|---|---|---|
| Hosting (Netlify) | Kostas | merge-to-main deploys; Handbook Drills 1-2 on failure | [REPORTED 2026-10-23] |
| Domains | Kostas + support-ticket workflow | direction-checked ticket wording (the ticket-direction checklist in the Operations Handbook, Gates section) | [REPORTED] |
| Content | Aurelius, with Pineapple-Lion sign-off | Draft batch -> sign-off -> MBS schedule rows | [REPORTED] |
| Lead data / revenue truth | Supabase + Stripe + GA4 + Meta | FUNNEL-CONTRACT is the schema of record | [VERIFIED 2026-10-23] |

Ownership test: if a task touches two surfaces (e.g. a domain move that changes where
content points), the ticket owner drafts and the other owner reads the direction words
before execution.

---

## 3. The publish pre-flight table

Run all ten lines against every batch BEFORE it enters Meta Business Suite.

| # | Check | Pass condition | Incident it prevents |
|---|---|---|---|
| 1 | Promo freshness | No offer/promo older than its stated window on any linked page | Promo still live 5 months past the new moon |
| 2 | Pixel match | Page source fbq init = 1024027273624000 (probe, not memory) | Pixel ID mismatch (registry vs. shipped code) |
| 3 | Checkout lane | Zero Gumroad / external-storefront strings on kypriatechnologies.org — repo grep plus live-page probe after cache purge | Gumroad CTA on a Stripe site — OBSERVED LIVE 2026-10-23 ~03:10 EDT in served quiz copy even after PR #83 removal; edge lag suspected, confirm gone after purge [OPEN] |
| 4 | Link lane | Posts link the quiz URL with UTM only; no Stripe, m.me, or Patreon in captions | Revenue bypass + attribution loss |
| 5 | One voice | Draft row declares one voice; output matches its syntax/banlist | Regen voice bleed |
| 6 | Fate language | No guaranteed outcomes, no fake testimonials, no therapy claims, no politics, no sexual content | Platform strikes + trust burn |
| 7 | AI disclosure | Every AI visual carries the disclosure line per platform norms | Policy violation |
| 8 | Format | 9:16 reels, sound-off legible, overlay text added in edit | Unwatchable silent autoplay |
| 9 | Quota | Batch of 7 matches 2/2/1/1/1; temple mentions exactly 2, Trinity voice | Funnel cadence drift |
| 10 | Money silence | No prices in captions; pricing lives only on the quiz result page | Pre-qualifying the wrong click |

A batch that fails any line returns to Draft. "We'll fix it after it posts" is not a
state this brand has.

---

## 4. Limits (permanent, not per-campaign)

- Personas are archetypes for reflection — not therapy, finance, or medicine.
- Buy links surface ONLY on the quiz result page. Captions never carry prices.
- Lions Prophecy is a separate project in a separate Space; no reference, no crossover.
- State is Draft until a human approves. Schedule rows are prepared, never auto-published.
- Followers last verified at 3 (2026-04-23); all publishing state is stale since
  2026-08-24 — re-verify in Meta Business Suite before any cadence claims.

Changelog
- 2026-10-23 v1.1: fixed Operations Handbook cross-reference wording.
- 2026-10-23 v1.0: initial compile; pre-flight line 3 promoted to OPEN after the live
  Gumroad sighting post-PR #83.
