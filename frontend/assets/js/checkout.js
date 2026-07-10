/**
 * Checkout Page JavaScript
 * Handles checkout flow, order summary, and payment
 */

let currentStep = 1;
const shippingCost = 10.00;
const taxRate = 0.10;

document.addEventListener('DOMContentLoaded', () => {
    loadOrderSummary();
    setupEventListeners();
    Navigation.updateNavbar();
});

// Load order summary from cart
function loadOrderSummary() {
    try {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const orderItemsContainer = document.getElementById('orderItems');
        const reviewItemsContainer = document.getElementById('reviewItems');
        
        if (cart.length === 0) {
            orderItemsContainer.innerHTML = '<p class="text-muted">No items in cart</p>';
            reviewItemsContainer.innerHTML = '<p class="text-muted">No items in cart</p>';
            return;
        }
        
        let subtotal = 0;
        let orderHTML = '';
        let reviewHTML = '';
        
        cart.forEach(item => {
            const product = productService.cache.get(`/api/products/${item.productId}`);
            
            // For now, just show the item info
            const itemPrice = (item.price || 99.99) * item.quantity;
            subtotal += itemPrice;
            
            orderHTML += `
                <div class="order-item">
                    <img src="${item.image || '/assets/images/placeholder.jpg'}" alt="${item.name}" class="order-item-image">
                    <div class="order-item-details flex-grow-1">
                        <h5>${item.name || 'Product'}</h5>
                        <p>Size: ${item.size}</p>
                        <p>Qty: ${item.quantity}</p>
                    </div>
                    <div class="text-end">
                        <p class="fw-bold">₨${itemPrice.toFixed(0)}</p>
                    </div>
                </div>
            `;
            
            reviewHTML += `
                <div class="mb-3 p-2 border rounded">
                    <div class="d-flex justify-content-between">
                        <div>
                            <h6>${item.name || 'Product'}</h6>
                            <small class="text-muted">Size: ${item.size} | Qty: ${item.quantity}</small>
                        </div>
                        <div class="text-end">
                            <strong>₨${itemPrice.toFixed(0)}</strong>
                        </div>
                    </div>
                </div>
            `;
        });
        
        orderItemsContainer.innerHTML = orderHTML;
        reviewItemsContainer.innerHTML = reviewHTML;
        
        updateSummary(subtotal);
        
    } catch (error) {
        console.error('Error loading order summary:', error);
    }
}

// Update order summary totals
function updateSummary(subtotal) {
    const shipping = shippingCost;
    const tax = Math.round(subtotal * taxRate * 100) / 100;
    const total = subtotal + shipping + tax;
    
    document.getElementById('subtotal').textContent = '₨' + subtotal.toFixed(0);
    document.getElementById('shipping').textContent = '₨' + shipping.toFixed(0);
    document.getElementById('tax').textContent = '₨' + tax.toFixed(0);
    document.getElementById('total').textContent = '₨' + total.toFixed(0);
}

// Setup event listeners
function setupEventListeners() {
    // Navigation buttons
    document.getElementById('toReview').addEventListener('click', () => {
        if (validateShippingForm()) {
            setStep(2);
        }
    });
    
    document.getElementById('backToShipping').addEventListener('click', () => {
        setStep(1);
    });
    
    document.getElementById('toPayment').addEventListener('click', () => {
        reviewShippingInfo();
        setStep(3);
    });
    
    document.getElementById('backToReview').addEventListener('click', () => {
        setStep(2);
    });
    
    document.getElementById('editShipping').addEventListener('click', () => {
        setStep(1);
    });
    
    // Payment method selection
    document.querySelectorAll('.payment-method').forEach(method => {
        method.addEventListener('click', (e) => {
            if (!e.target.matches('input[type="radio"]')) {
                method.querySelector('input[type="radio"]').checked = true;
            }
            selectPaymentMethod(method.dataset.method);
        });
    });
    
    document.querySelectorAll('input[name="payment"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            selectPaymentMethod(e.target.value);
        });
    });
    
    // Place order button
    document.getElementById('placeOrderBtn').addEventListener('click', () => {
        placeOrder();
    });
}

// Validate shipping form
function validateShippingForm() {
    const form = document.getElementById('shippingForm');
    const inputs = form.querySelectorAll('input[required], select[required]');
    
    let isValid = true;
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.classList.add('is-invalid');
            isValid = false;
        } else {
            input.classList.remove('is-invalid');
        }
    });
    
    if (!isValid) {
        Toast.warning('Please fill in all required fields');
    }
    
    return isValid;
}

