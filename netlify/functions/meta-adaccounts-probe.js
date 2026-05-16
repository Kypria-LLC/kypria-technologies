/**
 * THROWAWAY DIAGNOSTIC FUNCTION
 * Enumerates Meta ad accounts visible to META_SYSTEM_USER_TOKEN and checks
 * which can access the Three Temple catalog (835685825803663).
 *
 * Gate: must pass ?secret=<value> matching env PROBE_SECRET, else 403.
 * Returns: JSON listing ad accounts + capabilities + Three Temple access flag.
 *
 * DELETE THIS FILE after use. Tracked in commit history for forensic audit.
 */

const axios = require('axios');

const TOKEN = process.env.META_SYSTEM_USER_TOKEN;
const PROBE_SECRET = process.env.PROBE_SECRET;
const GRAPH = 'https://graph.facebook.com/v21.0';
const THREE_TEMPLE_CATALOG = '835685825803663';
const TARGET_BUSINESS = '2061212768049584';

exports.handler = async (event) => {
  // Gate
  const passedSecret = event.queryStringParameters?.secret;
  if (!PROBE_SECRET || passedSecret !== PROBE_SECRET) {
    return { statusCode: 403, body: JSON.stringify({ error: 'forbidden' }) };
  }
  if (!TOKEN) {
    return { statusCode: 500, body: JSON.stringify({ error: 'META_SYSTEM_USER_TOKEN not set' }) };
  }

  const out = {
    timestamp: new Date().toISOString(),
    token_tail: TOKEN.slice(-6),
    me: null,
    permissions_debug: null,
    ad_accounts_owned_by_target_business: [],
    ad_accounts_all_accessible: [],
    catalog_access_check: null,
    catalog_assigned_users: null,
    errors: []
  };

  // 1. /me debug to confirm token identity + scopes
  try {
    const meResp = await axios.get(`${GRAPH}/me`, {
      params: { fields: 'id,name', access_token: TOKEN }
    });
    out.me = meResp.data;
  } catch (e) {
    out.errors.push({ step: 'me', err: e.response?.data || e.message });
  }

  // 2. debug_token to read granular_scopes / data_access_expires_at
  try {
    const dtResp = await axios.get(`${GRAPH}/debug_token`, {
      params: { input_token: TOKEN, access_token: TOKEN }
    });
    out.permissions_debug = dtResp.data?.data;
  } catch (e) {
    out.errors.push({ step: 'debug_token', err: e.response?.data || e.message });
  }

  // 3. Enumerate ad accounts on the target business specifically
  try {
    const bizAcctResp = await axios.get(
      `${GRAPH}/${TARGET_BUSINESS}/owned_ad_accounts`,
      {
        params: {
          fields: 'id,account_id,name,account_status,currency,disable_reason,business,timezone_name,funding_source_details',
          limit: 100,
          access_token: TOKEN
        }
      }
    );
    out.ad_accounts_owned_by_target_business = bizAcctResp.data?.data || [];
  } catch (e) {
    out.errors.push({ step: 'owned_ad_accounts', err: e.response?.data || e.message });
  }

  // 3b. Also enumerate client_ad_accounts (accounts the business has access to but doesn't own)
  try {
    const clientAcctResp = await axios.get(
      `${GRAPH}/${TARGET_BUSINESS}/client_ad_accounts`,
      {
        params: {
          fields: 'id,account_id,name,account_status,currency,business',
          limit: 100,
          access_token: TOKEN
        }
      }
    );
    if (clientAcctResp.data?.data?.length) {
      out.ad_accounts_owned_by_target_business.push(
        ...clientAcctResp.data.data.map(a => ({ ...a, _source: 'client' }))
      );
    }
  } catch (e) {
    out.errors.push({ step: 'client_ad_accounts', err: e.response?.data || e.message });
  }

  // 4. Enumerate ALL ad accounts the user can see (fallback view)
  try {
    const allResp = await axios.get(`${GRAPH}/me/adaccounts`, {
      params: {
        fields: 'id,account_id,name,account_status,currency,business',
        limit: 200,
        access_token: TOKEN
      }
    });
    out.ad_accounts_all_accessible = allResp.data?.data || [];
  } catch (e) {
    out.errors.push({ step: 'me_adaccounts', err: e.response?.data || e.message });
  }

  // 5. Resolve Three Temple catalog ownership
  try {
    const catResp = await axios.get(`${GRAPH}/${THREE_TEMPLE_CATALOG}`, {
      params: {
        fields: 'id,name,business,product_count,vertical',
        access_token: TOKEN
      }
    });
    out.catalog_access_check = catResp.data;
  } catch (e) {
    out.errors.push({ step: 'catalog_lookup', err: e.response?.data || e.message });
  }

  // 6. Which ad accounts have the Three Temple catalog assigned?
  try {
    const auResp = await axios.get(
      `${GRAPH}/${THREE_TEMPLE_CATALOG}/assigned_users`,
      {
        params: { business: TARGET_BUSINESS, access_token: TOKEN }
      }
    );
    out.catalog_assigned_users = auResp.data;
  } catch (e) {
    out.errors.push({ step: 'catalog_assigned_users', err: e.response?.data || e.message });
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(out, null, 2)
  };
};
