/**
 * Checkout Page JavaScript - SIMPLIFIED & WORKING
 * Handles 3-step checkout: Shipping Info, Order Review, Payment Method
 */

let currentStep = 1;
let checkoutData = {
  customerInfo: {},
  paymentMethod: null,
  paymentProof: null
};
let paymentProofFile = null;

// Toast notification helper
function showNotification(type, message) {
  if (window.Toast && window.Toast[type]) {
    window.Toast[type](message);
  } else {
    console.log(`[${type.toUpperCase()}] ${message}`);
  }
}

/**
 * Main initialization - runs when page loads
 */
document.addEventListener('DOMContentLoaded', () => {
  console.log('🔄 Checkout: Starting initialization');
  
  // Initialize store settings (uses defaults immediately, no API call)
  storeSettings.initialize();
  console.log('✅ Store settings ready');
  
  // Get cart from localStorage
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  console.log('🛒 Cart loaded:', cart);
  
  // Setup form and payment handlers
  setupEventListeners();
  setupFieldValidation();
  setupPaymentMethods();
  
  // Load any previously saved form data
  loadStep1Data();
  
  // Enable button - always allow user to proceed to validation on click
  const toReviewBtn = document.getElementById('toReview');
  if (toReviewBtn) {
    toReviewBtn.disabled = false;
    toReviewBtn.style.display = 'block';
  }
  
  console.log('✅ Checkout initialized');
});

/**
 * Display review items - replica of cart items with prices
 */
async function displayReviewItems() {
  try {
    const reviewItems = document.getElementById('reviewItems');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (!cart || cart.length === 0) {
      reviewItems.innerHTML = '<p class="text-muted">No items in cart.</p>';
      return;
    }
    
    let subtotal = 0;
    reviewItems.innerHTML = '';
    
    // Fetch current prices from API and display items
    for (const item of cart) {
      let itemPrice = 1299;
      let productName = item.name || 'Product';
      let productImage = item.image || 'assets/images/placeholder.jpg';
      
      if (item.productId) {
        try {
          const response = await fetch(`${API_CONFIG.getEndpoint('/products')}/${item.productId}`);
          if (response.ok) {
            const data = await response.json();
            const product = data.data || data;
            
            itemPrice = product.salePrice || product.price || 1299;
            productName = product.name || item.name || 'Product';
            productImage = product.imageUrl || product.image || item.image || 'assets/images/placeholder.jpg';
          }
        } catch (err) {
          console.warn(`Could not fetch product ${item.productId}`, err);
        }
      }
      
      const quantity = parseInt(item.quantity) || 1;
      const lineTotal = itemPrice * quantity;
      subtotal += lineTotal;
      
      const itemHTML = `
        <div class="order-item">
          <img src="${productImage}" alt="${productName}" class="order-item-image">
          <div class="order-item-details flex-grow-1">
            <h5>${productName}</h5>
            <p>Size: ${item.size || 'N/A'}</p>
            <p>Qty: ${quantity}</p>
          </div>
          <div class="text-end">
            <p class="fw-bold">${storeSettings.formatCurrency(lineTotal)}</p>
            <small class="text-muted">${storeSettings.formatCurrency(itemPrice)} × ${quantity}</small>
          </div>
        </div>
      `;
      
      reviewItems.innerHTML += itemHTML;
    }
    
    // Update summary with correct calculations
    updateOrderSummaryDisplay(subtotal);
    
  } catch (error) {
    console.error('Error displaying review items:', error);
  }
}

/**
 * Display order summary - REMOVED FROM BEING CALLED AT INIT
 * Now only called from Step 2 review and Step 3 payment
 */
