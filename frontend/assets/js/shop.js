/**
 * Shop Page JavaScript
 * Handles dynamic product loading with filters, sorting, and pagination
 */

// Verify productService is loaded
if (typeof productService === 'undefined') {
    console.error('❌ productService is not defined! Check script loading order.');
}

let currentPage = 1;
let currentFilters = {
    category: null,
    search: null,
    sortBy: 'latest',
    minPrice: null,
    maxPrice: null,
    limit: 12
};

// Load products on page load
document.addEventListener('DOMContentLoaded', async () => {
    // Get URL parameters
    const params = new URLSearchParams(window.location.search);
    
    if (params.has('category')) {
        currentFilters.category = params.get('category');
    }
    
    if (params.has('search')) {
        currentFilters.search = params.get('search');
    }
    
    // Load initial products
    await loadProducts();
    
    // Set up event listeners
    setupEventListeners();
    
    // Update navbar
    Navigation.updateNavbar();
});

// Load products from API
async function loadProducts(page = 1) {
    const container = document.getElementById('productsGrid');
    
    try {
        // Show loading state
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="spinner"></div>
                <p class="text-muted mt-3">Loading products...</p>
            </div>
        `;
        
        // Fetch products
        const options = {
            page,
            limit: currentFilters.limit,
            sortBy: currentFilters.sortBy,
            category: currentFilters.category,
            search: currentFilters.search,
            minPrice: currentFilters.minPrice,
            maxPrice: currentFilters.maxPrice
        };
        
        console.log('📦 Calling productService.getProducts with options:', options);
        const response = await productService.getProducts(options);
        console.log('📦 Response received:', response);
        
        if (!response || !response.data || response.data.length === 0) {
            console.warn('⚠️ No products in response:', { hasResponse: !!response, hasData: !!response?.data, dataLength: response?.data?.length });
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <p class="text-muted">No products found. Try adjusting your filters.</p>
                </div>
            `;
            updateProductCount(0);
            return;
        }
        
        // Update product count
        updateProductCount(response.pagination.total);
        
        // Render products
        container.innerHTML = response.data.map(product => createProductCard(product)).join('');
        
        // Setup pagination
        setupPagination(response.pagination);
        
        // Attach event listeners to product cards
        attachProductCardListeners();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
    } catch (error) {
        console.error('❌ Error loading products:', error);
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <p class="text-danger">Failed to load products. Error: ${error.message}</p>
            </div>
        `;
    }
}

// Create product card HTML
function createProductCard(product) {
    const imageUrl = product.imageUrl || product.image || '/assets/images/placeholder.jpg';
    const discountPercent = productService.getDiscountPercent(product);
    const displayPrice = product.salePrice || product.price;
    const inStock = product.stock > 0;
    
    return `
        <div class="col-md-6 col-lg-4">
            <div class="product-card" style="border: 1px solid var(--gray-200); border-radius: 8px; overflow: hidden; transition: all 0.3s; cursor: pointer; height: 100%;">
                <!-- Product Image -->
                <div class="product-image-container position-relative overflow-hidden" style="height: 300px; background: var(--gray-100);">
                    <img src="${imageUrl}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s;" class="product-image">
                    
                    <!-- Discount Badge -->
                    ${discountPercent > 0 ? `
                        <div class="position-absolute top-3 start-3" style="background: var(--secondary-color); color: white; padding: 0.5rem 0.75rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">
                            -${discountPercent}%
                        </div>
                    ` : ''}
                    
                    <!-- Quick View & Wishlist -->
                    <div class="position-absolute bottom-0 start-0 w-100 p-2" style="background: rgba(0,0,0,0.7); transform: translateY(100%); transition: transform 0.3s;">
                        <div class="d-flex gap-2">
                            <button class="btn btn-sm flex-grow-1 quick-view-btn" data-product-id="${product.id}" style="background: var(--primary-color); color: white; border: none;">
                                Quick View
                            </button>
                            <button class="btn btn-sm wishlist-btn" data-product-id="${product.id}" style="background: transparent; color: white; border: 1px solid white;">
                                <i class="bi bi-heart"></i>
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Product Info -->
                <div class="p-3">
                    <h5 class="mb-2" style="font-size: 1rem; font-weight: 600; line-height: 1.3;">
                        <a href="product.html?id=${product.id}" class="text-dark text-decoration-none">
                            ${product.name}
                        </a>
                    </h5>
                    
                    <!-- Category -->
                    <p class="text-muted mb-2" style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em;">
                        ${product.category}
                    </p>
                    
                    <!-- Price -->
                    <div class="mb-2">
                        ${product.salePrice ? `
                            <span class="text-muted" style="font-size: 0.875rem; text-decoration: line-through;">
                                PKR ${parseFloat(product.price).toFixed(0)}
                            </span>
                            <span class="ms-2 fw-bold" style="color: var(--secondary-color);">
                                PKR ${parseFloat(displayPrice).toFixed(0)}
                            </span>
                        ` : `
                            <span class="fw-bold">
                                PKR ${parseFloat(product.price).toFixed(0)}
                            </span>
                        `}
                    </div>
                    
                    <!-- Rating -->
                    <div class="mb-2">
                        <div class="stars" style="color: var(--secondary-color); font-size: 0.875rem;">
                            ${generateStars(product.rating || 0)}
                        </div>
                    </div>
                    
                    <!-- Stock Status -->
                    <div class="mb-3">
                        ${inStock ? `
                            <span class="badge bg-success" style="font-size: 0.75rem;">In Stock</span>
                        ` : `
                            <span class="badge bg-danger" style="font-size: 0.75rem;">Out of Stock</span>
                        `}
                    </div>
                    
                    <!-- Add to Cart -->
                    <button class="btn w-100 add-to-cart-btn" data-product-id="${product.id}" ${!inStock ? 'disabled' : ''} style="background: var(--primary-color); color: white; border: none; padding: 0.75rem; font-size: 0.875rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">
                        ${inStock ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Generate star rating
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let stars = '';
    
    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            stars += '<i class="bi bi-star-fill"></i>';
        } else if (i === fullStars && hasHalfStar) {
            stars += '<i class="bi bi-star-half"></i>';
        } else {
            stars += '<i class="bi bi-star"></i>';
        }
    }
    
    return stars;
}

