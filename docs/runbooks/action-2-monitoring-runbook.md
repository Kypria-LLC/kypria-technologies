# Action 2 — FB Ad Relaunch Monitoring Runbook

## STATUS: DEFERRED — Meta new-business cooldown on Kypria portfolio

**Original launch Wed May 13 2026 cancelled.** Meta is blocking cross-business asset sharing on Kypria portfolio 1986097145242511 because the portfolio is too new. Tooltip: "Businesses new to Facebook Products can share this asset by assigning a partner from another business after several weeks of following our policies." No partner-share, no connected-asset, no rename was executed.

**Earliest retry window: Tue May 26 2026.** Re-attempt sequence is at the bottom of this doc.

## Campaign Spec (locked May 12 2026, IDs corrected)

| Field | Value |
|---|---|
| Campaign objective | Sales (manual setup, NOT Advantage+ Catalog) |
| Ad account | 812929881544066 (Kypria BUNDLES Catalog Ads, Kypria LLC portfolio 701331759350000) |
| Optimization event | Pixel Lead |
| Pixel ID | 1236706014984822 (Kypria Web Pixel, owned by Kypria portfolio 1986097145242511) |
| Page identity | `1058205557375892` (Godly Zeus AI — canonical Business Manager / Ads Manager ID). Public URL form `61576793849282` also resolves to the same Page. Portfolio: Godly Zeus by Kypria Technologies (2061212768049584). Verified via Business Settings 2026-05-12 22:07 EDT. |
| Creative | Zeus Proclamation Reel (use "Existing post from Page", not Upload Media) |
| Headline | Which oracle forged you? |
| Primary text | Three oracles. One throne. Take the 60-second quiz to see which one forged you. No signup until you finish. |
| CTA button | Learn More |
| Destination | https://kypriatechnologies.org/demos/mythic-persona-quiz/?utm_source=fb_ads&utm_medium=cpc&utm_campaign=oracle_relaunch_2026_05 |
| Daily budget | $5 |
| 7-day hard cap | $35 |
| Auto-pause | CPL > $5 |
| Geo | US only |
| Audience | Advantage+ Audience (auto) |
| Placements | Advantage+ Placements ON |
| Launch | TBD — first Wednesday after cooldown lifts, 9:00 AM EDT |
| End date | Launch + 7 days |

## Pre-flight guards (built from tonight's diagnostics)

1. **Catalog footgun:** Ad account 812929881544066 was provisioned as a Commerce/Catalog ads account. Ads Manager will likely default to Advantage+ Catalog Ads or Sales→Catalog optimization. Explicitly override: Sales → Manual setup → Conversion location = Website → optimization event = Lead. Do NOT select any catalog/feed-based campaign type.
2. **Creative source:** Zeus Proclamation Reel lives on Page `1058205557375892` (Godly Zeus AI — canonical ID; public URL form is `61576793849282`, same Page), not in ad account 812929881544066's Media Library. Use "Existing post from Page" not Upload Media.
3. **Pixel readiness:** Confirm Pixel `1236706014984822` appears in the Lead-optimization dropdown BEFORE finishing the campaign builder. If it doesn't appear, the cross-portfolio partner-share didn't complete — stop and re-run Phase 1B.

## Day-1 check (launch day + 8 hours)

1. Ads Manager → confirm campaign status = `Active`, not `In Review`
2. Check Pixel Helper extension on the live ad — confirm `Lead` event registered
3. Supabase query — any new rows with `utm_source=fb_ads`?
   ```sql
   SELECT COUNT(*), persona_result FROM public.leads
   WHERE utm_source='fb_ads' AND utm_campaign='oracle_relaunch_2026_05'
   GROUP BY persona_result;
   ```
4. Stripe — any `checkout.session.created` events from fb_ads UTM in metadata?

## Day-2 check (Thu May 14, ~24 hours after launch)

1. Ads Manager → check spend, impressions, clicks, link clicks
2. Cost per Lead (Meta-reported) — target under $5
3. If CPL > $10 after 100+ impressions: pause and re-evaluate creative
4. If CPL < $3 with at least 1 Lead: double budget to $10/day for remaining window

## Day-7 check (Wed May 20, end of cycle)

Total spend should be ≤ $35.

| Metric | Target | Stretch |
|---|---|---|
| Total Leads | 7 | 15 |
| CPL | < $5 | < $2 |
| Quiz completion rate | > 60% | > 80% |
| Stripe Buy clicks | 2 | 5 |
| Actual purchases | 0 (learning) | 1 |

If Stretch hit: continue at $10/day for week 2.
If Target hit: continue at $5/day for week 2.
If miss both: pause and rebuild creative.

## Pixel verification commands

Browser-side check (from quiz page in your local browser):

```js
// In DevTools Console on the quiz page:
typeof fbq  // should return "function"
fbq.queue   // any pending events?
```

## Supabase monitoring queries

