/**
 * Category Service
 * Handles all category-related API calls and data operations
 */

class CategoryService {
  constructor() {
    this.baseUrl = `${API_CONFIG.getBaseUrl()}/categories`;
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
   * Render category dropdown menu with dynamic categories
   * @param {string} containerId - ID of the container to render into
   * @param {string} baseUrl - Base URL for category links (e.g., 'shop.html?category=')
   * @param {number} refreshInterval - Optional auto-refresh interval in milliseconds
   */
  async renderCategoryDropdown(containerId, baseUrl = 'shop.html?category=', refreshInterval = null) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container ${containerId} not found`);
      return;
    }

    const renderCategories = async () => {
      try {
        const categories = await this.getCategories(true);
        
        container.innerHTML = categories.map(category => {
          const slug = category.name.toLowerCase().replace(/\s+/g, '-');
          return `<li><a class="dropdown-item" href="${baseUrl}${slug}">${category.name}</a></li>`;
        }).join('');
        
        console.log(`✅ Rendered ${categories.length} categories in ${containerId}`);
      } catch (error) {
        console.error(`❌ Error rendering categories in ${containerId}:`, error);
        container.innerHTML = '<li><a class="dropdown-item text-muted" href="#">Loading categories...</a></li>';
      }
    };

    // Initial render
    await renderCategories();

    // Auto-refresh if interval provided
    if (refreshInterval) {
      setInterval(renderCategories, refreshInterval);
      console.log(`🔄 Category auto-refresh enabled every ${refreshInterval}ms for ${containerId}`);
    }
  }

  /**
   * Render category filter checkboxes
   * @param {string} containerId - ID of the container to render into
   * @param {function} onCategoryChange - Callback when category selection changes
   */
  async renderCategoryFilters(containerId, onCategoryChange = null) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container ${containerId} not found`);
      return;
    }

    try {
      const categories = await this.getCategories(true);
      
      container.innerHTML = categories.map(category => {
        const slug = category.name.toLowerCase().replace(/\s+/g, '-');
        const sanitizedName = category.name.replace(/[^a-z0-9]/gi, '').slice(0, 20);
        const id = `cat${sanitizedName}`;
        
        return `
          <div class="form-check mb-2">
            <input class="form-check-input category-filter" type="checkbox" value="${slug}" id="${id}" name="category">
            <label class="form-check-label" for="${id}" style="font-size: 0.9375rem; color: var(--gray-600);">${category.name}</label>
          </div>
        `;
      }).join('');

      // Add change listeners
      const checkboxes = container.querySelectorAll('.category-filter');
      checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', onCategoryChange);
      });

      console.log(`✅ Rendered ${categories.length} category filters in ${containerId}`);
    } catch (error) {
      console.error(`❌ Error rendering category filters in ${containerId}:`, error);
      container.innerHTML = '<p class="text-muted small">Unable to load categories</p>';
    }
  }

  /**
   * Render footer category links
   * @param {string} containerId - ID of the container to render into
   * @param {string} baseUrl - Base URL for category links (e.g., 'shop.html?category=')
   */
  async renderFooterCategories(containerId, baseUrl = 'shop.html?category=') {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container ${containerId} not found`);
      return;
    }

    try {
      const categories = await this.getCategories(true);
      
      container.innerHTML = categories.map(category => {
        const slug = category.name.toLowerCase().replace(/\s+/g, '-');
        return `<li class="mb-2"><a href="${baseUrl}${slug}" class="text-white-50 text-decoration-none" style="font-size: 0.9rem;">${category.name}</a></li>`;
      }).join('');

      console.log(`✅ Rendered ${categories.length} footer category links in ${containerId}`);
    } catch (error) {
      console.error(`❌ Error rendering footer categories in ${containerId}:`, error);
    }
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
