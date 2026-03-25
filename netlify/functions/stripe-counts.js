/**
 * stripe-counts.js — Social Proof: Active subscriber counts per temple tier
 * 
 * Endpoint: /api/stripe-counts
 * Env vars required:
 *   STRIPE_SECRET_KEY       — sk_live_... from Stripe Dashboard
 *   STRIPE_PRICE_ZEUS       — price_... for $49/mo tier
 *   STRIPE_PRICE_APHRODITE  — price_... for $79/mo tier
 *   STRIPE_PRICE_LIFESPHERE — price_... for $149/mo tier
 * 
 * Counts by price ID first (robust against price changes), falls back to
 * unit_amount in cents if price IDs aren't set in env vars.
 * 
 * Uses the `stripe` npm package already in package.json (v14.10.0).
 * Netlify Functions V1 (CommonJS) to match existing codebase.
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'public, max-age=600, s-maxage=600' // 10-min CDN cache
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: false, error: 'Stripe not configured' })
    };
  }

  // Price ID env vars (preferred) — maps tier name to Stripe price ID
  const priceMap = {};
  if (process.env.STRIPE_PRICE_ZEUS) priceMap[process.env.STRIPE_PRICE_ZEUS] = 'zeus';
  if (process.env.STRIPE_PRICE_APHRODITE) priceMap[process.env.STRIPE_PRICE_APHRODITE] = 'aphrodite';
  if (process.env.STRIPE_PRICE_LIFESPHERE) priceMap[process.env.STRIPE_PRICE_LIFESPHERE] = 'lifesphere';
  const usePriceIds = Object.keys(priceMap).length === 3;

  // Cents fallback (if price IDs not set)
  const centsMap = { 4900: 'zeus', 7900: 'aphrodite', 14900: 'lifesphere' };

  try {
    const counts = { zeus: 0, aphrodite: 0, lifesphere: 0, total: 0 };
    let hasMore = true;
    let startingAfter = undefined;

    // Paginate through all active subscriptions
    while (hasMore) {
      const params = { status: 'active', limit: 100 };
      if (startingAfter) params.starting_after = startingAfter;

      const subs = await stripe.subscriptions.list(params);

      for (const sub of subs.data) {
        const item = sub.items && sub.items.data && sub.items.data[0];
        if (!item || !item.price) continue;

        let tier = null;
        if (usePriceIds) {
          tier = priceMap[item.price.id] || null;
        }
        if (!tier) {
          tier = centsMap[item.price.unit_amount] || null;
        }

        if (tier) {
          counts[tier]++;
        }
        counts.total++;
      }

      hasMore = subs.has_more;
      if (hasMore && subs.data.length) {
        startingAfter = subs.data[subs.data.length - 1].id;
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ok: true,
        counts,
        cached_at: new Date().toISOString()
      })
    };
  } catch (err) {
    console.error('stripe-counts error:', err.message);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: false, error: 'Stripe fetch failed' })
    };
  }
};