async function displayOrderSummary(cart) {
  try {
    const orderItemsContainer = document.getElementById('orderItems');
    
    if (!cart || cart.length === 0) {
      console.log('⚠️ Cart is empty');
      orderItemsContainer.innerHTML = '<p class="text-muted">No items in cart. Add items to proceed.</p>';
      updateOrderSummaryDisplay(0);
      return;
    }
    
    // Calculate subtotal by fetching CURRENT prices from API
    let subtotal = 0;
    orderItemsContainer.innerHTML = '';
    
    for (const item of cart) {
      let itemPrice = 1299;
      let productName = item.name || 'Product';
      let productImage = item.image || 'assets/images/placeholder.jpg';
      
      if (item.productId) {
        try {
          const response = await fetch(`${API_CONFIG.getEndpoint('/products')}/${item.productId}`);
          if (response.ok) {
            const data = await response.json();
            const product = data.data || data;
            
            itemPrice = product.salePrice || product.price || 1299;
            productName = product.name || item.name || 'Product';
            productImage = product.imageUrl || product.image || item.image || 'assets/images/placeholder.jpg';
          }
        } catch (err) {
          console.warn(`Could not fetch product ${item.productId}`, err);
        }
      }
      
      const quantity = parseInt(item.quantity) || 1;
      const lineTotal = itemPrice * quantity;
      subtotal += lineTotal;
      
      const orderHTML = `
        <div class="order-item">
          <img src="${productImage}" alt="${productName}" class="order-item-image" style="max-width: 80px;">
          <div class="order-item-details flex-grow-1">
            <h5>${productName}</h5>
            <p>Size: ${item.size || 'N/A'}</p>
            <p>Qty: ${quantity}</p>
          </div>
          <div class="text-end">
            <p class="fw-bold">${storeSettings.formatCurrency(lineTotal)}</p>
          </div>
        </div>
      `;
      
      orderItemsContainer.innerHTML += orderHTML;
    }
    
    updateOrderSummaryDisplay(subtotal);
    
  } catch (error) {
    console.error('❌ Error in displayOrderSummary:', error);
  }
}

/**
 * Update order summary totals - SAME LOGIC AS CART PAGE
 */
function updateOrderSummaryDisplay(subtotal) {
  try {
    // Calculate using same formulas as cart.js
    const shipping = storeSettings.calculateShipping(subtotal);
    const tax = storeSettings.calculateTax(subtotal);
    const total = storeSettings.calculateGrandTotal(subtotal, shipping);
    
    console.log('💰 Calculations - Subtotal:', subtotal, 'Shipping:', shipping, 'Tax:', tax, 'Total:', total);
    
    // Update DOM elements
    const subtotalEl = document.getElementById('subtotal');
    const shippingEl = document.getElementById('shipping');
    const taxEl = document.getElementById('tax');
    const totalEl = document.getElementById('total');
    
    if (subtotalEl) subtotalEl.textContent = storeSettings.formatCurrency(subtotal);
    if (shippingEl) shippingEl.textContent = shipping === 0 ? 'Free' : storeSettings.formatCurrency(shipping);
    if (taxEl) taxEl.textContent = storeSettings.formatCurrency(tax);
    if (totalEl) totalEl.textContent = storeSettings.formatCurrency(total);
    
    console.log('✅ Order summary updated successfully');
  } catch (error) {
    console.error('❌ Error updating summary:', error);
  }
}

/**
 * STEP 1: Customer Information Form
 */
function setupFieldValidation() {
  const fieldMappings = {
    'firstName': 'firstName',
    'lastName': 'lastName',
    'email': 'email',
    'whatsappNumber': 'whatsappNumber',
    'street': 'street',
    'city': 'city',
    'postalCode': 'postalCode',
    'state': 'state'
  };

  // Don't setup real-time validation - just do it on button click
  // This prevents button flickering and disappearing issues
  console.log('✅ Field validation setup skipped - will validate on submit');
}

function updateFormButtonState() {
  // Button is always enabled - user will see validation errors on submit
  const toReviewBtn = document.getElementById('toReview');
  if (toReviewBtn) {
    toReviewBtn.disabled = false;
    toReviewBtn.style.display = 'block'; // Make sure it's visible
  }
}

