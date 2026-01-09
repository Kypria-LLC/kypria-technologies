// Oracle Stripe Checkout Integration - PRODUCTION READY
const stripe = Stripe('pk_live_51SNypMADK1uzxo0bVZQO2I');

class OracleCheckout {
  constructor() {
    this.priceId = 'price_1SndaLADK1uzxo0bXOpqrjMF'; // $15/month Pro tier
    this.baseUrl = '/.netlify/functions';
    this.initCheckout();
    this.checkSubscriptionStatus();
  }

  initCheckout() {
    const checkoutButton = document.getElementById('checkout-button');
    if (checkoutButton) {
      checkoutButton.addEventListener('click', () => this.redirectToCheckout());
    }
  }

  async redirectToCheckout() {
    try {
      const button = document.getElementById('checkout-button');
      const originalText = button.innerHTML;
      button.innerHTML = '⚡ Opening sacred gateway...';
      button.disabled = true;

      const response = await fetch(`${this.baseUrl}/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: this.priceId,
          successUrl: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: window.location.href,
        })
      });

      if (!response.ok) throw new Error('Failed to create checkout session');

      const { sessionId } = await response.json();
      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        console.error('Checkout error:', error);
        alert('Unable to start checkout. Please contact support.');
        button.innerHTML = originalText;
        button.disabled = false;
      }
    } catch (err) {
      console.error('Checkout failed:', err);
      alert('An error occurred. Please try again.');
      button.disabled = false;
    }
  }

  async checkSubscriptionStatus() {
    const email = localStorage.getItem('userEmail');
    if (!email) return;

    try {
      const response = await fetch(`${this.baseUrl}/verify-subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      if (data.subscribed && data.tier === 'pro') {
        this.activateProFeatures();
      }
    } catch (err) {
      console.error('Subscription check failed:', err);
    }
  }

  activateProFeatures() {
    const banner = document.querySelector('.oracle-upgrade-banner');
    if (banner) banner.style.display = 'none';

    const header = document.querySelector('.basilica-title');
    if (header) {
      const badge = document.createElement('span');
      badge.style.cssText = 'color: #d4af37; font-size: 0.5em; margin-left: 10px;';
      badge.textContent = '⚜ PRO';
      header.appendChild(badge);
    }

    localStorage.setItem('oracleProTier', 'true');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new OracleCheckout());
} else {
  new OracleCheckout();
}
