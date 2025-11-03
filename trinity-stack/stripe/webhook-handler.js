/**
 * Stripe Webhook Handler
 * Processes payment events from Stripe
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function handleWebhook(event) {
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutComplete(event.data.object);
      break;
    case 'customer.subscription.created':
      await handleSubscriptionCreated(event.data.object);
      break;
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object);
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
}

async function handleCheckoutComplete(session) {
  // TODO: Grant access to premium features
  console.log('Checkout completed:', session.id);
}

async function handleSubscriptionCreated(subscription) {
  // TODO: Set up recurring access
  console.log('Subscription created:', subscription.id);
}

async function handleSubscriptionUpdated(subscription) {
  // TODO: Update user access level
  console.log('Subscription updated:', subscription.id);
}

module.exports = { handleWebhook };
