/**
 * Meta Conversions API bridge
 * Sends server-side events to the Zeus Pixel (1161892008605801) from Stripe webhook events.
 *
 * Required env vars:
 *   META_CAPI_ACCESS_TOKEN   System User token with ads_management scope
 *   META_PIXEL_ID            Default 1161892008605801 (Zeus)
 *   META_CAPI_TEST_EVENT_CODE  Optional, for Test Events tab verification
 *
 * Event match quality maximization: hash email + send fbp/fbc when available
 * via Stripe customer metadata fields fbp / fbc (set on create-checkout-session).
 *
 * Docs: https://developers.facebook.com/docs/marketing-api/conversions-api/
 */

const axios = require('axios');
const crypto = require('crypto');

const PIXEL_ID = process.env.META_PIXEL_ID || '1161892008605801';
// Prefer dedicated CAPI token; fall back to the existing System User token used by zeus-feed.
// Both need ads_management scope on the Zeus pixel's ad account.
const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN || process.env.META_SYSTEM_USER_TOKEN;
const TEST_EVENT_CODE = process.env.META_CAPI_TEST_EVENT_CODE || null;
const GRAPH_VERSION = 'v21.0';

function sha256(value) {
  if (!value) return undefined;
  return crypto
    .createHash('sha256')
    .update(String(value).trim().toLowerCase())
    .digest('hex');
}

/**
 * Send a single CAPI event.
 * @param {Object} params
 * @param {string} params.eventName        Subscribe | Purchase | StartTrial | CompleteRegistration
 * @param {number} [params.eventTime]      Unix seconds; defaults to now
 * @param {string} [params.eventId]        Dedupe key (Stripe event id strongly recommended)
 * @param {string} [params.eventSourceUrl] URL of the page that initiated the conversion
 * @param {string} [params.email]          Plaintext, will be hashed
 * @param {string} [params.fbp]            Browser pixel cookie value (_fbp)
 * @param {string} [params.fbc]            Click ID cookie value (_fbc)
 * @param {string} [params.clientIp]       Optional, last-known client IP
 * @param {string} [params.clientUserAgent]
 * @param {number} [params.value]          Purchase amount in major units
 * @param {string} [params.currency]       ISO currency code
 * @param {string} [params.contentId]      Stripe product id
 * @param {string} [params.contentName]    Persona / Temple name
 * @param {string} [params.contentCategory]
 * @param {string} [params.subscriptionId] Stripe subscription id
 */
async function sendCapiEvent(params) {
  if (!ACCESS_TOKEN) {
    console.error('[capi] META_CAPI_ACCESS_TOKEN not set, skipping');
    return { ok: false, reason: 'missing_token' };
  }

  const userData = {};
  if (params.email) userData.em = [sha256(params.email)];
  if (params.fbp) userData.fbp = params.fbp;
  if (params.fbc) userData.fbc = params.fbc;
  if (params.clientIp) userData.client_ip_address = params.clientIp;
  if (params.clientUserAgent) userData.client_user_agent = params.clientUserAgent;
  if (params.externalId) userData.external_id = [sha256(params.externalId)];

  const customData = {};
  if (params.value !== undefined) customData.value = params.value;
  if (params.currency) customData.currency = params.currency;
  if (params.contentId) {
    customData.content_ids = [params.contentId];
    customData.content_type = 'product';
  }
  if (params.contentName) customData.content_name = params.contentName;
  if (params.contentCategory) customData.content_category = params.contentCategory;
  if (params.subscriptionId) customData.subscription_id = params.subscriptionId;

  const eventPayload = {
    event_name: params.eventName,
    event_time: params.eventTime || Math.floor(Date.now() / 1000),
    action_source: 'website',
    user_data: userData,
    custom_data: customData
  };
  if (params.eventId) eventPayload.event_id = params.eventId;
  if (params.eventSourceUrl) eventPayload.event_source_url = params.eventSourceUrl;

  const body = { data: [eventPayload] };
  if (TEST_EVENT_CODE) body.test_event_code = TEST_EVENT_CODE;

  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${PIXEL_ID}/events`;

  try {
    const resp = await axios.post(url, body, {
      params: { access_token: ACCESS_TOKEN },
      timeout: 10000
    });
    console.log(
      `[capi] sent ${params.eventName} pixel=${PIXEL_ID} event_id=${params.eventId || 'none'} received=${resp.data.events_received} fbtrace_id=${resp.data.fbtrace_id}`
    );
    return { ok: true, response: resp.data };
  } catch (err) {
    const e = err.response?.data || err.message;
    console.error(`[capi] error ${params.eventName}:`, JSON.stringify(e));
    return { ok: false, reason: 'request_failed', error: e };
  }
}

/**
 * Map Stripe product id to persona / temple labels.
 * Source: kypria-stripe-product skill (Three-Temple authoritative).
 */
const PRODUCT_TO_PERSONA = {
  prod_TVGm7qxwJwd2eU: { persona: 'Zeus', temple: 'Zeus Temple' },
  prod_TVGvaVGH5D6422: { persona: 'Aphrodite', temple: 'Aphrodite Temple' },
  prod_TVH0jrAakN4K9E: { persona: 'Lifesphere', temple: 'Lifesphere Temple' },
  prod_ULLD9uSHwzaznx: { persona: 'Aphrodite', temple: 'Aphrodite Mirror (legacy)' },
  prod_TjrqhMKSxlZ8hH: { persona: 'Lifesphere', temple: 'Dream Decoder (legacy)' },
  prod_UVO81vjCKsEdfp: { persona: 'Retired', temple: 'Founding (retired)' }
};

function lookupPersona(productId) {
  return PRODUCT_TO_PERSONA[productId] || { persona: 'Zeus', temple: 'Unknown' };
}

module.exports = {
  sendCapiEvent,
  lookupPersona,
  sha256,
  PIXEL_ID
};
