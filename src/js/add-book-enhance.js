/**
 * Progressive enhancement for add-book page
 * This script is optional - all functionality works without JavaScript
 * Enhancements:
 * - Prevent double-submission of forms
 * - Show loading states during async operations
 * - Client-side URL validation feedback
 */

(function() {
  'use strict';

  // Prevent double-submission and show loading state
  function enhanceForms() {
    const forms = document.querySelectorAll('form[action^="/.netlify/functions"]');

    forms.forEach(form => {
      form.addEventListener('submit', function(e) {
        const submitBtn = form.querySelector('button[type="submit"]');

        if (submitBtn && !submitBtn.disabled) {
          // Store original text
          const originalText = submitBtn.textContent;

          // Disable button and show loading state
          submitBtn.disabled = true;
          submitBtn.textContent = '⏳ ' + originalText.replace(/^⏳\s*/, '');

          // Form will submit normally after this
          // Button stays disabled to prevent double-click
        }
      });
    });
  }

  // Client-side URL validation feedback
  function enhanceUrlInput() {
    const urlInput = document.getElementById('url');
    if (!urlInput) return;

    urlInput.addEventListener('input', function() {
      const url = this.value.trim();

      // Clear custom validity on input
      this.setCustomValidity('');

      if (!url) return;

      // Check if URL starts with http:// or https://
      if (url && !url.match(/^https?:\/\/.+/)) {
        this.setCustomValidity('URL must start with http:// or https://');
      }
    });

    urlInput.addEventListener('invalid', function() {
      if (!this.value) {
        this.setCustomValidity('Please enter a book URL');
      }
    });
  }

  // Initialize enhancements when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      enhanceForms();
      enhanceUrlInput();
    });
  } else {
    enhanceForms();
    enhanceUrlInput();
  }
})();