// Review shipping information
function reviewShippingInfo() {
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const address = document.getElementById('address').value;
    const apartment = document.getElementById('apartment').value;
    const city = document.getElementById('city').value;
    const state = document.getElementById('state').value;
    const zip = document.getElementById('zip').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    
    const reviewAddress = document.getElementById('reviewAddress');
    reviewAddress.innerHTML = `
        <p style="margin-bottom: 0.5rem;"><strong>${firstName} ${lastName}</strong></p>
        <p style="margin-bottom: 0.5rem;">${address}${apartment ? ', ' + apartment : ''}</p>
        <p style="margin-bottom: 0.5rem;">${city}, ${state} ${zip}</p>
        <p style="margin-bottom: 0;">📧 ${email} | 📞 ${phone}</p>
    `;
}

// Select payment method
function selectPaymentMethod(method) {
    console.log('Selected payment method:', method);
    
    document.querySelectorAll('.payment-method').forEach(m => {
        m.classList.remove('selected');
    });
    
    document.querySelector(`[data-method="${method}"]`).classList.add('selected');
    
    // Show/hide card form
    const cardForm = document.getElementById('cardForm');
    if (method === 'card') {
        cardForm.style.display = 'block';
    } else {
        cardForm.style.display = 'none';
    }
}

// Set checkout step
function setStep(step) {
    currentStep = step;
    
    // Hide all steps
    document.querySelectorAll('.checkout-step').forEach(s => {
        s.classList.remove('active');
    });
    
    // Show current step
    document.getElementById(`step${step}`).classList.add('active');
    
    // Update progress
    document.querySelectorAll('.step').forEach((s, index) => {
        const stepNum = index + 1;
        s.classList.remove('active', 'completed');
        
        if (stepNum < step) {
            s.classList.add('completed');
        } else if (stepNum === step) {
            s.classList.add('active');
        }
    });
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Place order
function placeOrder() {
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    
    if (!paymentMethod) {
        Toast.warning('Please select a payment method');
        return;
    }
    
    if (paymentMethod === 'card') {
        if (!validateCardForm()) {
            Toast.warning('Please enter valid card information');
            return;
        }
    }
    
    // Get shipping info
    const shippingInfo = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        apartment: document.getElementById('apartment').value,
        city: document.getElementById('city').value,
        state: document.getElementById('state').value,
        zip: document.getElementById('zip').value
    };
    
    // Get cart
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart.length === 0) {
        Toast.error('Your cart is empty');
        return;
    }
    
    // Create order object
    const order = {
        shippingInfo,
        items: cart,
        paymentMethod,
        subtotal: parseFloat(document.getElementById('subtotal').textContent.replace('₨', '')),
        shipping: shippingCost,
        tax: parseFloat(document.getElementById('tax').textContent.replace('₨', '')),
        total: parseFloat(document.getElementById('total').textContent.replace('₨', '')),
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    
    // Save order
    try {
        let orders = JSON.parse(localStorage.getItem('orders')) || [];
        order.id = 'ORDER-' + Date.now();
        orders.push(order);
        localStorage.setItem('orders', JSON.stringify(orders));
        
        // Clear cart
        localStorage.removeItem('cart');
        
        // Show success message
        Toast.success('Order placed successfully!');
        
        // Redirect to orders page
        setTimeout(() => {
            window.location.href = 'orders.html?orderId=' + order.id;
        }, 2000);
        
    } catch (error) {
        console.error('Error placing order:', error);
        Toast.error('Failed to place order. Please try again.');
    }
}

// Validate card form
function validateCardForm() {
    const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
    const cardName = document.getElementById('cardName').value;
    const cardExpiry = document.getElementById('cardExpiry').value;
    const cardCVV = document.getElementById('cardCVV').value;
    
    if (cardNumber.length < 13 || cardNumber.length > 19) {
        return false;
    }
    
    if (!cardName.trim()) {
        return false;
    }
    
    if (!cardExpiry.match(/^\d{2}\/\d{2}$/)) {
        return false;
    }
    
    if (cardCVV.length < 3 || cardCVV.length > 4) {
        return false;
    }
    
    return true;
}

// Format card number
document.addEventListener('input', (e) => {
    if (e.target.id === 'cardNumber') {
        let value = e.target.value.replace(/\s/g, '');
        let formattedValue = '';
        for (let i = 0; i < value.length; i++) {
            if (i > 0 && i % 4 === 0) {
                formattedValue += ' ';
            }
            formattedValue += value[i];
        }
        e.target.value = formattedValue;
    }
    
    if (e.target.id === 'cardExpiry') {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.slice(0, 2) + '/' + value.slice(2, 4);
        }
        e.target.value = value;
    }
});
