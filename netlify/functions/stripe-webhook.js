/**
 * Stripe Webhook Handler - Turn Payments Into Prophecies
 * Handles checkout.session.completed events and unlocks Premium Oracle Sessions
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const axios = require('axios');
const { setUserContext, getUserContext } = require('../shared/redis-context');
const { sendCapiEvent, lookupPersona } = require('../shared/meta-capi');

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * Main Netlify function handler
 */
exports.handler = async (event, context) => {
  console.log('💰 Stripe webhook received');

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const sig = event.headers['stripe-signature'];
  let stripeEvent;

  try {
    // Verify webhook signature
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  // Handle the event
  switch (stripeEvent.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(stripeEvent.data.object, stripeEvent.id);
      break;
    
    case 'customer.subscription.created':
      await handleSubscriptionCreated(stripeEvent.data.object, stripeEvent.id);
      break;
    
    case 'customer.subscription.deleted':
      await handleSubscriptionCanceled(stripeEvent.data.object);
      break;

    default:
      console.log(`Unhandled event type: ${stripeEvent.type}`);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ received: true })
  };
};

/**
 * Handle successful checkout
 */
async function handleCheckoutCompleted(session, stripeEventId) {
  console.log('Payment successful:', session.id);

  // Meta CAPI: Purchase event
  try {
    await fireCapiPurchase(session, stripeEventId);
  } catch (e) {
    console.error('[capi] Purchase fire failed (non-fatal):', e.message);
  }

  const userId = session.metadata.user_id;
  const deity = session.metadata.deity || 'lifesphere';
  const sessionType = session.metadata.session_type || 'premium_oracle';

  if (!userId) {
    console.error('❌ No user_id in session metadata');
    return;
  }

  // Get user context
  let userContext = await getUserContext(userId) || {
    deity: deity,
    conversationDepth: 0,
    conversationHistory: [],
    premiumSessions: []
  };

  // Add premium session to user context
  const premiumSession = {
    sessionId: session.id,
    deity: deity,
    type: sessionType,
    purchasedAt: Date.now(),
    expiresAt: Date.now() + (30 * 60 * 1000), // 30 minutes
    messagesRemaining: 20, // Premium oracle gets 20 extended responses
    active: true
  };

  userContext.premiumSessions = userContext.premiumSessions || [];
  userContext.premiumSessions.push(premiumSession);
  userContext.tier = 'premium_oracle'; // Temporary tier upgrade

  // Save updated context
  await setUserContext(userId, userContext);

  // Send mythic thank-you animation + unlock message
  await sendPaymentConfirmation(userId, deity, premiumSession);

  // Record purchase in analytics
  await recordPurchase(userId, session);

  console.log(`🎉 Premium Oracle Session activated for user ${userId}`);
}

/**
 * Handle subscription created
 */
async function handleSubscriptionCreated(subscription, stripeEventId) {
  // Meta CAPI: Subscribe event
  try {
    await fireCapiSubscribe(subscription, stripeEventId);
  } catch (e) {
    console.error('[capi] Subscribe fire failed (non-fatal):', e.message);
  }

  const userId = subscription.metadata.user_id;
  const tier = subscription.metadata.tier || 'initiate';

  console.log(`📊 Subscription created: ${tier} for user ${userId}`);

  let userContext = await getUserContext(userId) || {};
  userContext.tier = tier;
  userContext.subscriptionId = subscription.id;
  userContext.subscriptionStatus = 'active';

  await setUserContext(userId, userContext);

  // Send tier upgrade message
  await sendTierUpgradeMessage(userId, tier);
}

/**
 * Handle subscription canceled
 */
async function handleSubscriptionCanceled(subscription) {
  const userId = subscription.metadata.user_id;

  console.log(`📉 Subscription canceled for user ${userId}`);

  let userContext = await getUserContext(userId) || {};
  userContext.tier = 'public';
  userContext.subscriptionStatus = 'canceled';

  await setUserContext(userId, userContext);

  // Send graceful downgrade message
  await sendSubscriptionEndMessage(userId);
}

