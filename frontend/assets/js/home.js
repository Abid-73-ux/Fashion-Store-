/**
 * Home Page JavaScript
 * Handles dynamic product loading for featured products, new arrivals, bestsellers, and sale products
 */

// Load featured products
async function loadFeaturedProducts() {
    const container = document.getElementById('featuredProducts');
    if (!container) return;

    try {
        const response = await productService.getFeaturedProducts(8);
        
        if (!response || response.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <p class="text-muted">No featured products available yet.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = response.map(product => createProductCard(product)).join('');
        
        // Attach event listeners
        attachProductCardListeners();
    } catch (error) {
        console.error('Error loading featured products:', error);
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <p class="text-danger">Failed to load products. Please refresh the page.</p>
            </div>
        `;
    }
}

// Load new arrivals
async function loadNewArrivals() {
    const container = document.getElementById('newArrivals');
    if (!container) return;

    try {
        const response = await productService.getNewArrivals(8);
        
        if (!response || response.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <p class="text-muted">No new arrivals available yet.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = response.map(product => createProductCard(product)).join('');
        
        // Attach event listeners
        attachProductCardListeners();
    } catch (error) {
        console.error('Error loading new arrivals:', error);
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <p class="text-danger">Failed to load products. Please refresh the page.</p>
            </div>
        `;
    }
}

// Load best sellers
async function loadBestSellers() {
    const container = document.getElementById('bestSellers');
    if (!container) return;

    try {
        const response = await productService.getBestSellers(8);
        
        if (!response || response.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <p class="text-muted">No bestsellers available yet.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = response.map(product => createProductCard(product)).join('');
        
        // Attach event listeners
        attachProductCardListeners();
    } catch (error) {
        console.error('Error loading bestsellers:', error);
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <p class="text-danger">Failed to load products. Please refresh the page.</p>
            </div>
        `;
    }
}

// Load sale products
async function loadSaleProducts() {
    const container = document.getElementById('saleProducts');
    if (!container) return;

    try {
        const response = await productService.getSaleProducts(8);
        
        if (!response || response.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <p class="text-muted">No sale products available yet.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = response.map(product => createProductCard(product)).join('');
        
        // Attach event listeners
        attachProductCardListeners();
    } catch (error) {
        console.error('Error loading sale products:', error);
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <p class="text-danger">Failed to load products. Please refresh the page.</p>
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
        <div class="col-md-6 col-lg-3">
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
                    
                    <!-- Price -->
                    <div class="mb-2">
                        ${product.salePrice ? `
                            <span class="text-muted" style="font-size: 0.875rem; text-decoration: line-through;">
                                PKR ${parseFloat(product.price).toFixed(2)}
                            </span>
                            <span class="ms-2 fw-bold" style="color: var(--secondary-color);">
                                PKR ${parseFloat(displayPrice).toFixed(2)}
                            </span>
                        ` : `
                            <span class="fw-bold">
                                PKR ${parseFloat(product.price).toFixed(2)}
                            </span>
                        `}
                    </div>
                    
                    <!-- Rating -->
                    <div class="mb-3">
                        <div class="d-flex align-items-center">
                            <div class="stars" style="color: var(--secondary-color); font-size: 0.875rem;">
                                ${generateStars(product.rating || 0)}
                            </div>
                            <span class="ms-2 text-muted" style="font-size: 0.75rem;">
                                (${product.reviews || 0})
                            </span>
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

// Attach event listeners to product cards
function attachProductCardListeners() {
    // Quick View buttons
    document.querySelectorAll('.quick-view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const productId = btn.dataset.productId;
            openQuickView(productId);
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
async function openQuickView(productId) {
    try {
        const product = await productService.getProductById(productId);
        const modal = document.getElementById('quickViewModal') || createQuickViewModal();
        
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header border-0">
                        <h5 class="modal-title">${product.name}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6">
                                <img src="${product.imageUrl || product.image}" alt="${product.name}" style="width: 100%; border-radius: 8px;">
                            </div>
                            <div class="col-md-6">
                                <p class="text-muted">${product.category}</p>
                                <h3 class="mb-3">${product.name}</h3>
                                
                                <div class="mb-3">
                                    <span class="h4 me-2">PKR ${parseFloat(product.displayPrice || product.price).toFixed(2)}</span>
                                    ${product.salePrice ? `
                                        <span class="text-muted text-decoration-line-through">PKR ${parseFloat(product.price).toFixed(2)}</span>
                                    ` : ''}
                                </div>
                                
                                <p class="text-muted mb-3">${product.description || 'No description available'}</p>
                                
                                <div class="mb-3">
                                    <label class="mb-2">Size:</label>
                                    <select class="form-select" id="quickViewSize">
                                        <option value="">Select size</option>
                                        <option value="XS">XS</option>
                                        <option value="S">S</option>
                                        <option value="M">M</option>
                                        <option value="L">L</option>
                                        <option value="XL">XL</option>
                                        <option value="XXL">XXL</option>
                                    </select>
                                </div>
                                
                                <div class="mb-3">
                                    <label class="mb-2">Quantity:</label>
                                    <input type="number" class="form-control" id="quickViewQty" value="1" min="1" style="max-width: 100px;">
                                </div>
                                
                                <button class="btn btn-primary w-100 mb-2" onclick="addToCartFromQuickView(${productId})">
                                    Add to Cart
                                </button>
                                <button class="btn btn-outline-secondary w-100">
                                    <i class="bi bi-heart me-2"></i>Add to Wishlist
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    } catch (error) {
        console.error('Error loading quick view:', error);
        Toast.error('Failed to load product details');
    }
}

// Create quick view modal if it doesn't exist
function createQuickViewModal() {
    const modal = document.createElement('div');
    modal.id = 'quickViewModal';
    modal.className = 'modal fade';
    modal.setAttribute('tabindex', '-1');
    document.body.appendChild(modal);
    return modal;
}

// Add to cart from quick view
function addToCartFromQuickView(productId) {
    const size = document.getElementById('quickViewSize')?.value;
    const qty = parseInt(document.getElementById('quickViewQty')?.value || 1);
    
    if (!size) {
        Toast.warning('Please select a size');
        return;
    }
    
    addToCart(productId, qty, size);
    bootstrap.Modal.getInstance(document.getElementById('quickViewModal'))?.hide();
}

// Add to cart
function addToCart(productId, quantity = 1, size = null) {
    try {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingItem = cart.find(item => item.productId === productId && item.size === size);
        
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
        const index = wishlist.findIndex(item => item === productId);
        
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

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    updateWishlistCount();
});
