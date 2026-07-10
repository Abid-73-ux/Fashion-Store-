/**
 * Product Service
 * Handles all product-related API calls and data operations
 */

class ProductService {
  constructor() {
    this.baseUrl = 'http://127.0.0.1:5000/api/products';
    this.placeholderImage = '/assets/images/placeholder.jpg';
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get all products with filters
   */
  async getProducts(options = {}) {
    try {
      const {
        category = null,
        search = null,
        sortBy = 'latest',
        page = 1,
        limit = 12,
        minPrice = null,
        maxPrice = null,
        featured = false,
        newArrival = false,
        onSale = false
      } = options;

      // Build query string
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (search) params.append('search', search);
      params.append('sortBy', sortBy);
      params.append('page', page);
      params.append('limit', limit);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (featured) params.append('featured', 'true');
      if (newArrival) params.append('newArrival', 'true');
      if (onSale) params.append('onSale', 'true');

      const url = `${this.baseUrl}?${params.toString()}`;
      const cacheKey = url;

      // Check cache
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.time < this.cacheExpiry) {
          console.log('📦 Using cached products');
          return cached.data;
        }
      }

      console.log('🔗 Fetching from:', url);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        mode: 'cors',
        credentials: 'omit'
      });

      console.log('📊 Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📦 Received data:', data.pagination.total, 'products');
      
      // Cache the data
      this.cache.set(cacheKey, { data, time: Date.now() });

      return data;
    } catch (error) {
      console.error('❌ Get products error:', error.message);
      throw error;
    }
  }

  /**
   * Get single product by ID
   */
  async getProductById(id) {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`);
      if (!response.ok) throw new Error('Product not found');
      
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('❌ Get product error:', error);
      throw error;
    }
  }

  /**
   * Get featured products
   */
  async getFeaturedProducts(limit = 8) {
    try {
      const response = await fetch(`${this.baseUrl}/featured?limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch featured products');
      
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('❌ Get featured products error:', error);
      return [];
    }
  }

  /**
   * Get new arrivals
   */
  async getNewArrivals(limit = 8) {
    try {
      const response = await fetch(`${this.baseUrl}/new-arrivals?limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch new arrivals');
      
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('❌ Get new arrivals error:', error);
      return [];
    }
  }

  /**
   * Get best sellers
   */
  async getBestSellers(limit = 8) {
    try {
      const response = await fetch(`${this.baseUrl}/best-sellers?limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch best sellers');
      
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('❌ Get best sellers error:', error);
      return [];
    }
  }

  /**
   * Get sale products
   */
  async getSaleProducts(limit = 8) {
    try {
      const response = await fetch(`${this.baseUrl}/sale?limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch sale products');
      
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('❌ Get sale products error:', error);
      return [];
    }
  }

  /**
   * Get image URL with fallback
   */
  getImageUrl(product) {
    if (product && product.image) {
      return product.image;
    }
    return this.placeholderImage;
  }

  /**
   * Get discount percentage
   */
  getDiscountPercent(product) {
    if (product.salePrice && product.price > product.salePrice) {
      return Math.round(((product.price - product.salePrice) / product.price) * 100);
    }
    return 0;
  }

  /**
   * Format product for display
   */
  formatProduct(product) {
    return {
      ...product,
      imageUrl: this.getImageUrl(product),
      discountPercent: this.getDiscountPercent(product),
      displayPrice: product.salePrice || product.price,
      originalPrice: product.price,
      inStock: product.stock > 0
    };
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }
}

// Export singleton instance
const productService = new ProductService();