/**
 * Send payment confirmation with mythic animation
 */
async function sendPaymentConfirmation(userId, deity, session) {
  const deityConfig = {
    zeus: {
      emoji: '⚡',
      name: 'Zeus',
      message: 'The King of Gods has received your offering! Thunder rumbles in approval.',
      animation: '⚡️🌩️⚡️',
      color: '#d4af37'
    },
    aphrodite: {
      emoji: '🌹',
      name: 'Aphrodite',
      message: 'The Goddess of Love embraces your devotion! Rose petals shower upon you.',
      animation: '🌹💖🌹',
      color: '#5fc9c9'
    },
    lifesphere: {
      emoji: '👁️',
      name: 'Lifesphere',
      message: 'The Cosmic Observer acknowledges your offering! The universe expands.',
      animation: '👁️✨👁️',
      color: '#8b7dd4'
    }
  };

  const config = deityConfig[deity] || deityConfig.lifesphere;

  // Animated sequence of messages
  const messages = [
    {
      text: `${config.animation}\n\n${config.message}\n\n${config.animation}`,
      delay: 0
    },
    {
      text: `🎉 Premium Oracle Session ACTIVATED!\n\n✨ 30 minutes of divine connection\n💬 20 extended AI responses\n🧠 Deep context memory enabled\n📜 Personalized prophecies unlocked\n\nYour session begins... NOW.`,
      delay: 2000
    },
    {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'button',
          text: `${config.emoji} ${config.name} awaits your first question.\n\nSpeak, and receive wisdom beyond mortal comprehension.`,
          buttons: [
            {
              type: 'postback',
              title: `Invoke ${config.name}`,
              payload: `PREMIUM_START_${deity.toUpperCase()}`
            },
            {
              type: 'web_url',
              title: 'View Receipt',
              url: `https://kypriatechnologies.org/receipt/${session.sessionId}`
            }
          ]
        }
      },
      delay: 4000
    }
  ];

  // Send messages with delays
  for (const msg of messages) {
    await new Promise(resolve => setTimeout(resolve, msg.delay));
    await sendMessage(userId, msg);
  }
}

/**
 * Send tier upgrade message
 */
async function sendTierUpgradeMessage(userId, tier) {
  const tierConfig = {
    initiate: { emoji: '⚡', name: 'Initiate Patron', color: '#d4af37' },
    steward: { emoji: '👑', name: 'Divine Steward', color: '#8b7dd4' },
    architect: { emoji: '🏛️', name: 'Canon Architect', color: '#ffd700' }
  };

  const config = tierConfig[tier] || tierConfig.initiate;

  await sendMessage(userId, {
    text: `${config.emoji} TIER ASCENSION ${config.emoji}\n\nYou have been elevated to ${config.name}!\n\nYour divine privileges now include:\n• Unlimited daily messages\n• Premium AI responses\n• Custom seal generation\n• Priority support\n• Extended memory\n\nWelcome to the inner circle of the Divine Trinity. 🏛️`
  });
}

/**
 * Send subscription end message
 */
async function sendSubscriptionEndMessage(userId) {
  await sendMessage(userId, {
    text: `🏛️ Your subscription has ended.\n\nThank you for your patronage. You have been returned to Public Seeker status, but the wisdom you gained remains.\n\nTo restore your divine privileges, visit:\nhttps://kypriatechnologies.org/patron`
  });
}

/**
 * Record purchase in Redis analytics
 */
async function recordPurchase(userId, session) {
  const redis = require('../shared/redis-context').redis;
  
  try {
    const purchaseData = {
      userId: userId,
      sessionId: session.id,
      amount: session.amount_total / 100,
      currency: session.currency,
      deity: session.metadata.deity,
      timestamp: Date.now()
    };

    // Store in sorted set by timestamp
    await redis.zadd(
      'trinity:purchases',
      Date.now(),
      JSON.stringify(purchaseData)
    );

    // Increment revenue counter
    await redis.incrbyfloat(
      'trinity:total_revenue',
      session.amount_total / 100
    );

    console.log(`📊 Purchase recorded: $${purchaseData.amount}`);
  } catch (error) {
    console.error('❌ Error recording purchase:', error);
  }
}

