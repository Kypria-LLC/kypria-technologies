exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    
    // PayPal webhook event handling
    if (body.event_type === 'PAYMENT.SALE.COMPLETED') {
      const payment = body.resource;
      
      // Log payment details
      console.log('PayPal Payment:', {
        id: payment.id,
        amount: payment.amount.total,
        currency: payment.amount.currency,
        email: payment.billing_agreement_id
      });
      
      // Forward to Zapier
      await fetch(process.env.ZAPIER_PAYPAL_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'paypal_payment',
          amount: payment.amount.total,
          currency: payment.amount.currency,
          payment_id: payment.id,
          timestamp: new Date().toISOString()
        })
      });
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({ received: true })
    };
  } catch (error) {
    console.error('PayPal webhook error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
