// TEMPORARY one-shot probe — fetch page ownership info via system user token.
// Will be reverted.

const TOKEN = process.env.META_SYSTEM_USER_TOKEN || process.env.META_CAPI_ACCESS_TOKEN;
const API = 'https://graph.facebook.com/v21.0';

async function gget(path, fields) {
  const url = `${API}${path}?${fields ? `fields=${encodeURIComponent(fields)}&` : ''}access_token=${encodeURIComponent(TOKEN)}`;
  const r = await fetch(url);
  return { http: r.status, body: await r.json() };
}

exports.handler = async (event) => {
  const params = event.queryStringParameters || {};
  if (!TOKEN) return { statusCode: 500, body: JSON.stringify({ error: 'missing token env' }) };

  const out = {};

  // 1. system user's businesses
  out.me_businesses = await gget('/me/businesses', 'id,name,verification_status,primary_page');

  // 2. specific page probe if ?page= provided
  if (params.page) {
    out.page = await gget(`/${params.page}`, 'id,name,access_token,verification_status,category');
  }

  // 3. probe owned pages of portfolio 2061212768049584
  out.owned_pages = await gget('/2061212768049584/owned_pages', 'id,name');

  // 4. probe client pages of portfolio 2061212768049584
  out.client_pages = await gget('/2061212768049584/client_pages', 'id,name');

  return { statusCode: 200, body: JSON.stringify(out, null, 2) };
};
