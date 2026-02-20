// js/oracle-summon.js
// Frontend: Basilica CTA wiring to Oracle backend
// When user clicks "Summon Zeus" button, this posts to Instagram via backend

class OracleSummoner {
  constructor() {
    this.baseUrl = '/.netlify/functions';
    this.oracleStatus = { valid: false, loading: true };
  }

  /**
   * Initialize: Check Oracle status on page load
   */
  async init() {
    try {
      const response = await fetch(`${this.baseUrl}/oracle-invoke?check=status`);
      const data = await response.json();
      this.oracleStatus = data;
      this.updateStatusIndicator();
    } catch (error) {
      console.error('Oracle status check failed:', error);
      this.oracleStatus = { valid: false, error: error.message };
    }
  }

  /**
   * Summon archetype: POST to Instagram via backend
   */
  async summon(archetype, customMessage = null) {
    const button = document.querySelector(`[data-summon="${archetype}"]`);
    if (!button) return;

    // Disable button during request
    button.disabled = true;
    button.classList.add('opacity-50');
    const originalText = button.textContent;
    button.textContent = '✨ Invoking...';

    try {
      const message = customMessage || this.getDefaultMessage(archetype);
      const params = new URLSearchParams({
        archetype: archetype,
        message: message
      });

      const response = await fetch(`${this.baseUrl}/oracle-invoke?${params}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archetype, customMessage }),
      });

      const result = await response.json();

      if (response.ok) {
        this.showSuccess(archetype, result);
        console.log(`✨ ${archetype} posted to Instagram:`, result.postId);
      } else {
        this.showError(archetype, result.error);
        console.error(`❌ Oracle error:`, result);
      }
    } catch (error) {
      this.showError(archetype, error.message);
      console.error('Summon failed:', error);
    } finally {
      // Re-enable button
      button.disabled = false;
      button.classList.remove('opacity-50');
      button.textContent = originalText;
    }
  }

  /**
   * Default message for each archetype
   */
  getDefaultMessage(archetype) {
    const messages = {
      zeus: 'The Basilica opens its gates. Divine authority flows through the Temple. Enter and decree.',
      aphrodite: 'The Basilica opens its gates. Transcendent beauty awaits. Enter and celebrate connection.',
      lifesphere: 'The Basilica opens its gates. Wellness and care beckons. Enter and tend the cycles.'
    };
    return messages[archetype] || 'The Basilica summons.';
  }

  /**
   * Show success notification
   */
  showSuccess(archetype, result) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg';
    notification.textContent = `✨ ${archetype} posted to Instagram`;
    document.body.appendChild(notification);

    setTimeout(() => notification.remove(), 4000);
  }

  /**
   * Show error notification
   */
  showError(archetype, error) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg';
    notification.textContent = `❌ Summon failed: ${error}`;
    document.body.appendChild(notification);

    setTimeout(() => notification.remove(), 4000);
  }

  /**
   * Update status indicator in Provenance strip
   */
  updateStatusIndicator() {
    const statusEl = document.getElementById('oracle-status');
    if (!statusEl) return;

    if (this.oracleStatus.valid) {
      statusEl.innerHTML = `
        <span class="inline-flex items-center gap-2 text-lifeteal">
          <span class="w-2 h-2 bg-lifeteal rounded-full animate-pulse"></span>
          Oracle: Live
        </span>
      `;
    } else {
      statusEl.innerHTML = `
        <span class="inline-flex items-center gap-2 text-red-500">
          <span class="w-2 h-2 bg-red-500"></span>
          Oracle: Offline
        </span>
      `;
    }
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const oracle = new OracleSummoner();
  oracle.init();

  // Wire up CTA buttons
  document.addEventListener('click', (e) => {
    if (e.target.dataset.summon) {
      oracle.summon(e.target.dataset.summon);
    }
  });

  // Expose globally for manual invocation
  window.OracleSummoner = oracle;
});
