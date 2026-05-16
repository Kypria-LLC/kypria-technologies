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
  out.pixel_basic = await gget('/1161892008605801', 'id,name,owner_business,creation_time,last_fired_time,code,enable_automatic_matching,automatic_matching_fields');
  out.pixel_stats_event = await gget('/1161892008605801/stats', 'aggregation,start_time,end_time,event,count');
  // Try different stats slice
  out.pixel_da_check = await gget('/1161892008605801/da_checks', 'key,result,title,description');
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(out, null, 2)
  };
};
