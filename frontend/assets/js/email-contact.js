/**
 * SIMPLE EMAIL CONTACT BUTTON
 * Uses mailto: protocol for direct email client integration
 * Lightweight and responsive solution
 */

class EmailContactWidget {
  constructor(options = {}) {
    // Configuration
    this.contactEmail = options.contactEmail || 'aliahmadameer789@gmail.com';
    this.position = options.position || 'bottom-right';
    this.businessName = options.businessName || 'Takanj';

    // Initialize
    this.init();
  }

  /**
   * Initialize the widget
   */
  init() {
    // Check if already initialized
    if (document.querySelector('.email-contact-widget-container')) {
      return;
    }

    // Inject CSS
    this.injectCSS();

    // Create widget
    this.createWidget();

    // Attach event listeners
    this.attachEventListeners();

    // Render to DOM
    this.render();

    console.log('✅ Email Contact Widget Initialized');
  }

  /**
   * Inject inline CSS
   */
  injectCSS() {
    const style = document.createElement('style');
    style.innerHTML = `
      .email-contact-widget-container {
        position: fixed;
        bottom: 100px;
        right: 20px;
        z-index: 998;
        animation: slideInUp 0.3s ease-out;
      }

      @keyframes slideInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .email-contact-btn {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: linear-gradient(135deg, #0078d4 0%, #005a9e 100%);
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0, 120, 212, 0.3);
        transition: all 0.3s ease;
        color: white;
        font-size: 24px;
        position: relative;
      }

      .email-contact-btn:hover {
        transform: scale(1.15);
        box-shadow: 0 6px 20px rgba(0, 120, 212, 0.5);
      }

      .email-contact-btn:active {
        transform: scale(0.95);
      }

      .email-contact-tooltip {
        position: absolute;
        bottom: 75px;
        right: 0;
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 12px;
        white-space: nowrap;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      .email-contact-btn:hover .email-contact-tooltip {
        opacity: 1;
      }

      /* Pulse animation */
      .email-contact-btn.pulse {
        animation: emailPulse 2s infinite;
      }

      @keyframes emailPulse {
        0% {
          box-shadow: 0 4px 12px rgba(0, 120, 212, 0.3);
        }
        50% {
          box-shadow: 0 4px 25px rgba(0, 120, 212, 0.6);
        }
        100% {
          box-shadow: 0 4px 12px rgba(0, 120, 212, 0.3);
        }
      }

      /* Mobile responsive */
      @media (max-width: 768px) {
        .email-contact-widget-container {
          bottom: 85px;
          right: 15px;
        }

        .email-contact-btn {
          width: 55px;
          height: 55px;
          font-size: 20px;
        }

        .email-contact-tooltip {
          font-size: 11px;
          bottom: 70px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Create widget HTML
   */
  createWidget() {
    const container = document.createElement('div');
    container.className = 'email-contact-widget-container';

    container.innerHTML = `
      <button class="email-contact-btn pulse" id="emailContactBtn" aria-label="Contact us via email" title="Contact us via email">
        <i class="bi bi-envelope-fill"></i>
        <div class="email-contact-tooltip">
          Email Us
        </div>
      </button>
    `;

    this.container = container;
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    const button = this.container.querySelector('#emailContactBtn');

    button.addEventListener('click', (e) => {
      e.preventDefault();
      this.openEmailClient();
    });
  }

  /**
   * Open Gmail compose window directly
   */
  openEmailClient() {
    // Gmail web compose URL - opens Gmail directly with compose window
    const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${this.contactEmail}`;
    
    try {
      // Try to open Gmail in new tab
      window.open(gmailComposeUrl, '_blank');
      console.log('✅ Opening Gmail compose for:', this.contactEmail);
    } catch (error) {
      console.error('Error opening Gmail:', error);
      this.showEmailFallback();
    }
  }

  /**
   * Show fallback toast with email address if client can't be opened
   */
  showEmailFallback() {
    // Show toast notification (using existing Toast library if available)
    if (typeof Toast !== 'undefined') {
      Toast.info(`📧 Email us at: ${this.contactEmail}`);
    } else {
      // Fallback: show alert
      alert(`📧 Contact us at:\n${this.contactEmail}`);
    }
  }

  /**
   * Render widget to DOM
   */
  render() {
    if (document.body) {
      document.body.appendChild(this.container);
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        document.body.appendChild(this.container);
      });
    }
  }
}

/**
 * Auto-initialize on page load
 */
document.addEventListener('DOMContentLoaded', () => {
  window.emailContactWidget = new EmailContactWidget({
    contactEmail: 'aliahmadameer789@gmail.com',
    businessName: 'Takanj'
  });
});
