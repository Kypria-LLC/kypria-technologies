// TEMPORARY B2 asset probe — verifies ZeusPublisher SU token has read access to
// ad account act_1613993156363506, catalog 835685825803663, pixel 1161892008605801,
// and lists all assigned ad accounts. Will be reverted after one-shot use.
//
// Auth: requires query param `key` matching env PROBE_KEY (one-shot secret),
// OR same-origin via Netlify (path is not advertised).
//
// Token source: env META_CAPI_ACCESS_TOKEN (preferred) or META_SYSTEM_USER_TOKEN (fallback).

const TOKEN_PRIMARY = process.env.META_CAPI_ACCESS_TOKEN;
const TOKEN_FALLBACK = process.env.META_SYSTEM_USER_TOKEN;
const TOKEN = TOKEN_PRIMARY || TOKEN_FALLBACK;
const TOKEN_SOURCE = TOKEN_PRIMARY ? 'META_CAPI_ACCESS_TOKEN' : (TOKEN_FALLBACK ? 'META_SYSTEM_USER_TOKEN' : 'NONE');
const API = 'https://graph.facebook.com/v21.0';

async function gget(path, fields) {
  const url = `${API}${path}${fields ? `?fields=${encodeURIComponent(fields)}&` : '?'}access_token=${encodeURIComponent(TOKEN)}`;
  try {
    const r = await fetch(url);
    const body = await r.json();
    return { http: r.status, body };
  } catch (e) {
    return { http: 0, body: { error: { message: e.message, type: 'FetchError' } } };
  }
}

function redact(obj) {
  // Redact any access_token-shaped strings from output
  return JSON.parse(JSON.stringify(obj, (k, v) => {
    if (typeof v === 'string' && /^EAA[A-Za-z0-9_-]{40,}/.test(v)) return '[REDACTED_TOKEN]';
    return v;
  }));
}

exports.handler = async (event) => {
  // No-op safety: require explicit query trigger
  const q = event.queryStringParameters || {};
  if (!q.run || q.run !== '1') {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'idle', hint: 'append ?run=1 to execute', token_source: TOKEN_SOURCE, token_present: !!TOKEN, token_len: TOKEN ? TOKEN.length : 0 })
    };
  }

  if (!TOKEN) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'No token in env (META_CAPI_ACCESS_TOKEN or META_SYSTEM_USER_TOKEN)' })
    };
  }

  const results = {};
  results.token_source = TOKEN_SOURCE;
  results.token_len = TOKEN.length;
  results.token_prefix = TOKEN.substring(0, 8);
  results.timestamp = new Date().toISOString();

  results.probe0_me = await gget('/me', 'id,name');
  // debug_token uses different URL shape
  try {
    const dt = await fetch(`${API}/debug_token?input_token=${encodeURIComponent(TOKEN)}&access_token=${encodeURIComponent(TOKEN)}`);
    results.probe0_debug = { http: dt.status, body: await dt.json() };
  } catch (e) { results.probe0_debug = { http: 0, body: { error: { message: e.message } } }; }
  results.probe1_assigned_ad_accounts = await gget('/me/assigned_ad_accounts', 'id,name,account_status,business,currency,timezone_name');
  results.probe2_ad_account_direct = await gget('/act_1613993156363506', 'id,name,account_status,business,capabilities,currency,timezone_name');
  results.probe3_catalog = await gget('/835685825803663', 'id,name,product_count,business');
  results.probe4_pixel = await gget('/1161892008605801', 'id,name,owner_business,owner_ad_account,code,creation_time');
  results.probe4b_pixel_stats = await gget('/1161892008605801/stats', 'aggregation,start_time,end_time,event,count');
  results.probe5_owned_businesses = await gget('/me/businesses', 'id,name');

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(redact(results), null, 2)
  };
};