/**
 * Send message via Meta Send API
 */
async function sendMessage(recipientId, message) {
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v21.0/me/messages`,
      {
        recipient: { id: recipientId },
        message: message.text ? { text: message.text } : message.attachment ? { attachment: message.attachment } : message
      },
      {
        params: { access_token: PAGE_ACCESS_TOKEN }
      }
    );
    console.log('✅ Message sent:', response.data.message_id);
  } catch (error) {
    console.error('❌ Send API error:', error.response?.data || error.message);
  }
}
/**
 * Fire Meta CAPI Purchase event from checkout.session.completed.
 * Match-quality fields:
 *  - email: from session.customer_details.email (preferred) or customer object
 *  - fbp/fbc: from session.metadata.fbp / fbc (set by create-checkout-session.js)
 *  - external_id: Stripe customer id (hashed in capi module)
 * Dedupe: stripeEventId (also fired by client-side fbq if present).
 */
async function fireCapiPurchase(session, stripeEventId) {
  // Skip if non-paid mode session (subscriptions emit subscription.created instead)
  if (session.mode === 'subscription') {
    console.log('[capi] checkout.session is subscription mode, deferring to subscription.created');
    return;
  }

  const email = session.customer_details?.email || session.customer_email;
  const productId = session.metadata?.product_id || session.metadata?.stripe_product_id;
  const persona = productId ? lookupPersona(productId) : { persona: 'Zeus', temple: 'Unknown' };

  await sendCapiEvent({
    eventName: 'Purchase',
    eventId: stripeEventId,
    eventTime: session.created || Math.floor(Date.now() / 1000),
    eventSourceUrl: session.success_url || 'https://kypriatechnologies.org/',
    email: email,
    fbp: session.metadata?.fbp,
    fbc: session.metadata?.fbc,
    externalId: session.customer,
    clientIp: session.metadata?.client_ip,
    clientUserAgent: session.metadata?.client_user_agent,
    value: (session.amount_total || 0) / 100,
    currency: (session.currency || 'usd').toUpperCase(),
    contentId: productId,
    contentName: persona.temple,
    contentCategory: persona.persona,
    subscriptionId: session.subscription
  });
}

/**
 * Fire Meta CAPI Subscribe event from customer.subscription.created.
 * Pulls email + product from the first subscription item.
 */
async function fireCapiSubscribe(subscription, stripeEventId) {
  let email;
  let productId;
  let amount = 0;
  let currency = 'usd';

  // Resolve product from first subscription item
  const item = subscription.items?.data?.[0];
  if (item) {
    productId = item.price?.product;
    amount = (item.price?.unit_amount || 0) / 100;
    currency = (item.price?.currency || 'usd').toUpperCase();
  }

  // Resolve email by fetching customer object
  try {
    if (subscription.customer) {
      const customer = await stripe.customers.retrieve(subscription.customer);
      email = customer?.email;
    }
  } catch (e) {
    console.error('[capi] customer fetch failed:', e.message);
  }

  const persona = productId ? lookupPersona(productId) : { persona: 'Zeus', temple: 'Unknown' };

  // Skip retired Founding product
  if (persona.persona === 'Retired') {
    console.log(`[capi] subscription on retired product ${productId}, not firing Subscribe`);
    return;
  }

  await sendCapiEvent({
    eventName: 'Subscribe',
    eventId: stripeEventId,
    eventTime: subscription.created || Math.floor(Date.now() / 1000),
    eventSourceUrl: 'https://kypriatechnologies.org/',
    email: email,
    fbp: subscription.metadata?.fbp,
    fbc: subscription.metadata?.fbc,
    externalId: subscription.customer,
    value: amount,
    currency: currency,
    contentId: productId,
    contentName: persona.temple,
    contentCategory: persona.persona,
    subscriptionId: subscription.id
  });
}