// Setup pagination
function setupPagination(pagination) {
    const paginationContainer = document.getElementById('pagination');
    const { page, pages } = pagination;
    
    paginationContainer.innerHTML = '';
    
    if (pages <= 1) return;
    
    // Previous button
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${page === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = `
        <a class="page-link" href="#" onclick="loadProducts(${page - 1}); return false;">
            Previous
        </a>
    `;
    paginationContainer.appendChild(prevLi);
    
    // Page numbers
    for (let i = 1; i <= pages; i++) {
        if (i === page || (i >= page - 2 && i <= page + 2) || i === 1 || i === pages) {
            const li = document.createElement('li');
            li.className = `page-item ${i === page ? 'active' : ''}`;
            li.innerHTML = `
                <a class="page-link" href="#" onclick="loadProducts(${i}); return false;">
                    ${i}
                </a>
            `;
            paginationContainer.appendChild(li);
        }
    }
    
    // Next button
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${page === pages ? 'disabled' : ''}`;
    nextLi.innerHTML = `
        <a class="page-link" href="#" onclick="loadProducts(${page + 1}); return false;">
            Next
        </a>
    `;
    paginationContainer.appendChild(nextLi);
}

// Update product count display
function updateProductCount(count) {
    const countElement = document.getElementById('productCount');
    if (countElement) {
        countElement.textContent = count;
    }
}

// Setup event listeners
function setupEventListeners() {
    // Sort dropdown
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentFilters.sortBy = e.target.value || 'latest';
            loadProducts(1);
        });
    }
    
    // Apply filters button
    const applyFiltersBtn = document.getElementById('applyFilters');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', applyFilters);
    }
    
    // Clear filters button
    const clearFiltersBtn = document.getElementById('clearFilters');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            console.log('🧹 Clearing all filters...');
            // Clear price inputs
            const minPriceInput = document.getElementById('minPrice');
            const maxPriceInput = document.getElementById('maxPrice');
            if (minPriceInput) minPriceInput.value = '';
            if (maxPriceInput) maxPriceInput.value = '';
            
            // Uncheck all size checkboxes
            document.querySelectorAll('input[name="size"]').forEach(cb => cb.checked = false);
            
            // Uncheck all color checkboxes
            document.querySelectorAll('input[name="color"]').forEach(cb => cb.checked = false);
            
            // Uncheck all category checkboxes
            document.querySelectorAll('input[name="category"]').forEach(cb => cb.checked = false);
            
            // Reset filters
            currentFilters = {
                category: null,
                search: null,
                sortBy: 'latest',
                minPrice: null,
                maxPrice: null,
                limit: 12
            };
            
            // Reload products
            loadProducts(1);
        });
    }
    
    // Search form
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const searchInput = document.getElementById('searchInput');
            if (searchInput && searchInput.value.trim()) {
                currentFilters.search = searchInput.value.trim();
                loadProducts(1);
            }
        });
    }
    
    // Size filter checkboxes
    const sizeCheckboxes = document.querySelectorAll('input[name="size"]');
    sizeCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            console.log('📌 Size filter changed');
        });
    });
    
    // Color filter checkboxes
    const colorCheckboxes = document.querySelectorAll('input[name="color"]');
    colorCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            console.log('🎨 Color filter changed');
        });
    });
    
    // Price range inputs
    const minPriceInput = document.getElementById('minPrice');
    const maxPriceInput = document.getElementById('maxPrice');
    
    if (minPriceInput && maxPriceInput) {
        minPriceInput.addEventListener('change', () => {
            console.log('💰 Min price changed');
        });
        maxPriceInput.addEventListener('change', () => {
            console.log('💰 Max price changed');
        });
    }
}

// Apply filters
function applyFilters() {
    console.log('🔍 Applying filters...');
    
    // Get price range by ID (as defined in HTML)
    const minPriceInput = document.getElementById('minPrice');
    const maxPriceInput = document.getElementById('maxPrice');
    
    if (minPriceInput && minPriceInput.value) {
        currentFilters.minPrice = parseInt(minPriceInput.value);
        console.log('💰 Min price:', currentFilters.minPrice);
    } else {
        currentFilters.minPrice = null;
    }
    
    if (maxPriceInput && maxPriceInput.value) {
        currentFilters.maxPrice = parseInt(maxPriceInput.value);
        console.log('💰 Max price:', currentFilters.maxPrice);
    } else {
        currentFilters.maxPrice = null;
    }
    
    console.log('💰 Price range:', currentFilters.minPrice, '-', currentFilters.maxPrice);
    
    // Get selected sizes
    const selectedSizes = Array.from(document.querySelectorAll('input[name="size"]:checked'))
        .map(cb => cb.value);
    if (selectedSizes.length > 0) {
        currentFilters.size = selectedSizes;
        console.log('📌 Selected sizes:', selectedSizes);
    } else {
        currentFilters.size = null;
    }
    
    // Get selected colors
    const selectedColors = Array.from(document.querySelectorAll('input[name="color"]:checked'))
        .map(cb => cb.value);
    if (selectedColors.length > 0) {
        currentFilters.color = selectedColors;
        console.log('🎨 Selected colors:', selectedColors);
    } else {
        currentFilters.color = null;
    }
    
    console.log('✅ Final filters:', currentFilters);
    
    // Reset to page 1 when filters change
    loadProducts(1);
}

// Attach event listeners to product cards
function attachProductCardListeners() {
    // Quick View buttons - DISABLED
    document.querySelectorAll('.quick-view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            Toast.info('Quick View feature disabled - use Add to Cart instead');
        });
    });
    
    // Wishlist buttons
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const productId = btn.dataset.productId;
            toggleWishlist(productId, btn);
        });
    });
    
    // Add to cart buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const productId = btn.dataset.productId;
            addToCart(productId);
        });
    });
    
    // Hover effect for product images
    document.querySelectorAll('.product-image-container').forEach(container => {
        const image = container.querySelector('.product-image');
        const quickViewDiv = container.querySelector('div:last-child');
        
        container.addEventListener('mouseenter', () => {
            if (image) image.style.transform = 'scale(1.05)';
            if (quickViewDiv) quickViewDiv.style.transform = 'translateY(0)';
        });
        
        container.addEventListener('mouseleave', () => {
            if (image) image.style.transform = 'scale(1)';
            if (quickViewDiv) quickViewDiv.style.transform = 'translateY(100%)';
        });
    });
}

// Open quick view modal
// Quick View disabled - too many issues
// Use Add to Cart instead

// Add to cart
function addToCart(productId, quantity = 1, size = null) {
    try {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingItem = cart.find(item => item.productId == productId && item.size === (size || 'One Size'));
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                productId,
                quantity,
                size: size || 'One Size',
                addedAt: new Date().toISOString()
            });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        Toast.success(`Product added to cart! (${quantity} item${quantity > 1 ? 's' : ''})`);
    } catch (error) {
        console.error('Error adding to cart:', error);
        Toast.error('Failed to add to cart');
    }
}

// Toggle wishlist
function toggleWishlist(productId, btn) {
    try {
        let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        const index = wishlist.findIndex(item => item == productId);
        
        if (index > -1) {
            wishlist.splice(index, 1);
            btn.classList.remove('active');
            Toast.info('Removed from wishlist');
        } else {
            wishlist.push(productId);
            btn.classList.add('active');
            Toast.success('Added to wishlist');
        }
        
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        updateWishlistCount();
    } catch (error) {
        console.error('Error toggling wishlist:', error);
        Toast.error('Failed to update wishlist');
    }
}

// Update cart count badge
function updateCartCount() {
    try {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        const badge = document.getElementById('cartCount');
        if (badge) {
            badge.textContent = count;
        }
    } catch (error) {
        console.error('Error updating cart count:', error);
    }
}

// Update wishlist count badge
function updateWishlistCount() {
    try {
        const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        const badge = document.getElementById('wishlistCount');
        if (badge) {
            badge.classList.toggle('d-none', wishlist.length === 0);
            badge.textContent = wishlist.length;
        }
    } catch (error) {
        console.error('Error updating wishlist count:', error);
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    updateWishlistCount();
});
