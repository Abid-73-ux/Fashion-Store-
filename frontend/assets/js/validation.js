/**
 * Form Validation Library
 * Comprehensive client-side validation for checkout and other forms
 * Features: regex patterns, debouncing, real-time field validation, form-level validation
 */

const Validation = {
  /**
   * Validation patterns matching backend validationService
   */
  patterns: {
    firstName: /^[a-zA-Z\s'-]{2,50}$/,
    lastName: /^[a-zA-Z\s'-]{2,50}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    whatsappNumber: /^(\+92|0)[3-9]\d{9}$/,
    postalCode: /^\d{5}$/,
    street: /^.{1,255}$/,
    city: /^.{1,100}$/
  },

  /**
   * Validation error messages
   */
  messages: {
    firstName: 'First name must be 2-50 characters (letters, spaces, hyphens, apostrophes only)',
    lastName: 'Last name must be 2-50 characters (letters, spaces, hyphens, apostrophes only)',
    email: 'Please enter a valid email address',
    whatsappNumber: 'Phone number must start with +92 or 0 followed by 3-9 and 9 more digits',
    postalCode: 'Postal code must be exactly 5 digits',
    street: 'Street address must be 1-255 characters',
    city: 'City must be 1-100 characters',
    required: 'This field is required'
  },

  /**
   * Debounce timeout storage
   */
  debounceTimers: {},

  /**
   * Validate a single field
   * @param {string} fieldName - Field name (must match patterns key)
   * @param {string} value - Field value to validate
   * @param {boolean} isRequired - Whether field is required
   * @returns {object} {isValid: boolean, message: string}
   */
  validateField: function(fieldName, value, isRequired = true) {
    // Check if required
    if (isRequired && (!value || value.trim() === '')) {
      return {
        isValid: false,
        message: this.messages.required
      };
    }

    // If not required and empty, it's valid
    if (!isRequired && (!value || value.trim() === '')) {
      return {
        isValid: true,
        message: ''
      };
    }

    // Check if pattern exists
    if (this.patterns[fieldName]) {
      const isValid = this.patterns[fieldName].test(value.trim());
      return {
        isValid: isValid,
        message: isValid ? '' : (this.messages[fieldName] || 'Invalid input')
      };
    }

    // No pattern found, assume valid if not required
    return {
      isValid: true,
      message: ''
    };
  },

  /**
   * Setup real-time validation for an input field with debouncing
   * @param {HTMLElement} inputElement - The input element to validate
   * @param {string} fieldName - Field name for validation pattern
   * @param {boolean} isRequired - Whether field is required
   * @param {function} onValidationChange - Callback when validation state changes
   * @param {number} debounceMs - Debounce delay in milliseconds (default: 300ms)
   */
  setupFieldValidation: function(inputElement, fieldName, isRequired = true, onValidationChange = null, debounceMs = 300) {
    if (!inputElement) return;

    inputElement.addEventListener('input', (e) => {
      // Clear existing timeout
      if (this.debounceTimers[fieldName]) {
        clearTimeout(this.debounceTimers[fieldName]);
      }

      // Set new timeout
      this.debounceTimers[fieldName] = setTimeout(() => {
        const result = this.validateField(fieldName, e.target.value, isRequired);
        this.displayFieldError(inputElement, result);

        // Call callback if provided
        if (onValidationChange) {
          onValidationChange(result.isValid, result.message);
        }
      }, debounceMs);

      // Clear error immediately on input (better UX)
      inputElement.classList.remove('is-invalid');
      const errorDisplay = inputElement.parentElement.querySelector('.invalid-feedback');
      if (errorDisplay) {
        errorDisplay.textContent = '';
      }
    });

    // Validate on blur (without debounce)
    inputElement.addEventListener('blur', (e) => {
      const result = this.validateField(fieldName, e.target.value, isRequired);
      this.displayFieldError(inputElement, result);

      if (onValidationChange) {
        onValidationChange(result.isValid, result.message);
      }
    });
  },

  /**
   * Display validation error for a field
   * @param {HTMLElement} inputElement - The input element
   * @param {object} result - Validation result {isValid: boolean, message: string}
   */
  displayFieldError: function(inputElement, result) {
    if (result.isValid) {
      inputElement.classList.remove('is-invalid');
      const errorDisplay = inputElement.parentElement.querySelector('.invalid-feedback');
      if (errorDisplay) {
        errorDisplay.textContent = '';
      }
    } else {
      inputElement.classList.add('is-invalid');
      
      // Create or update error message display
      let errorDisplay = inputElement.parentElement.querySelector('.invalid-feedback');
      if (!errorDisplay) {
        errorDisplay = document.createElement('small');
        errorDisplay.className = 'invalid-feedback d-block mt-1';
        inputElement.parentElement.appendChild(errorDisplay);
      }
      errorDisplay.textContent = result.message;
    }
  },

  /**
   * Validate entire form
   * @param {HTMLFormElement} formElement - The form to validate
   * @param {object} fieldConfigs - Field configurations {fieldName: {isRequired: boolean}}
   * @returns {object} {isValid: boolean, errors: {fieldName: message}}
   */
  validateForm: function(formElement, fieldConfigs = {}) {
    if (!formElement) {
      return { isValid: false, errors: {} };
    }

    const errors = {};
    let isValid = true;

    // Get all input elements
    const inputs = formElement.querySelectorAll('input, select, textarea');

    inputs.forEach(input => {
      const fieldName = input.name || input.id;
      const isRequired = fieldConfigs[fieldName]?.isRequired || input.hasAttribute('required');
      
      const result = this.validateField(fieldName, input.value, isRequired);
      
      if (!result.isValid) {
        isValid = false;
        errors[fieldName] = result.message;
        this.displayFieldError(input, result);
      } else {
        this.displayFieldError(input, { isValid: true, message: '' });
      }
    });

    return {
      isValid: isValid,
      errors: errors
    };
  },

  /**
   * Clear all validation errors from a form
   * @param {HTMLFormElement} formElement - The form to clear errors from
   */
  clearFormErrors: function(formElement) {
    if (!formElement) return;

    const inputs = formElement.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      input.classList.remove('is-invalid');
      const errorDisplay = input.parentElement.querySelector('.invalid-feedback');
      if (errorDisplay) {
        errorDisplay.textContent = '';
      }
    });
  },

  /**
   * Validate file upload
   * @param {File} file - The file to validate
   * @param {object} options - Validation options
   *   - maxSize: Maximum file size in bytes (default: 5MB)
   *   - allowedMimes: Array of allowed MIME types (default: image formats)
   * @returns {object} {isValid: boolean, message: string}
   */
  validateFile: function(file, options = {}) {
    const maxSize = options.maxSize || 5 * 1024 * 1024; // 5MB default
    const allowedMimes = options.allowedMimes || ['image/jpeg', 'image/png', 'image/webp'];

    if (!file) {
      return {
        isValid: false,
        message: 'No file selected'
      };
    }

    // Check MIME type
    if (!allowedMimes.includes(file.type)) {
      return {
        isValid: false,
        message: `Only ${allowedMimes.map(m => m.split('/')[1].toUpperCase()).join(', ')} images are allowed`
      };
    }

    // Check file size
    if (file.size > maxSize) {
      const maxSizeMb = (maxSize / (1024 * 1024)).toFixed(1);
      return {
        isValid: false,
        message: `File size must not exceed ${maxSizeMb}MB`
      };
    }

    return {
      isValid: true,
      message: ''
    };
  },

  /**
   * Get form data as object
   * @param {HTMLFormElement} formElement - The form element
   * @returns {object} Form data object
   */
  getFormData: function(formElement) {
    const formData = new FormData(formElement);
    const data = {};

    formData.forEach((value, key) => {
      if (data[key]) {
        // Handle arrays
        if (!Array.isArray(data[key])) {
          data[key] = [data[key]];
        }
        data[key].push(value);
      } else {
        data[key] = value;
      }
    });

    return data;
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Validation;
}
