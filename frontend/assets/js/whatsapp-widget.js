/**
 * WHATSAPP FLOATING WIDGET
 * Professional WhatsApp support widget for Takanj
 * Features: Auto message generation, animations, analytics tracking
 */

class WhatsAppWidget {
  constructor(options = {}) {
    // Configuration
    this.businessPhone = options.businessPhone || '923704969460'; // With country code (03704969460)
    this.businessName = options.businessName || 'Takanj';
    this.position = options.position || 'bottom-left';
    this.enableAnalytics = options.enableAnalytics !== false;
    this.showOnlineStatus = options.showOnlineStatus !== false;
    this.workingHours = options.workingHours || {
      enabled: false,
      startHour: 9,
      endHour: 18,
      daysOfWeek: [1, 2, 3, 4, 5] // Monday-Friday
    };

    // State
    this.isOnline = true;
    this.sessionId = this.generateSessionId();
    this.userId = this.getUserId();
    this.messageCount = 0;
    this.pulseEnabled = true;

    // Initialize
    this.init();
  }

  /**
   * Initialize the widget
   */
  init() {
    // Check if already initialized
    if (document.querySelector('.whatsapp-widget-container')) {
      return;
    }

    // Check working hours
    if (this.workingHours.enabled) {
      this.updateOnlineStatus();
    }

    // Inject CSS
    this.injectCSS();

    // Create widget
    this.createWidget();

    // Add event listeners
    this.attachEventListeners();

    // Add to DOM
    this.render();

    // Start pulse animation
    this.startPulse();

    // Log widget initialization
    console.log('✅ WhatsApp Widget Initialized');
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Get user ID from localStorage or generate guest ID
   */
  getUserId() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      try {
        return JSON.parse(currentUser).id || this.generateSessionId();
      } catch (e) {
        return this.generateSessionId();
      }
    }
    return null;
  }

  /**
   * Inject CSS into document
   */
  injectCSS() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'assets/css/whatsapp-widget.css';
    document.head.appendChild(link);
  }

  /**
   * Create widget HTML
   */
  createWidget() {
    const container = document.createElement('div');
    container.className = 'whatsapp-widget-container animate-in';

    container.innerHTML = `
      <button class="whatsapp-btn" id="whatsappBtn" aria-label="Chat with us on WhatsApp" title="Chat with us on WhatsApp">
        <i class="bi bi-whatsapp" style="font-size: 28px;"></i>
        <div class="whatsapp-status online"></div>
        <div class="whatsapp-tooltip">
          <span class="whatsapp-tooltip-text">
            <strong>Need help?</strong>
            Chat with us<br>
            <span style="font-size: 0.85em; margin-top: 4px; display: block;">03704969460</span>
          </span>
          </span>
        </div>
      </button>
    `;

    this.container = container;
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    const button = this.container.querySelector('.whatsapp-btn');
    button.addEventListener('click', () => this.handleClick());
    button.addEventListener('mouseenter', () => this.onHover());
    button.addEventListener('mouseleave', () => this.onHoverEnd());
  }

  /**
   * Render widget to DOM
   */
  render() {
    // Wait for DOM to be ready
    if (document.body) {
      document.body.appendChild(this.container);
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        document.body.appendChild(this.container);
      });
    }
  }

  /**
   * Handle button click
   */
  handleClick() {
    const message = this.generateMessage();
    const encodedMessage = encodeURIComponent(message);

    // Track analytics
    if (this.enableAnalytics) {
      this.trackClick(message);
    }

    // Open WhatsApp
    this.openWhatsApp(encodedMessage);
  }

  /**
   * Generate context-aware message
   */
  generateMessage() {
    const currentPage = this.getCurrentPage();
    const time = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

    let message = `Hello ${this.businessName},\n`;
    message += `I am contacting you at ${time}.\n\n`;

    switch (currentPage) {
      case 'product':
        message += this.generateProductMessage();
        break;
      case 'cart':
        message += this.generateCartMessage();
        break;
      case 'checkout':
        message += this.generateCheckoutMessage();
        break;
      default:
        message += this.generateDefaultMessage();
    }

    return message;
  }

  /**
   * Generate default message
   */
  generateDefaultMessage() {
    const messages = [
      `I would like to know more about your products. Can you help me?`,
      `I'm interested in your services. How can I get started?`,
      `Do you have any special offers available right now?`,
      `I need assistance with my order or inquiry.`,
      `I have a question about your products.`
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  /**
   * Generate product-specific message
   */
  generateProductMessage() {
    let message = `I'm interested in this product.\n\n`;

    const productName = document.querySelector('h1')?.textContent || 'Product';
    const productPrice = document.querySelector('[data-price]')?.textContent || '';
    const productSize = document.querySelector('[data-size]')?.textContent || '';
    const productColor = document.querySelector('[data-color]')?.textContent || '';

    if (productName) message += `📦 Product: ${productName}\n`;
    if (productPrice) message += `💰 Price: ${productPrice}\n`;
    if (productSize) message += `📏 Size: ${productSize}\n`;
    if (productColor) message += `🎨 Color: ${productColor}\n`;

    message += `\nCan you tell me if it's available?`;

    return message;
  }

  /**
   * Generate cart-specific message
   */
  generateCartMessage() {
    let message = `I need help with my shopping cart.\n\n`;

    // Try to get cart items from localStorage
    const cartData = localStorage.getItem('cart');
    if (cartData) {
      try {
        const cart = JSON.parse(cartData);
        if (Array.isArray(cart) && cart.length > 0) {
          message += `📋 Items:\n`;
          cart.forEach((item, index) => {
            message += `${index + 1}. ${item.name || 'Product'} x${item.quantity || 1}\n`;
          });

          const total = cart.reduce((sum, item) => {
            const price = parseFloat(item.price) || 0;
            const qty = item.quantity || 1;
            return sum + (price * qty);
          }, 0);

          if (total > 0) {
            message += `\n💵 Total: Rs. ${total.toFixed(2)}\n`;
          }
        }
      } catch (e) {
        console.error('Error reading cart data:', e);
      }
    }

    message += `\nCan you help me with this order?`;

    return message;
  }

  /**
   * Generate checkout-specific message
   */
  generateCheckoutMessage() {
    let message = `I have a question before placing my order.\n\n`;
    message += `Can you assist me with the checkout process?`;

    return message;
  }

  /**
   * Get current page type
   */
  getCurrentPage() {
    const path = window.location.pathname;

    if (path.includes('product')) return 'product';
    if (path.includes('cart')) return 'cart';
    if (path.includes('checkout')) return 'checkout';

    return 'default';
  }

  /**
   * Open WhatsApp
   */
  openWhatsApp(message) {
    let url;

    // Detect if mobile or desktop
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    // Create WhatsApp link
    const basePhone = this.businessPhone.replace(/[^\d]/g, ''); // Remove all non-digits

    if (isMobile) {
      // Mobile: Open WhatsApp App
      url = `whatsapp://send?phone=${basePhone}&text=${message}`;
    } else {
      // Desktop: Open WhatsApp Web
      url = `https://wa.me/${basePhone}?text=${message}`;
    }

    // Open in new window
    window.open(url, '_blank');
  }

  /**
   * Track click event (send to backend)
   */
  trackClick(message) {
    const trackingData = {
      sessionId: this.sessionId,
      userId: this.userId,
      page: this.getCurrentPage(),
      pageUrl: window.location.href,
      message: message,
      device: this.getDeviceType(),
      timestamp: new Date().toISOString(),
      productId: this.getProductId(),
      browserInfo: navigator.userAgent
    };

    // Save to localStorage for local analytics
    this.saveLocalAnalytics(trackingData);

    // Send to backend API (if available)
    this.sendAnalyticsToBackend(trackingData);
  }

  /**
   * Save analytics locally
   */
  saveLocalAnalytics(data) {
    try {
      const analytics = JSON.parse(localStorage.getItem('whatsappAnalytics') || '[]');
      analytics.push(data);
      localStorage.setItem('whatsappAnalytics', JSON.stringify(analytics));
    } catch (e) {
      console.error('Error saving local analytics:', e);
    }
  }

  /**
   * Send analytics to backend
   */
  sendAnalyticsToBackend(data) {
    // Send to backend API endpoint
    fetch('/api/whatsapp/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sessionId: data.sessionId,
        userId: data.userId,
        pageUrl: data.pageUrl,
        pageType: data.pageType,
        generatedMessage: data.message,
        productId: data.productId,
        deviceType: data.device,
        browserInfo: data.browserInfo
      })
    }).catch(err => {
      // Silent fail - don't block user experience
      console.debug('Analytics tracking (will work after backend deployment)');
    });
  }

  /**
   * Get device type
   */
  getDeviceType() {
    const ua = navigator.userAgent;
    if (/mobile/i.test(ua)) return 'mobile';
    if (/tablet/i.test(ua)) return 'tablet';
    return 'desktop';
  }

  /**
   * Get product ID from page (if available)
   */
  getProductId() {
    const productId = document.querySelector('[data-product-id]')?.getAttribute('data-product-id');
    return productId || null;
  }

  /**
   * Update online status based on working hours
   */
  updateOnlineStatus() {
    if (!this.workingHours.enabled) return;

    const now = new Date();
    const dayOfWeek = now.getDay();
    const hour = now.getHours();

    const isWorkingDay = this.workingHours.daysOfWeek.includes(dayOfWeek);
    const isWorkingHour = hour >= this.workingHours.startHour && hour < this.workingHours.endHour;

    this.isOnline = isWorkingDay && isWorkingHour;

    if (!this.isOnline) {
      this.updateStatus('offline');
    }
  }

  /**
   * Update status display
   */
  updateStatus(status) {
    const statusDiv = this.container.querySelector('.whatsapp-status');
    if (statusDiv) {
      statusDiv.className = `whatsapp-status ${status}`;
      if (status === 'offline') {
        statusDiv.innerHTML = '●';
      } else {
        statusDiv.innerHTML = '●';
      }
    }
  }

  /**
   * Start pulse animation
   */
  startPulse() {
    const button = this.container.querySelector('.whatsapp-btn');
    if (button && this.pulseEnabled) {
      button.classList.add('pulse');

      // Stop pulse after 5 seconds and restart after 10 seconds
      setInterval(() => {
        button.classList.remove('pulse');
        setTimeout(() => {
          button.classList.add('pulse');
        }, 5000);
      }, 15000);
    }
  }

  /**
   * On hover
   */
  onHover() {
    // Can add additional hover effects here
  }

  /**
   * On hover end
   */
  onHoverEnd() {
    // Can add additional hover end effects here
  }

  /**
   * Public method to update business phone
   */
  setBusinessPhone(phone) {
    this.businessPhone = phone;
  }

  /**
   * Public method to enable/disable widget
   */
  setEnabled(enabled) {
    const container = this.container;
    if (enabled) {
      container.style.display = 'block';
    } else {
      container.style.display = 'none';
    }
  }

  /**
   * Get analytics data
   */
  getAnalytics() {
    try {
      return JSON.parse(localStorage.getItem('whatsappAnalytics') || '[]');
    } catch (e) {
      return [];
    }
  }

  /**
   * Clear analytics data
   */
  clearAnalytics() {
    localStorage.removeItem('whatsappAnalytics');
  }
}

/**
 * Auto-initialize widget on page load
 */
document.addEventListener('DOMContentLoaded', () => {
  // Check if widget should be initialized
  const shouldInitialize = !window.whatsappWidgetDisabled;

  if (shouldInitialize) {
    window.whatsappWidget = new WhatsAppWidget({
      businessPhone: '923704969460',
      businessName: 'Takanj',
      enableAnalytics: true,
      showOnlineStatus: true,
      workingHours: {
        enabled: false, // Set to true to enable
        startHour: 9,
        endHour: 18,
        daysOfWeek: [1, 2, 3, 4, 5]
      }
    });
  }
});
