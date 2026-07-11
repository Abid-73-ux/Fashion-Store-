/**
 * Store Settings Service
 * Manages store configuration and calculation utilities
 */

const storeSettings = {
  // Store current settings
  settings: null,
  
  // API endpoint - use config for environment detection
  API_URL: API_CONFIG.getEndpoint('/settings'),
  
  /**
   * Initialize - fetch settings from API
   */
  async initialize() {
    try {
      const response = await fetch(this.API_URL);
      if (!response.ok) throw new Error('Failed to fetch settings');
      
      const data = await response.json();
      this.settings = data.data || data;
      
      console.log('✅ Store settings loaded:', this.settings);
      return this.settings;
    } catch (error) {
      console.error('❌ Error loading store settings:', error);
      // Return default settings if API fails
      this.settings = this.getDefaultSettings();
      return this.settings;
    }
  },
  
  /**
   * Get default settings if API is unavailable
   */
  getDefaultSettings() {
    return {
      currency: 'PKR',
      currencySymbol: 'Rs',
      taxPercentage: 0,
      shippingCost: 0,
      freeShippingThreshold: 5000,
      storeName: 'TAKANJ'
    };
  },
  
  /**
   * Format currency - converts number to formatted string
   * @param {number} amount - Amount to format
   * @returns {string} Formatted currency string (e.g., "Rs 2,499")
   */
  formatCurrency(amount) {
    if (!this.settings) {
      this.settings = this.getDefaultSettings();
    }
    
    if (!amount && amount !== 0) return this.settings.currencySymbol + ' 0';
    
    const num = parseFloat(amount);
    if (isNaN(num)) return this.settings.currencySymbol + ' 0';
    
    // Format with commas
    const formatted = num.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
    
    return `${this.settings.currencySymbol} ${formatted}`;
  },
  
  /**
   * Format currency with decimals
   * @param {number} amount - Amount to format
   * @returns {string} Formatted currency string with 2 decimals
   */
  formatCurrencyDecimal(amount) {
    if (!this.settings) {
      this.settings = this.getDefaultSettings();
    }
    
    if (!amount && amount !== 0) return this.settings.currencySymbol + ' 0.00';
    
    const num = parseFloat(amount);
    if (isNaN(num)) return this.settings.currencySymbol + ' 0.00';
    
    const formatted = num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    
    return `${this.settings.currencySymbol} ${formatted}`;
  },
  
  /**
   * Calculate tax based on configured percentage
   * @param {number} subtotal - Subtotal amount
   * @returns {number} Tax amount
   */
  calculateTax(subtotal) {
    if (!this.settings) {
      this.settings = this.getDefaultSettings();
    }
    
    if (this.settings.taxPercentage === 0 || !this.settings.taxPercentage) {
      return 0;
    }
    
    const taxRate = parseFloat(this.settings.taxPercentage) / 100;
    return Math.round(subtotal * taxRate * 100) / 100;
  },
  
  /**
   * Calculate shipping based on threshold
   * @param {number} subtotal - Subtotal amount
   * @returns {number} Shipping cost
   */
  calculateShipping(subtotal) {
    if (!this.settings) {
      this.settings = this.getDefaultSettings();
    }
    
    const threshold = parseFloat(this.settings.freeShippingThreshold) || 5000;
    const shippingCost = parseFloat(this.settings.shippingCost) || 0;
    
    // Free shipping if subtotal is above threshold
    if (subtotal >= threshold) {
      return 0;
    }
    
    return shippingCost;
  },
  
  /**
   * Calculate grand total
   * @param {number} subtotal - Subtotal
   * @param {number} shipping - Shipping cost (optional, will calculate if not provided)
   * @param {number} discount - Discount amount (default 0)
   * @param {number} couponDiscount - Coupon discount amount (default 0)
   * @returns {number} Grand total
   */
  calculateGrandTotal(subtotal, shipping = null, discount = 0, couponDiscount = 0) {
    if (!this.settings) {
      this.settings = this.getDefaultSettings();
    }
    
    // Calculate shipping if not provided
    const shippingCost = shipping !== null ? shipping : this.calculateShipping(subtotal);
    
    // Calculate tax
    const tax = this.calculateTax(subtotal);
    
    // Total = subtotal + shipping + tax - discounts
    return Math.round((subtotal + shippingCost + tax - discount - couponDiscount) * 100) / 100;
  },
  
  /**
   * Get tax percentage for display
   * @returns {number} Tax percentage
   */
  getTaxPercentage() {
    if (!this.settings) {
      this.settings = this.getDefaultSettings();
    }
    return this.settings.taxPercentage || 0;
  },
  
  /**
   * Check if tax is enabled
   * @returns {boolean} True if tax percentage > 0
   */
  isTaxEnabled() {
    if (!this.settings) {
      this.settings = this.getDefaultSettings();
    }
    return (this.settings.taxPercentage || 0) > 0;
  },
  
  /**
   * Get free shipping threshold
   * @returns {number} Free shipping threshold amount
   */
  getFreeShippingThreshold() {
    if (!this.settings) {
      this.settings = this.getDefaultSettings();
    }
    return this.settings.freeShippingThreshold || 5000;
  },
  
  /**
   * Get currency symbol
   * @returns {string} Currency symbol (e.g., "Rs")
   */
  getCurrencySymbol() {
    if (!this.settings) {
      this.settings = this.getDefaultSettings();
    }
    return this.settings.currencySymbol || 'Rs';
  }
};

// Auto-initialize when script loads
document.addEventListener('DOMContentLoaded', () => {
  if (!storeSettings.settings) {
    storeSettings.initialize();
  }
});
