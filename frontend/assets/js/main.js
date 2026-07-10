/**
 * Main JavaScript - Global utilities, constants, and helpers
 */

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Global State
const AppState = {
  user: null,
  cart: [],
  wishlist: [],
  isAuthenticated: false
};

// API Helper Functions
const API = {
  /**
   * Make an API request
   * @param {string} endpoint - API endpoint
   * @param {object} options - Fetch options
   * @returns {Promise<object>} Response data
   */
  async request(endpoint, options = {}) {
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      credentials: 'include' // Include cookies for JWT
    };

    const config = { ...defaultOptions, ...options };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Convenience methods
  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },

  post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },

  put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  },

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
};

// Toast Notification System
const Toast = {
  container: null,

  init() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toastContainer';
      this.container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        max-width: 350px;
      `;
      document.body.appendChild(this.container);
    }
  },

  show(message, type = 'info', duration = 3000) {
    this.init();

    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0 show`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    `;

    this.container.appendChild(toast);

    // Auto remove after duration
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, duration);

    // Close button handler
    toast.querySelector('.btn-close').addEventListener('click', () => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    });
  },

  success(message, duration) {
    this.show(message, 'success', duration);
  },

  error(message, duration) {
    this.show(message, 'danger', duration);
  },

  warning(message, duration) {
    this.show(message, 'warning', duration);
  },

  info(message, duration) {
    this.show(message, 'info', duration);
  }
};

// Loading Overlay
const Loading = {
  overlay: null,

  show() {
    if (!this.overlay) {
      this.overlay = document.createElement('div');
      this.overlay.className = 'loading-overlay';
      this.overlay.innerHTML = '<div class="spinner"></div>';
    }
    document.body.appendChild(this.overlay);
  },

  hide() {
    if (this.overlay && this.overlay.parentElement) {
      this.overlay.remove();
    }
  }
};

// Local Storage Helper
const Storage = {
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Storage set error:', error);
      return false;
    }
  },

  get(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Storage remove error:', error);
      return false;
    }
  },

  clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Storage clear error:', error);
      return false;
    }
  }
};

// Format Currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

// Format Date
function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date));
}

// Debounce Function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle Function
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Get URL Parameters
function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const result = {};
  for (const [key, value] of params) {
    result[key] = value;
  }
  return result;
}

// Update URL Parameter
function updateUrlParam(key, value) {
  const url = new URL(window.location);
  if (value) {
    url.searchParams.set(key, value);
  } else {
    url.searchParams.delete(key);
  }
  window.history.pushState({}, '', url);
}

// Validate Email
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Validate Phone
function isValidPhone(phone) {
  const re = /^\+?[\d\s-()]+$/;
  return re.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

// Generate Star Rating HTML
function generateStars(rating, maxStars = 5) {
  let html = '<div class="stars">';
  for (let i = 1; i <= maxStars; i++) {
    if (i <= Math.floor(rating)) {
      html += '<i class="bi bi-star-fill"></i>';
    } else if (i === Math.ceil(rating) && rating % 1 !== 0) {
      html += '<i class="bi bi-star-half"></i>';
    } else {
      html += '<i class="bi bi-star"></i>';
    }
  }
  html += '</div>';
  return html;
}

// Create Product Card HTML
function createProductCard(product) {
  const discountPercent = product.sale_price 
    ? Math.round(((product.price - product.sale_price) / product.price) * 100)
    : 0;

  return `
    <div class="col">
      <div class="card product-card h-100">
        <div class="product-card-image">
          <a href="product.html?id=${product.id}">
            <img src="${product.image_url || '/assets/images/placeholder.jpg'}" alt="${product.name}" loading="lazy">
          </a>
          ${discountPercent > 0 ? `<span class="product-card-badge">-${discountPercent}%</span>` : ''}
          ${product.is_new ? '<span class="product-card-badge" style="left: auto; right: var(--spacing-sm);">New</span>' : ''}
          <button class="product-card-wishlist" data-product-id="${product.id}" title="Add to wishlist">
            <i class="bi bi-heart"></i>
          </button>
        </div>
        <div class="product-card-info">
          <h5 class="product-card-title">
            <a href="product.html?id=${product.id}" class="text-decoration-none text-dark">${product.name}</a>
          </h5>
          <div class="product-card-price">
            <span class="product-price-current">${formatCurrency(product.sale_price || product.price)}</span>
            ${product.sale_price ? `<span class="product-price-original">${formatCurrency(product.price)}</span>` : ''}
          </div>
          ${product.rating ? `
            <div class="product-card-rating">
              ${generateStars(product.rating)}
              <span class="rating-count">(${product.review_count || 0})</span>
            </div>
          ` : ''}
          <div class="product-card-actions">
            <button class="btn btn-primary btn-sm w-100" onclick="addToCart(${product.id})">
              <i class="bi bi-bag me-1"></i> Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Add to Cart Function
async function addToCart(productId, quantity = 1, sizeId = null, colorId = null) {
  try {
    // Check if user is authenticated
    if (!AppState.isAuthenticated) {
      // Add to localStorage for guest users
      const guestCart = Storage.get('guestCart') || [];
      guestCart.push({ productId, quantity, sizeId, colorId });
      Storage.set('guestCart', guestCart);
      updateCartCount();
      Toast.success('Product added to cart!');
      return;
    }

    // For authenticated users, call API
    Loading.show();
    const response = await API.post('/cart/items', {
      product_id: productId,
      quantity,
      size_id: sizeId,
      color_id: colorId
    });

    if (response.success) {
      updateCartCount();
      Toast.success('Product added to cart!');
    }
  } catch (error) {
    console.error('Add to cart error:', error);
    Toast.error(error.message || 'Failed to add product to cart');
  } finally {
    Loading.hide();
  }
}

// Update Cart Count
async function updateCartCount() {
  try {
    let count = 0;

    if (AppState.isAuthenticated) {
      const response = await API.get('/cart');
      count = response.data?.items?.length || 0;
    } else {
      const guestCart = Storage.get('guestCart') || [];
      count = guestCart.length;
    }

    const cartBadge = document.getElementById('cartCount');
    if (cartBadge) {
      cartBadge.textContent = count;
      cartBadge.classList.toggle('d-none', count === 0);
    }
  } catch (error) {
    console.error('Update cart count error:', error);
  }
}

// Update Wishlist Count
async function updateWishlistCount() {
  try {
    if (!AppState.isAuthenticated) {
      return;
    }

    const response = await API.get('/wishlist');
    const count = response.data?.length || 0;

    const wishlistBadge = document.getElementById('wishlistCount');
    if (wishlistBadge) {
      wishlistBadge.textContent = count;
      wishlistBadge.classList.toggle('d-none', count === 0);
    }
  } catch (error) {
    console.error('Update wishlist count error:', error);
  }
}

// Load Featured Products
async function loadFeaturedProducts() {
  try {
    const response = await API.get('/products?featured=true&limit=8');
    const container = document.getElementById('featuredProducts');
    
    if (!container) return;

    if (response.success && response.data?.length > 0) {
      container.innerHTML = response.data.map(product => createProductCard(product)).join('');
      attachWishlistHandlers();
    } else {
      container.innerHTML = '<div class="col-12"><p class="text-center text-muted">No featured products available</p></div>';
    }
  } catch (error) {
    console.error('Load featured products error:', error);
    const container = document.getElementById('featuredProducts');
    if (container) {
      container.innerHTML = '<div class="col-12"><p class="text-center text-danger">Failed to load products</p></div>';
    }
  }
}

// Load New Arrivals
async function loadNewArrivals() {
  try {
    const response = await API.get('/products?sort=newest&limit=4');
    const container = document.getElementById('newArrivals');
    
    if (!container) return;

    if (response.success && response.data?.length > 0) {
      container.innerHTML = response.data.map(product => createProductCard(product)).join('');
      attachWishlistHandlers();
    }
  } catch (error) {
    console.error('Load new arrivals error:', error);
  }
}

// Attach Wishlist Button Handlers
function attachWishlistHandlers() {
  document.querySelectorAll('.product-card-wishlist').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (!AppState.isAuthenticated) {
        Toast.warning('Please login to add items to wishlist');
        setTimeout(() => window.location.href = 'login.html', 1500);
        return;
      }

      const productId = btn.dataset.productId;
      const isActive = btn.classList.contains('active');

      try {
        if (isActive) {
          await API.delete(`/wishlist/${productId}`);
          btn.classList.remove('active');
          btn.querySelector('i').className = 'bi bi-heart';
          Toast.info('Removed from wishlist');
        } else {
          await API.post('/wishlist', { product_id: productId });
          btn.classList.add('active');
          btn.querySelector('i').className = 'bi bi-heart-fill';
          Toast.success('Added to wishlist!');
        }
        updateWishlistCount();
      } catch (error) {
        console.error('Wishlist error:', error);
        Toast.error('Failed to update wishlist');
      }
    });
  });
}