```sql
-- Daily Lead count by source
SELECT
  DATE_TRUNC('day', created_at) AS day,
  utm_source,
  COUNT(*) AS leads,
  COUNT(DISTINCT email) AS unique_emails
FROM public.leads
WHERE created_at > NOW() - INTERVAL '14 days'
GROUP BY day, utm_source
ORDER BY day DESC;

-- Persona split of FB-ads leads
SELECT persona_result, COUNT(*)
FROM public.leads
WHERE utm_source='fb_ads' AND utm_campaign='oracle_relaunch_2026_05'
GROUP BY persona_result;

-- Conversion funnel
SELECT
  COUNT(*) FILTER (WHERE utm_source='fb_ads') AS fb_leads,
  COUNT(*) FILTER (WHERE utm_source='fb_ads' AND status='converted') AS fb_conversions
FROM public.leads;
```

## Stripe seat-cap check (manual weekly)

```
list_subscriptions(price='price_1TWNLoADK1uzxo0bLyjACyzu', status='active', limit=100)
```

Cron `1853ff0d` runs this hourly automatically — alerts at 40 active, pauses at 50.

## Known unknowns to resolve before launch

1. Which ad account holds the April $118.60 spend?
   - Space context says `act=2049364046010873` (likely phantom — does not resolve)
   - Prior session memory referenced `act=1909290965860482` — VERIFIED PHANTOM May 12 2026; does not exist in any of the four Meta Business contexts (Kypria 1986097145242511, Godly Zeus 2061212768049584, Kypria LLC 701331759350000, kostas1_)
   - Actual ad account inventory: only `120238801786230646` ("Kypria BUNDLES Catalog Ads") exists, in Kypria LLC portfolio 701331759350000
   - The $118.60 forensics remains unresolved and is decoupled from Phase 2 campaign launch
   - Resolution: separate forensics pass after Action 2 ships
2. Which Page is the ad served from?
   - Godly Zeus AI Page `1058205557375892` (canonical Business Manager ID; public URL form `61576793849282` resolves to same Page). Portfolio: Godly Zeus by Kypria Technologies (2061212768049584). Matches the brand and the quiz funnel. Do NOT use the other Page `809223708930617` — individually-owned, Partial access only, cleanup target.

## Pause conditions (any one triggers immediate pause)

- Spend exceeds $35 cumulative
- 100+ link clicks with 0 Leads after 48 hours (signals quiz funnel broken)
- Supabase `leads` insert errors detected (check Netlify Function logs equivalent)
- Pixel `Lead` event not firing in Pixel Helper after 24 hours

## Cooldown retry sequence (May 26 2026 onward)

When the Meta new-business cooldown lifts, execute in this exact order. Do NOT skip steps.

### Step 1 — Verify cooldown is lifted (no clicks required)

1. Open https://business.facebook.com/latest/settings/datasets?asset_id=1236706014984822&business_id=1986097145242511
2. Click the Partners tab
3. Hover over "Assign partner" button
4. If tooltip still says "Businesses new to Facebook Products can share this asset..." → still locked, retry in 1 week
5. If tooltip disappears or shows usable assignment options → proceed to Step 2

### Step 2 — Partner-share Pixel from Kypria → Kypria LLC

1. Same page as Step 1 → click "Assign partner"
2. Enter Kypria LLC business ID: `701331759350000`
3. Permission: "Manage Pixel" (highest available)
4. Confirm save; partner row should appear

### Step 3 — Connect Pixel to ad account 812929881544066

1. Switch context: https://business.facebook.com/settings/pixels?business_id=701331759350000
2. Verify Pixel `1236706014984822` appears in the list
3. Click into the Pixel → "Connected assets" → "Add"
4. Select ad account `812929881544066`
5. Save

### Step 4 — Verify in Ads Manager (no campaign creation yet)

1. https://business.facebook.com/adsmanager/manage/campaigns?act=812929881544066
2. Create campaign → Sales → Manual → Website → optimization event dropdown
3. Confirm Pixel `1236706014984822` appears and Lead event is selectable
4. Cancel/discard the draft. Verification only.

### Step 5 — (Optional) Rename ad account

Only after Steps 1-4 succeed. Skip if you want minimal risk during the launch window.

1. https://business.facebook.com/settings/ad-accounts/details?id=812929881544066&business_id=701331759350000
2. Edit account name: `Kypria BUNDLES Catalog Ads` → `Kypria Web Funnel`
3. Save

### Step 6 — Launch Phase 2

Schedule for the first Wednesday 9:00 AM EDT after Step 4 verification succeeds. Build the campaign per Campaign Spec above. Do NOT publish until human review of every panel.

## What changed tonight (May 12 2026, audit trail)

- Quiz email gate wired to Supabase `public.leads` (commit 3c9c7f9)
- Founding Member tier created in Stripe livemode (prod_UVO81vjCKsEdfp, price_1TWNLoADK1uzxo0bLyjACyzu, link buy.stripe.com/4gMbJ0chN2RF0FH0kd1gs0P)
- Seat-cap monitor cron 1853ff0d deployed (alerts at 40 active, critical at 50)
- Three custom skills authored: kypria-deploy, kypria-persona-reply, kypria-stripe-product
- Meta Pixel swap: orphaned App-type dataset 750068155374586 replaced with Web Pixel 1236706014984822 (commit 4bf90cd)
- Phantom ad account IDs purged from memory and skills: 1909290965860482 and 2049364046010873 do not exist
- Real ad account verified: 812929881544066 in Kypria LLC portfolio 701331759350000
- Phase 1B (cross-business partner share) BLOCKED by Meta new-business cooldown; no clicks executed
