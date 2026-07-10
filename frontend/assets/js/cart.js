/**
 * Shopping Cart Page JavaScript
 * Handles cart display, quantity changes, and checkout flow
 */

const SHIPPING_COST = 5.00;
const TAX_RATE = 0.10;

document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    setupEventListeners();
    Navigation.updateNavbar();
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
        
        let subtotal = 0;
        cartItemsContainer.innerHTML = '';
        
        cart.forEach((item, index) => {
            // For demo, use placeholder price if not set
            const itemPrice = item.price || 1299;
            const itemTotal = itemPrice * item.quantity;
            subtotal += itemTotal;
            
            const cartItemHTML = `
                <div class="cart-item" data-index="${index}">
                    <div class="row g-3">
                        <div class="col-md-3 text-center">
                            <img src="${item.image || 'assets/images/placeholder.jpg'}" 
                                 alt="${item.name}" 
                                 class="cart-item-image"
                                 style="cursor: pointer;"
                                 onclick="window.location.href='product.html?id=${item.productId}'">
                        </div>
                        
                        <div class="col-md-4">
                            <h5 class="cart-item-title" style="cursor: pointer;" onclick="window.location.href='product.html?id=${item.productId}'">
                                ${item.name || 'Product'}
                            </h5>
                            <div class="cart-item-details mb-3">
                                <p style="margin-bottom: 0.25rem;">Size: <strong>${item.size}</strong></p>
                                <p style="margin-bottom: 0.25rem;">SKU: <strong>${item.sku || 'N/A'}</strong></p>
                            </div>
                            
                            <div class="quantity-control">
                                <button class="quantity-btn qty-decrease" onclick="updateQuantity(${index}, ${item.quantity - 1})">
                                    <i class="bi bi-dash"></i>
                                </button>
                                <input type="number" class="quantity-input" value="${item.quantity}" 
                                       data-index="${index}" onchange="updateQuantityInput(${index}, this.value)">
                                <button class="quantity-btn qty-increase" onclick="updateQuantity(${index}, ${item.quantity + 1})">
                                    <i class="bi bi-plus"></i>
                                </button>
                            </div>
                        </div>
                        
                        <div class="col-md-3 text-end d-flex flex-column justify-content-center">
                            <div class="cart-item-price">
                                ₨${itemTotal.toFixed(0)}
                            </div>
                            <small class="text-muted">
                                ₨${itemPrice.toFixed(0)} × ${item.quantity}
                            </small>
                        </div>
                        
                        <div class="col-md-2 text-end d-flex align-items-center justify-content-end">
                            <button class="btn-remove" onclick="removeFromCart(${index})" title="Remove item">
                                <i class="bi bi-trash3"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            cartItemsContainer.innerHTML += cartItemHTML;
        });
        
        updateCartSummary(subtotal);
        
    } catch (error) {
        console.error('Error loading cart:', error);
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
    const shipping = subtotal > 150 ? 0 : SHIPPING_COST;
    const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
    const discount = 0;
    const total = subtotal + shipping + tax - discount;
    
    document.getElementById('subtotal').textContent = '₨' + subtotal.toFixed(0);
    document.getElementById('shipping').textContent = shipping === 0 ? 'Free' : '₨' + shipping.toFixed(0);
    document.getElementById('tax').textContent = '₨' + tax.toFixed(0);
    document.getElementById('total').textContent = '₨' + total.toFixed(0);
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
        document.getElementById('discount').textContent = '-₨' + discountAmount.toFixed(0);
        
        // Update total
        const shipping = subtotal > 150 ? 0 : SHIPPING_COST;
        const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
        const total = subtotal + shipping + tax - discountAmount;
        document.getElementById('total').textContent = '₨' + total.toFixed(0);
        
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
