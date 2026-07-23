/**
 * Authentication Module
 * Handles user authentication, token management, and role-based access
 */

const Auth = {
  // User roles
  ROLES: {
    GUEST: 'guest',
    CUSTOMER: 'customer',
    ADMIN: 'admin'
  },

  // Token keys
  TOKEN_KEY: 'token',
  USER_KEY: 'user',
  ADMIN_TOKEN_KEY: 'admin-token',
  ADMIN_USER_KEY: 'admin-user',

  /**
   * Check if user is logged in
   */
  isLoggedIn() {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const user = localStorage.getItem(this.USER_KEY);
    return !!(token && user);
  },

  /**
   * Check if user is admin
   */
  isAdmin() {
    const adminToken = localStorage.getItem(this.ADMIN_TOKEN_KEY);
    const adminUser = localStorage.getItem(this.ADMIN_USER_KEY);
    
    if (!adminToken || !adminUser) {
      return false;
    }

    try {
      const user = JSON.parse(adminUser);
      return user.role === 'admin';
    } catch (e) {
      return false;
    }
  },

  /**
   * Get current user
   */
  getCurrentUser() {
    try {
      const userJson = localStorage.getItem(this.USER_KEY);
      if (!userJson) {
        return {
          id: null,
          name: 'Guest',
          email: '',
          avatar: '/assets/images/default-avatar.jpg'
        };
      }
      const user = JSON.parse(userJson);
      return {
        ...user,
        avatar: user.avatar || '/assets/images/default-avatar.jpg'
      };
    } catch (e) {
      return {
        id: null,
        name: 'Guest',
        email: '',
        avatar: '/assets/images/default-avatar.jpg'
      };
    }
  },

  /**
   * Get current admin user
   */
  getCurrentAdminUser() {
    try {
      const adminUserJson = localStorage.getItem(this.ADMIN_USER_KEY);
      if (!adminUserJson) {
        return null;
      }
      return JSON.parse(adminUserJson);
    } catch (e) {
      return null;
    }
  },

  /**
   * Get current user role
   */
  getCurrentRole() {
    if (this.isAdmin()) {
      return this.ROLES.ADMIN;
    } else if (this.isLoggedIn()) {
      return this.ROLES.CUSTOMER;
    } else {
      return this.ROLES.GUEST;
    }
  },

  /**
   * Set user (after login)
   */
  setUser(user, token) {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  },

  /**
   * Set admin user (after admin login)
   */
  setAdminUser(user, token) {
    localStorage.setItem(this.ADMIN_TOKEN_KEY, token);
    localStorage.setItem(this.ADMIN_USER_KEY, JSON.stringify(user));
  },

  /**
   * Clear user session (logout)
   */
  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.ADMIN_TOKEN_KEY);
    localStorage.removeItem(this.ADMIN_USER_KEY);
    localStorage.removeItem('cart');
    localStorage.removeItem('wishlist');
  },

  /**
   * Clear admin session
   */
  logoutAdmin() {
    localStorage.removeItem(this.ADMIN_TOKEN_KEY);
    localStorage.removeItem(this.ADMIN_USER_KEY);
  },

  /**
   * Get authorization token
   */
  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  },

  /**
   * Get admin authorization token
   */
  getAdminToken() {
    return localStorage.getItem(this.ADMIN_TOKEN_KEY);
  },

  /**
   * Check if token is expired (basic check)
   */
  isTokenExpired() {
    // This is a basic check - a real implementation would decode the JWT
    // For now, we just check if token exists
    return !this.getToken();
  },

  /**
   * Validate token with backend
   */
  async validateToken() {
    try {
      const token = this.getToken();
      if (!token) {
        return false;
      }

      const response = await fetch(API_CONFIG.getEndpoint('/auth/validate'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  },

  /**
   * Validate admin token with backend
   */
  async validateAdminToken() {
    try {
      const token = this.getAdminToken();
      if (!token) {
        return false;
      }

      const response = await fetch(API_CONFIG.getEndpoint('/auth/admin/validate'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Admin token validation error:', error);
      return false;
    }
  }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  // Update navbar if Navigation module is available
  if (typeof Navigation !== 'undefined') {
    Navigation.updateNavbar();
  }
});

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Auth;
}
