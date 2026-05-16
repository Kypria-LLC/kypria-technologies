// TEMPORARY one-shot probe — fetch page ownership info via system user token.
// Will be reverted.

const TOKEN = process.env.META_SYSTEM_USER_TOKEN || process.env.META_CAPI_ACCESS_TOKEN;
const API = 'https://graph.facebook.com/v21.0';

exports.handler = async (event) => {
  const params = event.queryStringParameters || {};
  const page = params.page;
  if (!page) {
    return { statusCode: 400, body: JSON.stringify({ error: 'missing ?page=' }) };
  }
  if (!TOKEN) {
    return { statusCode: 500, body: JSON.stringify({ error: 'missing token env' }) };
  }
  const fields = 'id,name,owner_business,business,access_token,verification_status,category,parent_page';
  const url = `${API}/${page}?fields=${encodeURIComponent(fields)}&access_token=${encodeURIComponent(TOKEN)}`;
  const r = await fetch(url);
  const body = await r.json();
  return { statusCode: 200, body: JSON.stringify({ http: r.status, body }, null, 2) };
};
