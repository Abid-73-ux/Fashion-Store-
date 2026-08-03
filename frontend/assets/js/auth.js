/**
 * Authentication Module
 * Handles user authentication, token management, and role-based access
 * 
 * SECURITY NOTE: Tokens are now stored in HttpOnly cookies (backend-set only)
 * Frontend can no longer access tokens directly via JavaScript
 * Cookies are automatically sent with all requests
 */

const Auth = {
  // User roles
  ROLES: {
    GUEST: 'guest',
    CUSTOMER: 'customer',
    ADMIN: 'admin'
  },

  // Storage keys (for user data, NOT tokens)
  USER_KEY: 'user',
  ADMIN_USER_KEY: 'admin-user',

  /**
   * Check if user is logged in by calling API validation endpoint
   */
  async isLoggedIn() {
    try {
      const response = await fetch(`${API_CONFIG.getEndpoint('/auth/validate')}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'  // CRITICAL: Include cookies in request
      });
      return response.ok;
    } catch (e) {
      return false;
    }
  },

  /**
   * Check if user is admin
   */
  isAdmin() {
    try {
      const adminUserJson = localStorage.getItem(this.ADMIN_USER_KEY);
      if (!adminUserJson) {
        return false;
      }
      const user = JSON.parse(adminUserJson);
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
    } else if (localStorage.getItem(this.USER_KEY)) {
      return this.ROLES.CUSTOMER;
    } else {
      return this.ROLES.GUEST;
    }
  },

  /**
   * Set user (after login) - Store user data only, token in cookie
   * SECURITY: Token is automatically set by backend in HttpOnly cookie
   */
  setUser(user, token = null) {
    // SECURITY: Don't store token in localStorage
    // Backend sets it in HttpOnly cookie automatically
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  },

  /**
   * Set admin user (after admin login)
   */
  setAdminUser(user, token = null) {
    // SECURITY: Don't store token in localStorage
    localStorage.setItem(this.ADMIN_USER_KEY, JSON.stringify(user));
  },

  /**
   * Clear user session (logout)
   */
  logout() {
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.ADMIN_USER_KEY);
    localStorage.removeItem('cart');
    localStorage.removeItem('wishlist');
    // Token cookie cleared by backend on logout
  },

  /**
   * Clear admin session
   */
  logoutAdmin() {
    localStorage.removeItem(this.ADMIN_USER_KEY);
  },

  /**
   * Get admin authorization token (deprecated - now in HttpOnly cookie)
   * SECURITY: Token is in HttpOnly cookie, cannot be accessed via JavaScript
   */
  getAdminToken() {
    // Token is now in HttpOnly cookie, this is for backward compatibility only
    // Return null - cookies are sent automatically
    return null;
  },

  /**
   * Check if token is expired
   * SECURITY: Token validation now done server-side via cookie
   */
  isTokenExpired() {
    // Let server handle token validation
    return false;
  },

  /**
   * Validate token with backend
   * SECURITY: Token automatically sent in HttpOnly cookie
   */
  async validateToken() {
    try {
      const response = await fetch(API_CONFIG.getEndpoint('/auth/validate'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'  // CRITICAL: Send cookies
      });

      return response.ok;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  },

  /**
   * Validate admin token with backend
   * SECURITY: Token automatically sent in HttpOnly cookie
   */
  async validateAdminToken() {
    try {
      const response = await fetch(API_CONFIG.getEndpoint('/auth/validate'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'  // CRITICAL: Send cookies
      });

      if (response.ok) {
        const data = await response.json();
        return data.user?.role === 'admin';
      }
      return false;
    } catch (error) {
      console.error('Admin token validation error:', error);
      return false;
    }
  }
};
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

// Initialize on page load (with delay to ensure all scripts are loaded)
document.addEventListener('DOMContentLoaded', () => {
  // Update navbar if Navigation module is available
  // Use setTimeout to ensure all scripts have loaded
  setTimeout(() => {
    if (typeof Navigation !== 'undefined' && typeof Navigation.updateNavbar === 'function') {
      Navigation.updateNavbar();
    }
  }, 100);
});

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Auth;
}
