/**
 * Cart Service - Backend API Integration
 * Handles all cart operations via backend API
 */

const cartService = {
  /**
   * Get user's cart from backend
   */
  async getCart() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('⚠️ No auth token - user not logged in');
        return { success: false, message: 'Not authenticated' };
      }

      const response = await fetch(`${API_BASE_URL}/api/cart`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Cart fetched:', data);
      return data;
    } catch (error) {
      console.error('❌ Error getting cart:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Add item to cart via backend API
   */
  async addToCart(productId, quantity = 1, size = 'One Size', color = null) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('⚠️ No auth token - using localStorage fallback');
        return this.addToLocalStorage(productId, quantity, size, color);
      }

      const response = await fetch(`${API_BASE_URL}/api/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: parseInt(productId),
          quantity: parseInt(quantity),
          size,
          color
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Item added to cart:', data);
      
      // Show success toast
      if (typeof Toast !== 'undefined') {
        Toast.success(`Product added to cart! (${quantity} item${quantity > 1 ? 's' : ''})`);
      } else {
        alert(`Product added to cart! (${quantity} item${quantity > 1 ? 's' : ''})`);
      }

      // Update cart count
      if (typeof updateCartCount === 'function') {
        updateCartCount();
      }

      return data;
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      
      // Fallback to localStorage on error
      console.log('📦 Falling back to localStorage');
      return this.addToLocalStorage(productId, quantity, size, color);
    }
  },

  /**
   * Update cart item quantity
   */
  async updateCartItem(productId, quantity, size = 'One Size') {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/api/cart/update`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: parseInt(productId),
          quantity: parseInt(quantity),
          size
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Cart updated:', data);
      
      if (typeof updateCartCount === 'function') {
        updateCartCount();
      }

      return data;
    } catch (error) {
      console.error('❌ Error updating cart:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Remove item from cart
   */
  async removeFromCart(productId, size = 'One Size') {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/api/cart/remove`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: parseInt(productId),
          size
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Item removed:', data);
      
      if (typeof Toast !== 'undefined') {
        Toast.success('Item removed from cart');
      }

      if (typeof updateCartCount === 'function') {
        updateCartCount();
      }

      return data;
    } catch (error) {
      console.error('❌ Error removing from cart:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Clear entire cart
   */
  async clearCart() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/api/cart/clear`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Cart cleared:', data);

      if (typeof updateCartCount === 'function') {
        updateCartCount();
      }

      return data;
    } catch (error) {
      console.error('❌ Error clearing cart:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Fallback: Add to localStorage if backend fails
   */
  addToLocalStorage(productId, quantity, size, color) {
    try {
      let cart = JSON.parse(localStorage.getItem('cart')) || [];
      const existingItem = cart.find(item => item.productId == productId && item.size === size);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.push({
          productId,
          quantity,
          size,
          color,
          addedAt: new Date().toISOString()
        });
      }

      localStorage.setItem('cart', JSON.stringify(cart));

      if (typeof Toast !== 'undefined') {
        Toast.success(`Product added to cart! (${quantity} item${quantity > 1 ? 's' : ''})`);
      } else {
        alert(`Product added to cart! (${quantity} item${quantity > 1 ? 's' : ''})`);
      }

      if (typeof updateCartCount === 'function') {
        updateCartCount();
      }

      return { success: true, fallback: true };
    } catch (error) {
      console.error('❌ Error adding to localStorage:', error);
      return { success: false, error: error.message };
    }
  }
};

// Make cartService globally available
if (typeof window !== 'undefined') {
  window.cartService = cartService;
}