function saveStep1Data() {
  checkoutData.customerInfo = {
    firstName: document.getElementById('firstName')?.value || '',
    lastName: document.getElementById('lastName')?.value || '',
    email: document.getElementById('email')?.value || '',
    whatsappNumber: document.getElementById('whatsappNumber')?.value || '',
    shippingAddress: {
      street: document.getElementById('street')?.value || '',
      city: document.getElementById('city')?.value || '',
      state: document.getElementById('state')?.value || '',
      postalCode: document.getElementById('postalCode')?.value || ''
    },
    notes: document.getElementById('notes')?.value || ''
  };

  localStorage.setItem('checkout_step1_data', JSON.stringify(checkoutData.customerInfo));
}

function loadStep1Data() {
  const saved = localStorage.getItem('checkout_step1_data');
  if (saved) {
    try {
      checkoutData.customerInfo = JSON.parse(saved);
      
      document.getElementById('firstName').value = checkoutData.customerInfo.firstName || '';
      document.getElementById('lastName').value = checkoutData.customerInfo.lastName || '';
      document.getElementById('email').value = checkoutData.customerInfo.email || '';
      document.getElementById('whatsappNumber').value = checkoutData.customerInfo.whatsappNumber || '';
      document.getElementById('street').value = checkoutData.customerInfo.shippingAddress?.street || '';
      document.getElementById('city').value = checkoutData.customerInfo.shippingAddress?.city || '';
      document.getElementById('state').value = checkoutData.customerInfo.shippingAddress?.state || '';
      document.getElementById('postalCode').value = checkoutData.customerInfo.shippingAddress?.postalCode || '';
      document.getElementById('notes').value = checkoutData.customerInfo.notes || '';
    } catch (e) {
      console.warn('Could not load saved form data', e);
    }
  }
}

/**
 * STEP 2: Order Review
 */
async function displayOrderReview() {
  try {
    console.log('📋 displayOrderReview called');
    
    saveStep1Data();

    const reviewAddress = document.getElementById('reviewAddress');
    if (!reviewAddress) {
      console.error('❌ reviewAddress element not found');
      return;
    }

    const info = checkoutData.customerInfo;
    const addr = info.shippingAddress;

    reviewAddress.innerHTML = `
      <p><strong>${info.firstName} ${info.lastName}</strong></p>
      <p>${addr.street}</p>
      <p>${addr.city}, ${addr.state} ${addr.postalCode}</p>
      <p>📧 ${info.email} | 📱 ${info.whatsappNumber}</p>
    `;

    // Display order items in review section (like cart)
    console.log('📦 Displaying review items...');
    await displayReviewItems();
    
    // Show the summary sidebar on Step 2
    document.getElementById('summaryCol').style.display = 'block';
    
    console.log('✅ Order review displayed successfully');
  } catch (error) {
    console.error('❌ Error in displayOrderReview:', error);
  }
}

/**
 * STEP 3: Payment Method
 */
function setupPaymentMethods() {
  document.querySelectorAll('.payment-method').forEach(method => {
    method.addEventListener('click', (e) => {
      if (!e.target.matches('input[type="radio"]')) {
        method.querySelector('input[type="radio"]').checked = true;
      }
      selectPaymentMethod(method.dataset.method);
    });
  });

  document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      selectPaymentMethod(e.target.value);
    });
  });

  const copyBtn = document.getElementById('copyAccountBtn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const accountNumber = document.getElementById('accountNumber')?.textContent;
      if (accountNumber) {
        navigator.clipboard.writeText(accountNumber).then(() => {
          showNotification('success', 'Account number copied!');
        });
      }
    });
  }

  setupFileUpload();
}

function selectPaymentMethod(method) {
  checkoutData.paymentMethod = method;

  document.querySelectorAll('.payment-method').forEach(m => {
    m.classList.remove('selected');
  });
  document.querySelector(`[data-method="${method}"]`)?.classList.add('selected');

  const bankDetails = document.getElementById('bankTransferDetails');
  const codMessage = document.getElementById('codMessage');
  const placeOrderBtn = document.getElementById('placeOrderBtn');

  if (method === 'Bank_Transfer') {
    if (bankDetails) bankDetails.style.display = 'block';
    if (codMessage) codMessage.style.display = 'none';
    if (placeOrderBtn) placeOrderBtn.disabled = !paymentProofFile;
  } else if (method === 'COD') {
    if (bankDetails) bankDetails.style.display = 'none';
    if (codMessage) codMessage.style.display = 'block';
    if (placeOrderBtn) placeOrderBtn.disabled = false;
  }
}

