// Returns public checkout configuration (e.g. Stripe payment link) from environment variables
exports.handler = async () => {
  const paymentLink = process.env.STRIPE_PAYMENT_LINK;

  if (!paymentLink) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Payment link not configured' }),
    };
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paymentLink }),
  };
};
