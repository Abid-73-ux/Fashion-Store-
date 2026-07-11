/**
 * API Configuration
 * Dynamically selects between local and production backend URLs
 */

const API_CONFIG = {
  // Detect environment
  isDevelopment: window.location.hostname === 'localhost' || 
                 window.location.hostname === '127.0.0.1' ||
                 window.location.hostname.includes(':5500'),
  
  // Get API base URL based on environment
  getBaseUrl: function() {
    if (this.isDevelopment) {
      // Local development
      return 'http://127.0.0.1:5000/api';
    } else {
      // Production (change this to your actual backend URL)
      // Example: https://your-backend-domain.com/api
      return 'https://takanj-backend.onrender.com/api'; // UPDATE THIS WITH YOUR BACKEND URL
    }
  },
  
  // Get full API URL for a specific endpoint
  getEndpoint: function(endpoint) {
    return `${this.getBaseUrl()}${endpoint}`;
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = API_CONFIG;
}