function setupFileUpload() {
  const fileContainer = document.getElementById('fileUploadContainer');
  const fileInput = document.getElementById('paymentProofFile');
  const previewContainer = document.getElementById('filePreviewContainer');
  const placeOrderBtn = document.getElementById('placeOrderBtn');

  if (!fileContainer || !fileInput) return;

  fileContainer.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      handlePaymentProofUpload(file, previewContainer, placeOrderBtn);
    }
  });

  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    fileContainer.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
  });

  ['dragenter', 'dragover'].forEach(eventName => {
    fileContainer.addEventListener(eventName, () => {
      fileContainer.classList.add('drag-over');
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    fileContainer.addEventListener(eventName, () => {
      fileContainer.classList.remove('drag-over');
    });
  });

  fileContainer.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handlePaymentProofUpload(files[0], previewContainer, placeOrderBtn);
      fileInput.files = files;
    }
  });
}

function handlePaymentProofUpload(file, previewContainer, placeOrderBtn) {
  if (!Validation) return;
  
  const validation = Validation.validateFile(file, {
    maxSize: 5 * 1024 * 1024,
    allowedMimes: ['image/jpeg', 'image/png', 'image/webp']
  });

  if (!validation.isValid) {
    displayPaymentProofError(previewContainer, validation.message);
    paymentProofFile = null;
    if (placeOrderBtn) placeOrderBtn.disabled = true;
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const fileSizeMb = (file.size / (1024 * 1024)).toFixed(2);
    
    previewContainer.innerHTML = `
      <div class="border rounded p-3">
        <div class="d-flex justify-content-between align-items-start gap-3">
          <div>
            <img src="${e.target.result}" alt="Payment Proof" style="max-width: 150px; max-height: 150px; object-fit: contain; border: 1px solid var(--gray-300);">
          </div>
          <div class="flex-grow-1">
            <p class="mb-1"><strong>File:</strong> ${file.name}</p>
            <p class="mb-2"><strong>Size:</strong> ${fileSizeMb}MB</p>
            <button type="button" class="btn btn-sm btn-outline-danger" id="removeProofBtn">
              <i class="bi bi-trash me-1"></i> Remove
            </button>
          </div>
        </div>
      </div>
    `;

    previewContainer.style.display = 'block';

    document.getElementById('removeProofBtn').addEventListener('click', () => {
      previewContainer.innerHTML = '';
      previewContainer.style.display = 'none';
      paymentProofFile = null;
      if (placeOrderBtn) placeOrderBtn.disabled = true;
    });
  };

  reader.readAsDataURL(file);
  paymentProofFile = file;
  if (placeOrderBtn) placeOrderBtn.disabled = false;
}

function displayPaymentProofError(container, message) {
  container.innerHTML = `
    <div class="alert alert-danger d-flex align-items-center gap-2" role="alert">
      <i class="bi bi-exclamation-circle-fill"></i>
      <div>${message}</div>
    </div>
  `;
  container.style.display = 'block';
}

/**
 * Place Order
 */
