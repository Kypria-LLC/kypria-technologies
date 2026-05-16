// Probe what custom events pixel 1024027273624000 has received.
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
  // Probe the REAL web pixel: 1024027273624000 (from fbq init in HTML)
  out.real_pixel_basic = await gget('/1024027273624000', 'id,name,owner_business,is_unavailable,code');
  out.real_pixel_da_check = await gget('/1024027273624000/da_checks', 'key,result,title,description');
  // Compare: 1024027273624000 is registered as App
  out.zeus_app_basic = await gget('/1024027273624000', 'id,name,owner_business');
  out.zeus_app_da_check = await gget('/1024027273624000/da_checks', 'key,result,title');
  // Catalog binding
  out.catalog_pixel = await gget('/835685825803663', 'id,name,product_count,business,event_stats');
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(out, null, 2)
  };
};
