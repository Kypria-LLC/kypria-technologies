// TEMPORARY B2 campaign builder — creates Three Temple Catalog Sales campaign
// on act_1613993156363506. Idle by default; requires ?run=1 to execute.
// Returns campaign/adset/ad IDs and any errors. Will be reverted after one-shot use.
//
// Assets (verified live May 16 2026):
//   ad_account: act_1613993156363506 (Godly Zeus Ads, USD, NY)
//   page: 1058205557375892 (Godly Zeus AI)
//   pixel: 1161892008605801 (Zeus)
//   catalog: 835685825803663 (Three Temple, 6 products)
//   product_set: 1298038635198750 (All Products)
//   ig_user: godlyzeus.ai (Full control via ZeusPublisher)
//
// Defaults (locked from prior session):
//   objective: OUTCOME_SALES (manual, not ASC)
//   conversion: Subscribe
//   budget: $20/day
//   attribution: 7d_click + 1d_view
//   geo: US, age 18-65+
//   advantage_audience: ON
//   advantage_placements: ON (auto)
//   format: dynamic catalog (DPA-style multi-product)
//   STATUS at creation: PAUSED (user reviews + flips to ACTIVE manually)

const TOKEN = process.env.META_CAPI_ACCESS_TOKEN || process.env.META_SYSTEM_USER_TOKEN;
const API = 'https://graph.facebook.com/v21.0';
const AD_ACCOUNT = 'act_1613993156363506';
const PAGE_ID = '1058205557375892';
const PIXEL_ID = '1161892008605801';
const CATALOG_ID = '835685825803663';
const PRODUCT_SET_ID = '1298038635198750';
const IG_USER_ID = null; // resolve at runtime or leave null (page-attached IG)

async function gget(path, fields) {
  const url = `${API}${path}${fields ? `?fields=${encodeURIComponent(fields)}&` : '?'}access_token=${encodeURIComponent(TOKEN)}`;
  const r = await fetch(url);
  return { http: r.status, body: await r.json() };
}

async function gpost(path, params) {
  const body = new URLSearchParams({ ...params, access_token: TOKEN });
  const r = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString()
  });
  return { http: r.status, body: await r.json() };
}

function redact(o) {
  return JSON.parse(JSON.stringify(o, (k, v) => {
    if (typeof v === 'string' && /^EAA[A-Za-z0-9_-]{40,}/.test(v)) return '[REDACTED_TOKEN]';
    return v;
  }));
}

