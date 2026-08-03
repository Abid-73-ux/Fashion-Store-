/**
 * CSRF Service
 * Handles CSRF token management for frontend API requests
 */

const CSRFService = {
    // Store CSRF token from meta tag or cookie
    csrfToken: null,

    /**
     * Initialize CSRF token from meta tag
     */
    init() {
        // Try to get from meta tag first
        const metaTag = document.querySelector('meta[name="csrf-token"]');
        if (metaTag) {
            this.csrfToken = metaTag.content;
        }
        // If not in meta tag, it will be fetched from server when needed
    },

    /**
     * Get CSRF token from server
     * Called on first API request if no token cached
     */
    async fetchToken() {
        try {
            const response = await fetch(API_CONFIG.getEndpoint('/csrf-token'), {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                this.csrfToken = data.csrfToken;
                return this.csrfToken;
            }
        } catch (error) {
            console.warn('Failed to fetch CSRF token:', error);
        }
        return null;
    },

    /**
     * Get current CSRF token
     */
    getToken() {
        return this.csrfToken;
    },

    /**
     * Add CSRF token to request headers
     */
    addToHeaders(headers = {}) {
        if (this.csrfToken) {
            return {
                ...headers,
                'X-CSRF-Token': this.csrfToken
            };
        }
        return headers;
    },

    /**
     * Add CSRF token to form data
     */
    addToFormData(formData) {
        if (this.csrfToken) {
            formData.append('_csrf', this.csrfToken);
        }
        return formData;
    },

    /**
     * Add CSRF token to JSON body
     */
    addToJSON(data = {}) {
        if (this.csrfToken) {
            return {
                ...data,
                _csrf: this.csrfToken
            };
        }
        return data;
    }
};

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => CSRFService.init());
} else {
    CSRFService.init();
}
