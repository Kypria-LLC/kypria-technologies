// TEMPORARY one-shot cleanup — deletes orphan AdSet + Creative from B2 build iterations.
// Idle by default; requires ?run=1.
// Will be reverted with all other _b2-* and _probe functions after use.

const TOKEN = process.env.META_CAPI_ACCESS_TOKEN || process.env.META_SYSTEM_USER_TOKEN;
const API = 'https://graph.facebook.com/v21.0';

const ORPHANS = [
  { type: 'adset', id: '120252166436340746' },
  { type: 'creative', id: '819393404253165' },
];

async function gdelete(id) {
  const url = `${API}/${id}?access_token=${encodeURIComponent(TOKEN)}`;
  const r = await fetch(url, { method: 'DELETE' });
  let body;
  try { body = await r.json(); } catch (e) { body = { parse_error: String(e) }; }
  return { http: r.status, body };
}

exports.handler = async (event) => {
  const params = event.queryStringParameters || {};
  if (params.run !== '1') {
    return {
      statusCode: 200,
      body: JSON.stringify({ idle: true, targets: ORPHANS, hint: 'append ?run=1 to execute' }),
    };
  }
  if (!TOKEN) {
    return { statusCode: 500, body: JSON.stringify({ error: 'missing META token env' }) };
  }
  const results = {};
  for (const o of ORPHANS) {
    results[`${o.type}_${o.id}`] = await gdelete(o.id);
  }
  return {
    statusCode: 200,
    body: JSON.stringify({ timestamp: new Date().toISOString(), results }, null, 2),
  };
};
