/**
 * Validation Service
 * Provides regex patterns and validation utilities for checkout and order forms
 */

const validationPatterns = {
  // Names: letters, spaces, hyphens, apostrophes, 2-50 chars
  name: /^[a-zA-Z\s'-]{2,50}$/,

  // Email: standard email format
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

  // WhatsApp: Pakistan numbers starting with +92 or 0, followed by 3-9 and 9 more digits
  whatsappNumber: /^(\+92|0)[3-9]\d{9}$/,

  // Postal Code: 5 digits (Pakistan format)
  postalCode: /^\d{5}$/,

  // Street/City/State: alphanumeric, spaces, hyphens, commas, periods
  address: /^[a-zA-Z0-9\s,'-\.]{3,100}$/,

  // Coupon Code: alphanumeric, hyphens, underscores, 3-20 chars
  couponCode: /^[a-zA-Z0-9_-]{3,20}$/
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
  } else if (!validationPatterns.name.test(customerInfo.firstName.trim())) {
    errors.firstName = 'First name must be 2-50 characters (letters, spaces, hyphens, apostrophes)';
  }

  // Validate lastName
  if (!customerInfo.lastName || !customerInfo.lastName.trim()) {
    errors.lastName = 'Last name is required';
  } else if (!validationPatterns.name.test(customerInfo.lastName.trim())) {
    errors.lastName = 'Last name must be 2-50 characters (letters, spaces, hyphens, apostrophes)';
  }

  // Validate email
  if (!customerInfo.email || !customerInfo.email.trim()) {
    errors.email = 'Email is required';
  } else if (!validationPatterns.email.test(customerInfo.email.trim())) {
    errors.email = 'Please enter a valid email address';
  }

  // Validate whatsappNumber
  if (!customerInfo.whatsappNumber || !customerInfo.whatsappNumber.trim()) {
    errors.whatsappNumber = 'WhatsApp number is required';
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
    } else if (!validationPatterns.address.test(addr.street.trim())) {
      errors.street = 'Please enter a valid street address';
    }

    if (!addr.city || !addr.city.trim()) {
      errors.city = 'City is required';
    } else if (!validationPatterns.address.test(addr.city.trim())) {
      errors.city = 'Please enter a valid city';
    }

    if (!addr.state || !addr.state.trim()) {
      errors.state = 'State/Province is required';
    } else if (!validationPatterns.address.test(addr.state.trim())) {
      errors.state = 'Please enter a valid state';
    }

    if (!addr.postalCode || !addr.postalCode.trim()) {
      errors.postalCode = 'Postal code is required';
    } else if (!validationPatterns.postalCode.test(addr.postalCode.trim())) {
      errors.postalCode = 'Postal code must be 5 digits';
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
  return validationPatterns.couponCode.test(couponCode.trim());
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
function isValidEmail(email) {
  if (!email) return false;
  return validationPatterns.email.test(email.trim());
}

/**
 * Validate WhatsApp number
 * @param {string} whatsappNumber - Phone number to validate
 * @returns {boolean} True if valid
 */
function isValidWhatsAppNumber(whatsappNumber) {
  if (!whatsappNumber) return false;
  return validationPatterns.whatsappNumber.test(whatsappNumber.trim());
}

/**
 * Sanitize input string to prevent XSS
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
function sanitizeInput(str) {
  if (!str) return '';
  return str
    .trim()
    .replace(/[<>\"']/g, '')
    .substring(0, 500); // Limit length
}

module.exports = {
  validationPatterns,
  validateCustomerInfo,
  isValidCouponCode,
  isValidEmail,
  isValidWhatsAppNumber,
  sanitizeInput
};