// Initialize on DOM Load
document.addEventListener('DOMContentLoaded', () => {
  // Update counts
  updateCartCount();
  updateWishlistCount();

  // Newsletter form
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = newsletterForm.querySelector('input[type="email"]').value;
      
      if (!isValidEmail(email)) {
        Toast.error('Please enter a valid email address');
        return;
      }

      try {
        Loading.show();
        // API call would go here
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        Toast.success('Thank you for subscribing!');
        newsletterForm.reset();
      } catch (error) {
        Toast.error('Subscription failed. Please try again.');
      } finally {
        Loading.hide();
      }
    });
  }
});

// Export for use in other scripts
window.AppState = AppState;
window.API = API;
window.Toast = Toast;
window.Loading = Loading;
window.Storage = Storage;
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
window.debounce = debounce;
window.throttle = throttle;
window.getUrlParams = getUrlParams;
window.updateUrlParam = updateUrlParam;
window.isValidEmail = isValidEmail;
window.isValidPhone = isValidPhone;
window.generateStars = generateStars;
window.createProductCard = createProductCard;
window.addToCart = addToCart;
window.updateCartCount = updateCartCount;
window.updateWishlistCount = updateWishlistCount;
window.loadFeaturedProducts = loadFeaturedProducts;
window.loadNewArrivals = loadNewArrivals;
window.attachWishlistHandlers = attachWishlistHandlers;