async function placeOrder() {
  const placeOrderBtn = document.getElementById('placeOrderBtn');
  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value;

  if (!paymentMethod) {
    showNotification('warning', 'Please select a payment method');
    return;
  }

  if (paymentMethod === 'Bank_Transfer' && !paymentProofFile) {
    showNotification('error', 'Please upload payment proof');
    return;
  }

  if (placeOrderBtn) {
    placeOrderBtn.disabled = true;
    placeOrderBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Placing Order...';
  }

  try {
    const user = getCurrentUser();
    if (!user) {
      showNotification('error', 'User not logged in');
      window.location.href = 'login.html?redirect=checkout.html';
      return;
    }

    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
      showNotification('error', 'Your cart is empty');
      return;
    }

    let subtotal = 0;
    const items = [];

    // Fetch current prices from API - SAME LOGIC AS CART PAGE
    for (const cartItem of cart) {
      let itemPrice = 1299; // Default fallback
      let productName = cartItem.name || 'Product';

      // Fetch product from API to get CURRENT price (SAME AS CART.JS)
      if (cartItem.productId) {
        try {
          const response = await fetch(`${API_CONFIG.getEndpoint('/products')}/${cartItem.productId}`);
          if (response.ok) {
            const data = await response.json();
            const product = data.data || data;
            
            // Use sale price if available, otherwise regular price (SAME AS CART.JS)
            itemPrice = product.salePrice || product.price || 1299;
            productName = product.name || cartItem.name || 'Product';
          }
        } catch (err) {
          console.warn(`Could not fetch product ${cartItem.productId}, using fallback`, err);
        }
      }

      const quantity = parseInt(cartItem.quantity) || 1;
      const lineTotal = itemPrice * quantity;
      subtotal += lineTotal;

      items.push({
        productId: cartItem.productId,
        name: productName,
        price: itemPrice,
        quantity: quantity,
        size: cartItem.size,
        lineTotal: lineTotal
      });
    }

    const tax = storeSettings.calculateTax(subtotal);
    const shipping = storeSettings.calculateShipping(subtotal);
    const total = storeSettings.calculateGrandTotal(subtotal, shipping);

    const orderData = {
      userId: user.id,
      firstName: checkoutData.customerInfo.firstName,
      lastName: checkoutData.customerInfo.lastName,
      email: checkoutData.customerInfo.email,
      whatsappNumber: checkoutData.customerInfo.whatsappNumber,
      items: items,
      subtotal: subtotal,
      tax: tax,
      shipping: shipping,
      discount: 0,
      total: total,
      paymentMethod: paymentMethod,
      paymentStatus: 'pending',
      orderStatus: 'pending',
      shippingAddress: checkoutData.customerInfo.shippingAddress,
      notes: checkoutData.customerInfo.notes
    };

    const response = await fetch(API_CONFIG.getEndpoint('/v1/orders/create'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(orderData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create order');
    }

    const result = await response.json();
    const orderId = result.data?.orderId || result.data?.id;

    if (paymentMethod === 'Bank_Transfer' && paymentProofFile) {
      try {
        const formData = new FormData();
        formData.append('file', paymentProofFile);

        await fetch(API_CONFIG.getEndpoint(`/v1/orders/${orderId}/payment-proof`), {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });
      } catch (err) {
        console.warn('Payment proof upload failed:', err);
      }
    }

    localStorage.removeItem('cart');
    localStorage.removeItem('checkout_step1_data');

    showNotification('success', 'Order placed successfully!');

    setTimeout(() => {
      window.location.href = `checkout-confirmation.html?orderId=${orderId}`;
    }, 1500);

  } catch (error) {
    console.error('Error placing order:', error);
    showNotification('error', error.message || 'Failed to place order. Please try again.');
    
    if (placeOrderBtn) {
      placeOrderBtn.disabled = false;
      placeOrderBtn.innerHTML = 'Place Order <i class="bi bi-lock ms-2"></i>';
    }
  }
}

/**
 * Step Navigation
 */
function setStep(step) {
  currentStep = step;

  document.querySelectorAll('.checkout-step').forEach(s => {
    s.classList.remove('active');
  });

  const stepEl = document.getElementById(`step${step}`);
  if (stepEl) stepEl.classList.add('active');

  document.querySelectorAll('.step').forEach((s, index) => {
    const stepNum = index + 1;
    s.classList.remove('active', 'completed');

    if (stepNum < step) {
      s.classList.add('completed');
    } else if (stepNum === step) {
      s.classList.add('active');
    }
  });

  // Show/hide summary sidebar based on step
  // Step 1: Hide summary
  // Step 2 & 3: Show summary
  const summaryCol = document.getElementById('summaryCol');
  if (step === 1) {
    summaryCol.style.display = 'none';
  } else {
    summaryCol.style.display = 'block';
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Event Listeners
 */
function setupEventListeners() {
  const toReviewBtn = document.getElementById('toReview');
  const backToShippingBtn = document.getElementById('backToShipping');
  const toPaymentBtn = document.getElementById('toPayment');
  const backToReviewBtn = document.getElementById('backToReview');
  const editShippingBtn = document.getElementById('editShipping');
  const placeOrderBtn = document.getElementById('placeOrderBtn');

  console.log('🔗 Setting up event listeners...');
  console.log('toReviewBtn found:', !!toReviewBtn);
  console.log('backToShippingBtn found:', !!backToShippingBtn);
  console.log('toPaymentBtn found:', !!toPaymentBtn);

  if (toReviewBtn) {
    toReviewBtn.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('✅ Continue to Review clicked');
      validateAndGoToStep2();
    });
  }

  if (backToShippingBtn) {
    backToShippingBtn.addEventListener('click', () => {
      console.log('⬅️ Back to Shipping clicked');
      setStep(1);
    });
  }

  if (toPaymentBtn) {
    toPaymentBtn.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('✅ Continue to Payment clicked');
      validateAndGoToStep3();
    });
  }

  if (backToReviewBtn) {
    backToReviewBtn.addEventListener('click', () => {
      console.log('⬅️ Back to Review clicked');
      setStep(2);
    });
  }

  if (editShippingBtn) {
    editShippingBtn.addEventListener('click', () => {
      console.log('✏️ Edit Shipping clicked');
      setStep(1);
    });
  }

  if (placeOrderBtn) {
    placeOrderBtn.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('✅ Place Order clicked');
      placeOrder();
    });
  }

  console.log('✅ Event listeners setup complete');
}

