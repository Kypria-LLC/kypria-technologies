/**
 * Payment Flow Test Script
 * Run locally to verify Stripe integration before production
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function testPaymentFlow() {
  console.log('💸 Testing Divine Trinity Payment Flow\n');

  // Test 1: Create checkout session
  console.log('Test 1: Creating checkout session...');
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: 500, // $5.00
            product_data: {
              name: '⚡ Premium Oracle Session',
              description: '30 minutes of divine connection',
              images: ['https://kypriatechnologies.org/images/premium-oracle.jpg']
            }
          },
          quantity: 1
        }
      ],
      metadata: {
        user_id: 'test_user_123',
        deity: 'zeus',
        session_type: 'premium_oracle'
      },
      success_url: 'https://kypriatechnologies.org/payment-success?session_id={CHECKOUT_SESSION_ID}&deity=zeus',
      cancel_url: 'https://kypriatechnologies.org/payment-canceled'
    });

    console.log('✅ Checkout session created:', session.id);
    console.log('🔗 Checkout URL:', session.url);
    console.log('');
  } catch (error) {
    console.error('❌ Failed to create session:', error.message);
    return;
  }

  // Test 2: List webhook endpoints
  console.log('Test 2: Checking webhook configuration...');
  try {
    const webhooks = await stripe.webhookEndpoints.list({ limit: 10 });
    
    if (webhooks.data.length === 0) {
      console.log('⚠️  No webhooks configured');
      console.log('📝 Action required: Add webhook at https://dashboard.stripe.com/webhooks');
      console.log('   Endpoint: https://kypriatechnologies.org/.netlify/functions/stripe-webhook');
      console.log('   Events: checkout.session.completed, customer.subscription.*');
    } else {
      console.log('✅ Webhooks configured:');
      webhooks.data.forEach(wh => {
        console.log(`   - ${wh.url}`);
        console.log(`     Status: ${wh.status}`);
        console.log(`     Events: ${wh.enabled_events.join(', ')}`);
      });
    }
    console.log('');
  } catch (error) {
    console.error('❌ Failed to list webhooks:', error.message);
  }

  // Test 3: Verify products exist
  console.log('Test 3: Checking Stripe products...');
  try {
    const products = await stripe.products.list({ limit: 10 });
    
    if (products.data.length === 0) {
      console.log('⚠️  No products found (will create on first checkout)');
    } else {
      console.log('✅ Products configured:');
      products.data.forEach(prod => {
        console.log(`   - ${prod.name}`);
      });
    }
    console.log('');
  } catch (error) {
    console.error('❌ Failed to list products:', error.message);
  }

  // Test 4: Simulate webhook event
  console.log('Test 4: Simulating webhook payload...');
  const webhookPayload = {
    id: 'evt_test_123',
    object: 'event',
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_test_123',
        object: 'checkout.session',
        amount_total: 500,
        currency: 'usd',
        customer_email: 'test@example.com',
        metadata: {
          user_id: 'test_user_123',
          deity: 'zeus',
          session_type: 'premium_oracle'
        },
        payment_status: 'paid'
      }
    }
  };
  
  console.log('📦 Sample webhook payload:');
  console.log(JSON.stringify(webhookPayload, null, 2));
  console.log('');

  console.log('🎉 Test flow complete!');
  console.log('');
  console.log('📝 Next steps:');
  console.log('1. Test with card 4242 4242 4242 4242 (any future date/CVC)');
  console.log('2. Complete checkout and verify webhook fires');
  console.log('3. Check Netlify function logs: /.netlify/functions/stripe-webhook');
  console.log('4. Message bot with "status" to verify premium access');
}

// Run tests
testPaymentFlow().catch(console.error);