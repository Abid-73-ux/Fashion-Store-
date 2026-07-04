// Form Validation Module
const Validation = {
    // Email validation
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    // Password validation (min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char)
    validatePassword(password) {
        const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return re.test(password);
    },

    // Phone validation
    validatePhone(phone) {
        const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
        return re.test(phone);
    },

    // Name validation (letters and spaces only)
    validateName(name) {
        const re = /^[a-zA-Z\s]{2,}$/;
        return re.test(name);
    },

    // Show error message
    showError(input, message) {
        const formGroup = input.closest('.mb-3, .col-md-6, .col-12');
        let errorDiv = formGroup.querySelector('.invalid-feedback');
        
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'invalid-feedback';
            input.parentNode.appendChild(errorDiv);
        }
        
        errorDiv.textContent = message;
        input.classList.add('is-invalid');
        input.classList.remove('is-valid');
    },

    // Show success
    showSuccess(input) {
        const formGroup = input.closest('.mb-3, .col-md-6, .col-12');
        const errorDiv = formGroup.querySelector('.invalid-feedback');
        
        if (errorDiv) {
            errorDiv.textContent = '';
        }
        
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
    },

    // Clear validation
    clearValidation(input) {
        input.classList.remove('is-invalid', 'is-valid');
        const formGroup = input.closest('.mb-3, .col-md-6, .col-12');
        const errorDiv = formGroup.querySelector('.invalid-feedback');
        if (errorDiv) {
            errorDiv.textContent = '';
        }
    },

    // Validate field
    validateField(input) {
        const value = input.value.trim();
        const type = input.type;
        const name = input.name || input.id;

        // Required check
        if (input.hasAttribute('required') && !value) {
            this.showError(input, 'This field is required');
            return false;
        }

        // Email validation
        if (type === 'email' && value && !this.validateEmail(value)) {
            this.showError(input, 'Please enter a valid email address');
            return false;
        }

        // Password validation
        if (type === 'password' && name.toLowerCase().includes('password') && value) {
            if (value.length < 8) {
                this.showError(input, 'Password must be at least 8 characters');
                return false;
            }
            if (!this.validatePassword(value)) {
                this.showError(input, 'Password must include uppercase, lowercase, number, and special character');
                return false;
            }
        }

        // Confirm password
        if (name === 'confirmPassword') {
            const password = document.querySelector('input[name="password"]');
            if (password && value !== password.value) {
                this.showError(input, 'Passwords do not match');
                return false;
            }
        }

        // Phone validation
        if (type === 'tel' && value && !this.validatePhone(value)) {
            this.showError(input, 'Please enter a valid phone number');
            return false;
        }

        // Name validation
        if ((name === 'firstName' || name === 'lastName') && value && !this.validateName(value)) {
            this.showError(input, 'Please enter a valid name (letters only)');
            return false;
        }

        this.showSuccess(input);
        return true;
    },

    // Validate entire form
    validateForm(form) {
        let isValid = true;
        const inputs = form.querySelectorAll('input[required], input[type="email"], input[type="password"], input[type="tel"]');
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        return isValid;
    },

    // Initialize form validation
    initForm(form) {
        const inputs = form.querySelectorAll('input');
        
        inputs.forEach(input => {
            // Real-time validation on blur
            input.addEventListener('blur', () => {
                if (input.value.trim()) {
                    this.validateField(input);
                }
            });

            // Clear validation on focus
            input.addEventListener('focus', () => {
                this.clearValidation(input);
            });

            // Real-time validation on input (for password match)
            if (input.name === 'confirmPassword') {
                input.addEventListener('input', () => {
                    if (input.value.trim()) {
                        this.validateField(input);
                    }
                });
            }
        });

        // Form submit
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (this.validateForm(form)) {
                return true;
            } else {
                const firstInvalid = form.querySelector('.is-invalid');
                if (firstInvalid) {
                    firstInvalid.focus();
                }
                return false;
            }
        });
    }
};

console.log('Validation module loaded successfully');