function validateAndGoToStep2() {
  console.log('🔍 validateAndGoToStep2 called');
  
  const requiredFields = ['firstName', 'lastName', 'email', 'whatsappNumber', 'street', 'city', 'state', 'postalCode'];
  let allValid = true;
  const errors = {};

  requiredFields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (!field) {
      console.warn(`⚠️ Field not found: ${fieldId}`);
      return;
    }
    
    const value = field.value;
    console.log(`📝 ${fieldId}: "${value}"`);
    
    if (!value || value.trim() === '') {
      allValid = false;
      errors[fieldId] = 'This field is required';
      console.error(`❌ ${fieldId} is empty`);
      return;
    }
    
    // Validate using Validation service
    if (fieldId !== 'state' && typeof Validation !== 'undefined') {
      const result = Validation.validateField(fieldId, value, true);
      if (!result.isValid) {
        allValid = false;
        errors[fieldId] = result.message;
        console.error(`❌ ${fieldId} validation failed: ${result.message}`);
      } else {
        console.log(`✅ ${fieldId} is valid`);
      }
    } else if (fieldId === 'state') {
      console.log(`✅ ${fieldId} is valid (state field)`);
    }
  });

  console.log('📊 Validation complete. All valid?', allValid);
  console.log('❌ Errors:', errors);

  if (!allValid) {
    showNotification('warning', 'Please fix all errors in the form');
    return;
  }

  console.log('✅ Form validation passed, moving to step 2');
  displayOrderReview();
  setStep(2);
}

function validateAndGoToStep3() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  if (cart.length === 0) {
    showNotification('error', 'Your cart is empty');
    return;
  }

  setStep(3);
  updatePaymentSummary();
}

function updatePaymentSummary() {
  const total = document.getElementById('total')?.textContent || 'Rs 0';
  const codAmount = document.getElementById('codAmount');
  if (codAmount) codAmount.textContent = total;
}

/**
 * Utility Functions
 */
function isUserLoggedIn() {
  return !!localStorage.getItem('token') && !!localStorage.getItem('user');
}

function getCurrentUser() {
  const user = localStorage.getItem('user');
  if (!user) return null;
  try {
    return JSON.parse(user);
  } catch (e) {
    return null;
  }
}