exports.handler = async (event) => {
  const q = event.queryStringParameters || {};
  if (!q.run || q.run !== '1') {
    return {
      statusCode: 200,
      body: JSON.stringify({ status: 'idle', hint: 'append ?run=1 to execute. ?dry=1 for preflight only.' })
    };
  }
  if (!TOKEN) {
    return { statusCode: 500, body: JSON.stringify({ error: 'No token in env' }) };
  }

  const out = { timestamp: new Date().toISOString(), steps: {} };

  // Step 1: Preflight — check ad account funding + page
  out.steps.preflight_ad_account = await gget(`/${AD_ACCOUNT}`,
    'id,name,account_status,disable_reason,funding_source,funding_source_details,balance,amount_spent,currency,timezone_name,min_daily_budget');
  out.steps.preflight_page = await gget(`/${PAGE_ID}`, 'id,name,is_published,verification_status');

  // Check funding
  const acct = out.steps.preflight_ad_account.body || {};
  const hasFunding = !!acct.funding_source;
  out.preflight_summary = {
    has_funding_source: hasFunding,
    account_active: acct.account_status === 1,
    disable_reason: acct.disable_reason
  };

  if (q.dry === '1') {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(redact(out), null, 2)
    };
  }

  // Step 2: Create Campaign (PAUSED)
  const campaignName = 'Three Temple Catalog · Subscribe · v1 (May 16 2026)';
  out.steps.create_campaign = await gpost(`/${AD_ACCOUNT}/campaigns`, {
    name: campaignName,
    objective: 'OUTCOME_SALES',
    status: 'PAUSED',
    special_ad_categories: '[]',
    buying_type: 'AUCTION',
    is_adset_budget_sharing_enabled: 'false', // ad-set-level budgets, no CBO sharing
    // Manual mode (NOT Advantage+ Shopping Campaign / ASC):
    // omit smart_promotion_type.
  });

  const campaignId = out.steps.create_campaign.body?.id;
  if (!campaignId) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(redact({ ...out, fatal: 'Campaign creation failed; halting before AdSet.' }), null, 2)
    };
  }

  // Step 3: Create Ad Set (PAUSED)
  // Catalog DPA with website conversion optimization:
  //   promoted_object: { pixel_id, custom_event_type=SUBSCRIBE, product_set_id }
  //   optimization_goal: OFFSITE_CONVERSIONS
  //   billing_event: IMPRESSIONS
  //   destination_type: WEBSITE
  //   targeting: US, 18-65+, advantage audience flag, automatic placements
  //   attribution_spec: 7d_click + 1d_view
  const targeting = {
    geo_locations: { countries: ['US'] },
    age_min: 18,
    age_max: 65,
    targeting_automation: { advantage_audience: 1 },
    publisher_platforms: ['facebook', 'instagram', 'audience_network', 'messenger'],
    facebook_positions: ['feed','right_hand_column','marketplace','video_feeds','story','search','instream_video','facebook_reels','facebook_reels_overlay'],
    instagram_positions: ['stream','story','explore','reels','profile_feed','search','ig_search'],
    messenger_positions: ['messenger_home','sponsored_messages','story'],
    audience_network_positions: ['classic','rewarded_video']
  };
  const promotedObject = {
    pixel_id: PIXEL_ID,
    custom_event_type: 'SUBSCRIBE',
    product_set_id: PRODUCT_SET_ID
  };
  const attributionSpec = [
    { event_type: 'CLICK_THROUGH', window_days: 7 },
    { event_type: 'VIEW_THROUGH', window_days: 1 }
  ];
  out.steps.create_adset = await gpost(`/${AD_ACCOUNT}/adsets`, {
    name: 'Three Temple · US · Adv+ Audience · v1',
    campaign_id: campaignId,
    status: 'PAUSED',
    daily_budget: '2000', // cents = $20/day
    billing_event: 'IMPRESSIONS',
    optimization_goal: 'OFFSITE_CONVERSIONS',
    bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
    destination_type: 'WEBSITE',
    promoted_object: JSON.stringify(promotedObject),
    targeting: JSON.stringify(targeting),
    attribution_spec: JSON.stringify(attributionSpec),
    start_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1h from now
    is_dynamic_creative: 'false'
  });

  const adsetId = out.steps.create_adset.body?.id;
  if (!adsetId) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(redact({ ...out, fatal: 'AdSet creation failed; campaign created but no AdSet.', cleanup_hint: `DELETE /${campaignId} to undo` }), null, 2)
    };
  }

  // Step 4: Create Ad Creative (catalog DPA template)
  // For catalog DPA with web destination, we need a template creative referencing product set + page.
  const creativeBody = {
    name: 'Three Temple Catalog Creative v1',
    object_story_spec: JSON.stringify({
      page_id: PAGE_ID,
      template_data: {
        message: 'Three temples. One mirror. Find yours.',
        link: 'https://kypriatechnologies.org/?utm_source=meta&utm_medium=cpc&utm_campaign=three_temple_catalog_v1&utm_content={{product.id}}',
        name: 'Which oracle forged you?',
        description: '{{product.description}}',
        call_to_action: { type: 'SUBSCRIBE' },
        multi_share_optimized: true,
        multi_share_end_card: true
      }
    }),
    product_set_id: PRODUCT_SET_ID
  };
  out.steps.create_creative = await gpost(`/${AD_ACCOUNT}/adcreatives`, creativeBody);

  const creativeId = out.steps.create_creative.body?.id;
  if (!creativeId) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(redact({ ...out,
        partial_success: { campaign_id: campaignId, adset_id: adsetId, creative_failed: true } ,
        cleanup_hint: `DELETE /${adsetId} and /${campaignId} to undo, OR keep and add creative manually in UI`
      }), null, 2)
    };
  }

  // Step 5: Create Ad
  out.steps.create_ad = await gpost(`/${AD_ACCOUNT}/ads`, {
    name: 'Three Temple Catalog Ad v1',
    adset_id: adsetId,
    creative: JSON.stringify({ creative_id: creativeId }),
    status: 'PAUSED'
  });

  const adId = out.steps.create_ad.body?.id;

  out.summary = {
    campaign_id: campaignId,
    adset_id: adsetId,
    creative_id: creativeId,
    ad_id: adId,
    status_all: 'PAUSED',
    next_step: 'Review in Ads Manager UI, add payment method if missing, flip ad to ACTIVE'
  };

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(redact(out), null, 2)
  };
};
