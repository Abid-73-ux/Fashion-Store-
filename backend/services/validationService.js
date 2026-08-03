/**
 * Validation Service
 * Provides regex patterns and validation utilities for checkout and order forms
 */

const validator = require('validator');

const validationPatterns = {
  // Names: letters, spaces, hyphens, apostrophes, 2-50 chars
  name: /^[a-zA-Z\s'-]{2,50}$/,

  // Email: simplified RFC 5322 compliant pattern (no ReDoS risk)
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,

  // WhatsApp: Pakistan numbers starting with +92 or 0, followed by 3-9 and 9 more digits
  whatsappNumber: /^(\+92|0)[3-9]\d{9}$/,

  // Postal Code: 3-10 digits (flexible for different formats)
  postalCode: /^\d{3,10}$/,

  // Street/City/State: alphanumeric, spaces, hyphens, commas, periods (limited to prevent ReDoS)
  address: /^[a-zA-Z0-9\s,'-\.]{3,100}$/,

  // Coupon Code: alphanumeric, hyphens, underscores, 3-20 chars
  couponCode: /^[a-zA-Z0-9_-]{3,20}$/
};

// Input length limits
const INPUT_LIMITS = {
  MAX_PASSWORD: 128,
  MAX_EMAIL: 100,
  MAX_NAME: 100,
  MAX_PHONE: 20,
  MAX_ADDRESS: 500,
  MAX_COUPON_CODE: 20,
  MAX_SEARCH_QUERY: 200,
  MAX_NOTES: 1000
};

/**
 * Validate customer information
 * @param {Object} customerInfo - Customer data to validate
 * @returns {Object} { isValid: boolean, errors: {fieldName: errorMessage} }
 */
function validateCustomerInfo(customerInfo) {
  const errors = {};

  // Validate firstName
  if (!customerInfo.firstName || !customerInfo.firstName.trim()) {
    errors.firstName = 'First name is required';
  } else if (customerInfo.firstName.length > INPUT_LIMITS.MAX_NAME) {
    errors.firstName = `First name cannot exceed ${INPUT_LIMITS.MAX_NAME} characters`;
  } else if (!validationPatterns.name.test(customerInfo.firstName.trim())) {
    errors.firstName = 'First name must be 2-50 characters (letters, spaces, hyphens, apostrophes)';
  }

  // Validate lastName
  if (!customerInfo.lastName || !customerInfo.lastName.trim()) {
    errors.lastName = 'Last name is required';
  } else if (customerInfo.lastName.length > INPUT_LIMITS.MAX_NAME) {
    errors.lastName = `Last name cannot exceed ${INPUT_LIMITS.MAX_NAME} characters`;
  } else if (!validationPatterns.name.test(customerInfo.lastName.trim())) {
    errors.lastName = 'Last name must be 2-50 characters (letters, spaces, hyphens, apostrophes)';
  }

  // Validate email
  if (!customerInfo.email || !customerInfo.email.trim()) {
    errors.email = 'Email is required';
  } else if (customerInfo.email.length > INPUT_LIMITS.MAX_EMAIL) {
    errors.email = `Email cannot exceed ${INPUT_LIMITS.MAX_EMAIL} characters`;
  } else if (!validator.isEmail(customerInfo.email.trim())) {
    errors.email = 'Please enter a valid email address';
  }

  // Validate whatsappNumber
  if (!customerInfo.whatsappNumber || !customerInfo.whatsappNumber.trim()) {
    errors.whatsappNumber = 'WhatsApp number is required';
  } else if (customerInfo.whatsappNumber.length > INPUT_LIMITS.MAX_PHONE) {
    errors.whatsappNumber = `Phone number cannot exceed ${INPUT_LIMITS.MAX_PHONE} characters`;
  } else if (!validationPatterns.whatsappNumber.test(customerInfo.whatsappNumber.trim())) {
    errors.whatsappNumber = 'Please enter a valid Pakistan phone number (e.g., +923001234567 or 03001234567)';
  }

  // Validate shippingAddress
  if (!customerInfo.shippingAddress) {
    errors.shippingAddress = 'Shipping address is required';
  } else {
    const addr = customerInfo.shippingAddress;

    if (!addr.street || !addr.street.trim()) {
      errors.street = 'Street is required';
    } else if (addr.street.length > INPUT_LIMITS.MAX_ADDRESS) {
      errors.street = `Street cannot exceed ${INPUT_LIMITS.MAX_ADDRESS} characters`;
    } else if (!validationPatterns.address.test(addr.street.trim())) {
      errors.street = 'Please enter a valid street address';
    }

    if (!addr.city || !addr.city.trim()) {
      errors.city = 'City is required';
    } else if (addr.city.length > INPUT_LIMITS.MAX_ADDRESS) {
      errors.city = `City cannot exceed ${INPUT_LIMITS.MAX_ADDRESS} characters`;
    } else if (!validationPatterns.address.test(addr.city.trim())) {
      errors.city = 'Please enter a valid city';
    }

    if (!addr.state || !addr.state.trim()) {
      errors.state = 'State/Province is required';
    } else if (addr.state.length > INPUT_LIMITS.MAX_ADDRESS) {
      errors.state = `State cannot exceed ${INPUT_LIMITS.MAX_ADDRESS} characters`;
    } else if (!validationPatterns.address.test(addr.state.trim())) {
      errors.state = 'Please enter a valid state';
    }

    if (!addr.postalCode || !addr.postalCode.trim()) {
      errors.postalCode = 'Postal code is required';
    } else if (addr.postalCode.length > 10) {
      errors.postalCode = 'Postal code cannot exceed 10 characters';
    } else if (!validationPatterns.postalCode.test(addr.postalCode.trim())) {
      errors.postalCode = 'Postal code must be 3-10 digits';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate coupon code format
 * @param {string} couponCode - Coupon code to validate
 * @returns {boolean} True if valid format
 */
function isValidCouponCode(couponCode) {
  if (!couponCode) return true; // Optional field
  if (couponCode.length > INPUT_LIMITS.MAX_COUPON_CODE) return false;
  return validationPatterns.couponCode.test(couponCode.trim());
}

/**
 * Validate email format using battle-tested library
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
function isValidEmail(email) {
  if (!email) return false;
  if (email.length > INPUT_LIMITS.MAX_EMAIL) return false;
  return validator.isEmail(email.trim());
}

/**
 * Validate WhatsApp number
 * @param {string} whatsappNumber - Phone number to validate
 * @returns {boolean} True if valid
 */
function isValidWhatsAppNumber(whatsappNumber) {
  if (!whatsappNumber) return false;
  if (whatsappNumber.length > INPUT_LIMITS.MAX_PHONE) return false;
  return validationPatterns.whatsappNumber.test(whatsappNumber.trim());
}

/**
 * Sanitize input string to prevent XSS
 * @param {string} str - String to sanitize
 * @param {number} maxLength - Maximum allowed length
 * @returns {string} Sanitized string
 */
function sanitizeInput(str, maxLength = INPUT_LIMITS.MAX_ADDRESS) {
  if (!str || typeof str !== 'string') return '';
  return str
    .trim()
    .replace(/[<>\"']/g, '')
    .substring(0, maxLength);
}

/**
 * Validate password strength and length
 * @param {string} password - Password to validate
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
function validatePassword(password) {
  const errors = [];

  if (!password) {
    errors.push('Password is required');
    return { isValid: false, errors };
  }

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  if (password.length > INPUT_LIMITS.MAX_PASSWORD) {
    errors.push(`Password cannot exceed ${INPUT_LIMITS.MAX_PASSWORD} characters`);
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter (A-Z)');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter (a-z)');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number (0-9)');
  }

  // SECURITY: Require special character for stronger passwords
  if (!/[@$!%*?&#\-_+=]/.test(password)) {
    errors.push('Password must contain at least one special character (@$!%*?&#-_+=)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  validationPatterns,
  validateCustomerInfo,
  isValidCouponCode,
  isValidEmail,
  isValidWhatsAppNumber,
  sanitizeInput,
  validatePassword,
  INPUT_LIMITS
};
