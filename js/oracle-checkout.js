// Oracle Stripe Checkout Integration - PRODUCTION READY
// Uses Stripe Payment Links for reliable checkout (no serverless dependency)

const stripe = Stripe('pk_live_51SNypMADK1uzxo0bVZQO2I');

class OracleCheckout {
  constructor() {
    // Payment link is fetched from backend to avoid hardcoding
    this.paymentLink = null;
    this.baseUrl = '/.netlify/functions';
    this.initCheckout();
    this.checkSubscriptionStatus();
    this.loadPaymentLink();
  }

  async loadPaymentLink() {
    try {
      const response = await fetch(`${this.baseUrl}/get-checkout-config`);
      if (!response.ok) {
        throw new Error(`Config request failed with status ${response.status}`);
      }
      const data = await response.json();
      if (data.paymentLink) {
        this.paymentLink = data.paymentLink;
      } else {
        console.error('Payment link not available:', data.error);
      }
    } catch (err) {
      console.error('Failed to load payment configuration:', err);
    }
  }

  initCheckout() {
    const checkoutButton = document.getElementById('checkout-button');
    if (checkoutButton) {
      checkoutButton.addEventListener('click', () => this.redirectToCheckout());
    }
  }

  redirectToCheckout() {
    const button = document.getElementById('checkout-button');
    if (button) {
      button.innerHTML = '\u26a1 Opening sacred gateway...';
      button.disabled = true;
    }
    try {
      if (!this.paymentLink) {
        throw new Error('Payment link not loaded');
      }
      // Use direct Stripe Payment Link for reliable checkout
      window.location.href = this.paymentLink;
    } catch (err) {
      console.error('Payment redirection failed.', err);
      alert('Unable to redirect. Please try again later.');
      if (button) {
        button.textContent = 'Subscribe Now';
        button.disabled = false;
      }
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
      badge.textContent = '\u26dc PRO';
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
