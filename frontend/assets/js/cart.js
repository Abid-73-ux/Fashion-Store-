/**
 * Shopping Cart Page JavaScript
 * Handles cart display, quantity changes, and checkout flow
 * Uses dynamic store settings for tax, shipping, currency
 */

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize store settings
    await storeSettings.initialize();
    
    loadCart();
    setupEventListeners();
    updateCartBadge();
});

// Load cart from localStorage
function loadCart() {
    try {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const cartItemsContainer = document.getElementById('cartItems');
        const emptyCartDiv = document.getElementById('emptyCart');
        
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '';
            emptyCartDiv.classList.remove('d-none');
            document.getElementById('cartSummary').style.display = 'none';
            document.getElementById('continueShoppingSection').style.display = 'none';
            return;
        }
        
        emptyCartDiv.classList.add('d-none');
        document.getElementById('cartSummary').style.display = 'block';
        document.getElementById('continueShoppingSection').style.display = 'block';
        
        // Fetch product details for each item to get accurate prices
        fetchCartProductDetails(cart, cartItemsContainer);
        
    } catch (error) {
        console.error('Error loading cart:', error);
    }
}

// Fetch product details from API to get accurate prices for cart items
async function fetchCartProductDetails(cart, cartItemsContainer) {
    try {
        let subtotal = 0;
        cartItemsContainer.innerHTML = '';
        
        for (const item of cart) {
            let itemPrice = 1299; // Default fallback
            let productName = item.name || 'Product';
            let productImage = item.image || 'assets/images/placeholder.jpg';
            let productSku = item.sku || 'N/A';
            
            // Fetch product from API to get current price
            if (item.productId) {
                try {
                    const response = await fetch(`http://127.0.0.1:5000/api/products/${item.productId}`);
                    if (response.ok) {
                        const data = await response.json();
                        const product = data.data || data;
                        
                        // Use sale price if available, otherwise regular price
                        itemPrice = product.salePrice || product.price || 1299;
                        productName = product.name || item.name || 'Product';
                        productImage = product.imageUrl || product.image || item.image || 'assets/images/placeholder.jpg';
                        productSku = product.sku || item.sku || 'N/A';
                    }
                } catch (err) {
                    console.warn(`Could not fetch product ${item.productId}, using fallback`, err);
                }
            }
            
            const itemTotal = itemPrice * item.quantity;
            subtotal += itemTotal;
            
            const cartItemHTML = `
                <div class="cart-item" data-index="${cart.indexOf(item)}">
                    <div class="row g-3">
                        <div class="col-md-3 text-center">
                            <img src="${productImage}" 
                                 alt="${productName}" 
                                 class="cart-item-image"
                                 style="cursor: pointer;"
                                 onclick="window.location.href='product.html?id=${item.productId}'">
                        </div>
                        
                        <div class="col-md-4">
                            <h5 class="cart-item-title" style="cursor: pointer;" onclick="window.location.href='product.html?id=${item.productId}'">
                                ${productName}
                            </h5>
                            <div class="cart-item-details mb-3">
                                <p style="margin-bottom: 0.25rem;">Size: <strong>${item.size}</strong></p>
                                <p style="margin-bottom: 0.25rem;">SKU: <strong>${productSku}</strong></p>
                            </div>
                            
                            <div class="quantity-control">
                                <button class="quantity-btn qty-decrease" onclick="updateQuantity(${cart.indexOf(item)}, ${item.quantity - 1})">
                                    <i class="bi bi-dash"></i>
                                </button>
                                <input type="number" class="quantity-input" value="${item.quantity}" 
                                       data-index="${cart.indexOf(item)}" onchange="updateQuantityInput(${cart.indexOf(item)}, this.value)">
                                <button class="quantity-btn qty-increase" onclick="updateQuantity(${cart.indexOf(item)}, ${item.quantity + 1})">
                                    <i class="bi bi-plus"></i>
                                </button>
                            </div>
                        </div>
                        
                        <div class="col-md-3 text-end d-flex flex-column justify-content-center">
                            <div class="cart-item-price">
                                ${storeSettings.formatCurrency(itemTotal)}
                            </div>
                            <small class="text-muted">
                                ${storeSettings.formatCurrency(itemPrice)} × ${item.quantity}
                            </small>
                        </div>
                        
                        <div class="col-md-2 text-end d-flex align-items-center justify-content-end">
                            <button class="btn-remove" onclick="removeFromCart(${cart.indexOf(item)})" title="Remove item">
                                <i class="bi bi-trash3"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            cartItemsContainer.innerHTML += cartItemHTML;
        }
        
        updateCartSummary(subtotal);
        
    } catch (error) {
        console.error('Error fetching cart product details:', error);
    }
}

// Update quantity
function updateQuantity(index, newQty) {
    if (newQty < 1) {
        removeFromCart(index);
        return;
    }
    
    try {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (cart[index]) {
            cart[index].quantity = newQty;
            localStorage.setItem('cart', JSON.stringify(cart));
            loadCart();
            updateCartBadge();
        }
    } catch (error) {
        console.error('Error updating quantity:', error);
    }
}

// Update quantity from input field
function updateQuantityInput(index, newQty) {
    const qty = parseInt(newQty) || 1;
    updateQuantity(index, qty);
}

// Remove item from cart
function removeFromCart(index) {
    try {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        loadCart();
        updateCartBadge();
        Toast.success('Item removed from cart');
    } catch (error) {
        console.error('Error removing item:', error);
        Toast.error('Failed to remove item');
    }
}

// Update cart summary
function updateCartSummary(subtotal) {
    const shipping = storeSettings.calculateShipping(subtotal);
    const tax = storeSettings.calculateTax(subtotal);
    const discount = 0;
    const total = storeSettings.calculateGrandTotal(subtotal, shipping, discount);
    
    document.getElementById('subtotal').textContent = storeSettings.formatCurrency(subtotal);
    document.getElementById('shipping').textContent = shipping === 0 ? 'Free' : storeSettings.formatCurrency(shipping);
    
    // Only show tax row if tax is enabled
    const taxRow = document.getElementById('taxRow');
    if (storeSettings.isTaxEnabled()) {
        document.getElementById('tax').textContent = storeSettings.formatCurrency(tax);
        if (taxRow) taxRow.style.display = 'table-row';
    } else {
        if (taxRow) taxRow.style.display = 'none';
    }
    
    document.getElementById('total').textContent = storeSettings.formatCurrency(total);
}

// Setup event listeners
function setupEventListeners() {
    // Checkout button
    document.getElementById('checkoutBtn').addEventListener('click', () => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (cart.length === 0) {
            Toast.warning('Your cart is empty');
            return;
        }
        window.location.href = 'checkout.html';
    });
    
    // Apply coupon
    document.getElementById('applyCouponBtn').addEventListener('click', applyCoupon);
    document.getElementById('couponCode').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            applyCoupon();
        }
    });
}

// Apply coupon code
function applyCoupon() {
    const code = document.getElementById('couponCode').value.toUpperCase();
    const successMsg = document.getElementById('couponSuccess');
    const errorMsg = document.getElementById('couponError');
    
    successMsg.classList.add('d-none');
    errorMsg.classList.add('d-none');
    
    if (!code) {
        errorMsg.textContent = 'Please enter a coupon code';
        errorMsg.classList.remove('d-none');
        return;
    }
    
    // Mock coupon validation - replace with real API call
    const validCoupons = {
        'SAVE10': { discount: 0.10, label: '10% off' },
        'SAVE20': { discount: 0.20, label: '20% off' },
        'WELCOME': { discount: 0.05, label: '5% off' },
        'TAKANJ50': { discount: 0.50, label: '50% off' }
    };
    
    if (validCoupons[code]) {
        const coupon = validCoupons[code];
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        // Calculate discount
        let subtotal = 0;
        cart.forEach(item => {
            const price = item.price || 1299;
            subtotal += price * item.quantity;
        });
        
        const discountAmount = Math.round(subtotal * coupon.discount * 100) / 100;
        
        // Update display
        const discountRow = document.getElementById('discountRow');
        discountRow.style.display = 'flex';
        document.getElementById('discount').textContent = `-${storeSettings.formatCurrency(discountAmount)}`;
        
        // Update total
        const shipping = storeSettings.calculateShipping(subtotal);
        const tax = storeSettings.calculateTax(subtotal);
        const total = storeSettings.calculateGrandTotal(subtotal, shipping, discountAmount);
        document.getElementById('total').textContent = storeSettings.formatCurrency(total);
        
        successMsg.textContent = `Coupon applied! ${coupon.label}`;
        successMsg.classList.remove('d-none');
        
        Toast.success(`Coupon applied: ${coupon.label}`);
    } else {
        errorMsg.textContent = 'Invalid coupon code';
        errorMsg.classList.remove('d-none');
        Toast.warning('Invalid coupon code');
    }
}

// Update cart badge
function updateCartBadge() {
    try {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        const badge = document.getElementById('cartCount');
        if (badge) {
            badge.textContent = count;
        }
    } catch (error) {
        console.error('Error updating cart badge:', error);
    }
}

// Call on page load
document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
});
