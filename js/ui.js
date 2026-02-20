// js/ui.js — Micro-interactions and ritual status indicator

(function() {
  'use strict';

  /* ========================================================================
     RITUAL STATUS INDICATOR
     ======================================================================== */
  
  const statusEl = document.getElementById('ritual-status');
  if (statusEl) {
    const hours = new Date().getHours();
    const minute = new Date().getMinutes();
    
    // Determine cycle (even hours = live, odd = idle)
    const isLiveHour = hours % 2 === 0;
    const statusText = isLiveHour
      ? `✨ Ritual cycle: Live — Basilica humming at frequency ${21 * (hours + 1)}`
      : `🌙 Ritual cycle: Idle — Await invocation. Next cycle in ${60 - minute}m`;
    
    statusEl.textContent = statusText;
    statusEl.classList.add('fade-in');
  }

  /* ========================================================================
     HOVER GLOW EFFECTS ON TRINITY CARDS
     ======================================================================== */
  
  const cards = document.querySelectorAll('article[class*="rounded-xl"]');
  cards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-4px)';
    });
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
    });
  });

  /* ========================================================================
     SMOOTH SCROLL & LINK TRACKING
     ======================================================================== */
  
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ========================================================================
     ACCESSIBILITY: FOCUS MANAGEMENT
     ======================================================================== */
  
  document.addEventListener('keydown', function(e) {
    // Trap focus in modals if any are open (extensible hook)
    if (e.key === 'Escape') {
      // Close any open modals here if implemented
    }
  });

  /* ========================================================================
     PERFORMANCE: LAZY IMAGE LOADING
     ======================================================================== */
  
  if ('IntersectionObserver' in window) {
    const images = document.querySelectorAll('img[data-src]');
    let remaining = images.length;
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          observer.unobserve(img);
          remaining--;
          if (remaining === 0) {
            observer.disconnect();
          }
        }
      });
    });
    images.forEach(img => imageObserver.observe(img));
  }

  /* ========================================================================
     THEME TOGGLE (OPTIONAL: Extend with dark/light modes)
     ======================================================================== */
  
  function initThemeToggle() {
    const themeKey = 'kypria-theme';
    const savedTheme = localStorage.getItem(themeKey) || 'cosmic';
    
    // Apply saved theme
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Hook for future theme button
    window.toggleTheme = function(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem(themeKey, theme);
    };
  }
  
  initThemeToggle();

  /* ========================================================================
     READY
     ======================================================================== */
  
  console.log('✨ The Basilica awakens. All rituals loaded.');
})();
