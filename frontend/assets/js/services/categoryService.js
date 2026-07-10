/**
 * Category Service
 * Handles all category-related API calls and data operations
 */

class CategoryService {
  constructor() {
    this.baseUrl = 'http://127.0.0.1:5000/api/categories';
    this.cache = new Map();
    this.cacheExpiry = 10 * 60 * 1000; // 10 minutes
  }

  /**
   * Get all categories
   */
  async getCategories(active = true) {
    try {
      const cacheKey = `categories-${active}`;
      
      // Check cache
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.time < this.cacheExpiry) {
          console.log('📁 Using cached categories');
          return cached.data;
        }
      }

      const url = active ? `${this.baseUrl}?active=true` : `${this.baseUrl}?active=false`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch categories');
      
      const data = await response.json();
      
      // Cache the data
      this.cache.set(cacheKey, { data, time: Date.now() });

      return data;
    } catch (error) {
      console.error('❌ Get categories error:', error);
      throw error;
    }
  }

  /**
   * Get single category by ID
   */
  async getCategoryById(id) {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`);
      if (!response.ok) throw new Error('Category not found');
      
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('❌ Get category error:', error);
      throw error;
    }
  }

  /**
   * Get category by slug
   */
  async getCategoryBySlug(slug) {
    try {
      const response = await fetch(`${this.baseUrl}/slug/${slug}`);
      if (!response.ok) throw new Error('Category not found');
      
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('❌ Get category by slug error:', error);
      throw error;
    }
  }

  /**
   * Format category for display
   */
  formatCategory(category) {
    return {
      ...category,
      imageUrl: category.image || '/assets/images/placeholder.jpg',
      displayName: category.name,
      productCountText: category.productCount === 1 ? '1 product' : `${category.productCount} products`
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
const categoryService = new CategoryService();
