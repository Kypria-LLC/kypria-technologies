// Probe what custom events pixel 1161892008605801 has received.
const TOKEN = process.env.META_CAPI_ACCESS_TOKEN || process.env.META_SYSTEM_USER_TOKEN;
const API = 'https://graph.facebook.com/v21.0';

async function gget(path, fields) {
  const url = `${API}${path}${fields ? `?fields=${encodeURIComponent(fields)}&` : '?'}access_token=${encodeURIComponent(TOKEN)}`;
  const r = await fetch(url);
  return { http: r.status, body: await r.json() };
}

exports.handler = async (event) => {
  const q = event.queryStringParameters || {};
  if (!q.run || q.run !== '1') {
    return { statusCode: 200, body: JSON.stringify({ status: 'idle' }) };
  }
  const out = { timestamp: new Date().toISOString() };
  out.pixel_basic = await gget('/1161892008605801', 'id,name,owner_business,last_fired_time,code,enable_automatic_matching,automatic_matching_fields,is_unavailable');
  // Pixel custom event types received
  out.pixel_custom_events = await gget('/1161892008605801?fields=stats.aggregation(event)', '');
  // Recent activity via Conversions API logs
  out.pixel_da_check = await gget('/1161892008605801/da_checks', 'key,result,title,description');
  // Aggregated event stats
  out.pixel_stats_v2 = await gget('/1161892008605801/stats', 'event,count,start_time,end_time,aggregation');
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(out, null, 2)
  };
};
