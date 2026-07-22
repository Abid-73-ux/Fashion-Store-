/**
 * Checkout Page JavaScript - Phase 3 Implementation
 * Handles 3-step checkout: Shipping Info, Order Review, Payment Method
 * Features: Form validation, API integration, localStorage persistence, payment proof upload
 */

let currentStep = 1;
let checkoutData = {
  customerInfo: {},
  orderItems: [],
  paymentMethod: null,
  paymentProof: null
};
let paymentProofFile = null;

// Toast utility (fallback if main.js not loaded)
const Toast = window.Toast || {
  success: (msg) => alert(msg),
  error: (msg) => alert('Error: ' + msg),
  warning: (msg) => alert('Warning: ' + msg),
  info: (msg) => alert(msg)
};

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize store settings
  await storeSettings.initialize();
  
  // Load cart and initialize checkout
  loadCheckoutData();
  setupEventListeners();
  setupFieldValidation();
  
  // Check if user is logged in
  if (!isUserLoggedIn()) {
    window.location.href = 'login.html?redirect=checkout.html';
  }
});

/**
 * TASK 3.1: Step 1 - Customer Information Form
 */

function setupFieldValidation() {
  // Setup real-time validation for Step 1 fields
  const fieldMappings = {
    'firstName': 'firstName',
    'lastName': 'lastName',
    'email': 'email',
    'whatsappNumber': 'whatsappNumber',
    'street': 'street',
    'city': 'city',
    'postalCode': 'postalCode'
  };

  Object.entries(fieldMappings).forEach(([elementId, fieldName]) => {
    const element = document.getElementById(elementId);
    if (element) {
      Validation.setupFieldValidation(element, fieldName, true, (isValid, message) => {
        updateFormButtonState();
      }, 300);
    }
  });
}

function updateFormButtonState() {
  const form = document.getElementById('shippingForm');
  const toReviewBtn = document.getElementById('toReview');
  
  // Validate all required fields
  const requiredFields = ['firstName', 'lastName', 'email', 'whatsappNumber', 'street', 'city', 'state', 'postalCode'];
  let allValid = true;

  requiredFields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
      const fieldName = field.name || fieldId;
      const result = Validation.validateField(fieldName, field.value, true);
      if (!result.isValid) {
        allValid = false;
      }
    }
  });

  toReviewBtn.disabled = !allValid;
}

function saveStep1Data() {
  // Get form data
  checkoutData.customerInfo = {
    firstName: document.getElementById('firstName').value,
    lastName: document.getElementById('lastName').value,
    email: document.getElementById('email').value,
    whatsappNumber: document.getElementById('whatsappNumber').value,
    shippingAddress: {
      street: document.getElementById('street').value,
      city: document.getElementById('city').value,
      state: document.getElementById('state').value,
      postalCode: document.getElementById('postalCode').value
    },
    notes: document.getElementById('notes').value || ''
  };

  // Save to localStorage
  localStorage.setItem('checkout_step1_data', JSON.stringify(checkoutData.customerInfo));
}

function loadStep1Data() {
  // Try to load from localStorage
  const saved = localStorage.getItem('checkout_step1_data');
  if (saved) {
    try {
      checkoutData.customerInfo = JSON.parse(saved);
      
      // Populate form fields
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
      console.warn('Could not load saved Step 1 data', e);
    }
  }
}

/**
 * TASK 3.2: Step 2 - Order Review
 */

function displayOrderReview() {
  saveStep1Data();

  // Display shipping address
  const reviewAddress = document.getElementById('reviewAddress');
  const info = checkoutData.customerInfo;
  const addr = info.shippingAddress;

  reviewAddress.innerHTML = `
    <p style="margin-bottom: 0.5rem;"><strong>${info.firstName} ${info.lastName}</strong></p>
    <p style="margin-bottom: 0.5rem;">${addr.street}</p>
    <p style="margin-bottom: 0.5rem;">${addr.city}, ${addr.state} ${addr.postalCode}</p>
    <p style="margin-bottom: 0;">📧 ${info.email} | 📱 ${info.whatsappNumber}</p>
  `;
}

/**
 * TASK 3.3: Step 3 - Payment Method Selection
 */

function setupPaymentMethods() {
  // Payment method click handlers
  document.querySelectorAll('.payment-method').forEach(method => {
    method.addEventListener('click', (e) => {
      if (!e.target.matches('input[type="radio"]')) {
        method.querySelector('input[type="radio"]').checked = true;
      }
      selectPaymentMethod(method.dataset.method);
    });
  });

  // Radio button change
  document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      selectPaymentMethod(e.target.value);
    });
  });

  // Copy account number
  const copyBtn = document.getElementById('copyAccountBtn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const accountNumber = document.getElementById('accountNumber').textContent;
      navigator.clipboard.writeText(accountNumber).then(() => {
        Toast.success('Account number copied to clipboard!');
      });
    });
  }

  // Setup file upload
  setupFileUpload();
}

function selectPaymentMethod(method) {
  checkoutData.paymentMethod = method;

  // Update UI
  document.querySelectorAll('.payment-method').forEach(m => {
    m.classList.remove('selected');
  });
  document.querySelector(`[data-method="${method}"]`).classList.add('selected');

  // Show/hide bank transfer details
  const bankDetails = document.getElementById('bankTransferDetails');
  const codMessage = document.getElementById('codMessage');
  const placeOrderBtn = document.getElementById('placeOrderBtn');

  if (method === 'Bank_Transfer') {
    bankDetails.style.display = 'block';
    codMessage.style.display = 'none';
    // Enable button only if file is uploaded
    placeOrderBtn.disabled = !paymentProofFile;
  } else if (method === 'COD') {
    bankDetails.style.display = 'none';
    codMessage.style.display = 'block';
    placeOrderBtn.disabled = false;
  }
}

function setupFileUpload() {
  const fileContainer = document.getElementById('fileUploadContainer');
  const fileInput = document.getElementById('paymentProofFile');
  const previewContainer = document.getElementById('filePreviewContainer');
  const placeOrderBtn = document.getElementById('placeOrderBtn');

  if (!fileContainer || !fileInput) return;

  // Click to upload
  fileContainer.addEventListener('click', () => {
    fileInput.click();
  });

  // File selection
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      handlePaymentProofUpload(file, previewContainer, placeOrderBtn);
    }
  });

  // Drag and drop
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
  // Validate file
  const validation = Validation.validateFile(file, {
    maxSize: 5 * 1024 * 1024,
    allowedMimes: ['image/jpeg', 'image/png', 'image/webp']
  });

  if (!validation.isValid) {
    displayPaymentProofError(previewContainer, validation.message);
    paymentProofFile = null;
    placeOrderBtn.disabled = true;
    return;
  }

  // Display preview
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

    // Remove button
    document.getElementById('removeProofBtn').addEventListener('click', () => {
      previewContainer.innerHTML = '';
      previewContainer.style.display = 'none';
      paymentProofFile = null;
      placeOrderBtn.disabled = true;
    });
  };

  reader.readAsDataURL(file);
  paymentProofFile = file;
  placeOrderBtn.disabled = false;
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
 * TASK 3.4: Order Creation and API Integration
 */

async function placeOrder() {
  const placeOrderBtn = document.getElementById('placeOrderBtn');
  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value;

  if (!paymentMethod) {
    Toast.warning('Please select a payment method');
    return;
  }

  if (paymentMethod === 'Bank_Transfer' && !paymentProofFile) {
    Toast.error('Please upload payment proof for bank transfer');
    return;
  }

  // Disable button and show loading
  placeOrderBtn.disabled = true;
  placeOrderBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Placing Order...';

  try {
    // Get current user
    const user = getCurrentUser();
    if (!user) {
      Toast.error('User not logged in');
      window.location.href = 'login.html?redirect=checkout.html';
      return;
    }

    // Get cart
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
      Toast.error('Your cart is empty');
      return;
    }

    // Calculate totals
    let subtotal = 0;
    const items = [];

    for (const cartItem of cart) {
      let itemPrice = cartItem.price || 99.99;
      let productName = cartItem.name || 'Product';
      let productImage = cartItem.image || '/assets/images/placeholder.jpg';

      // Try to get current price from API
      if (cartItem.productId) {
        try {
          const response = await fetch(`${API_CONFIG.getEndpoint('/v1/products')}/${cartItem.productId}`);
          if (response.ok) {
            const data = await response.json();
            const product = data.data || data;
            itemPrice = product.salePrice || product.price || cartItem.price || 99.99;
            productName = product.name || cartItem.name || 'Product';
            productImage = product.imageUrl || product.image || cartItem.image || '/assets/images/placeholder.jpg';
          }
        } catch (err) {
          console.warn(`Could not fetch current price for product ${cartItem.productId}`, err);
        }
      }

      const lineTotal = itemPrice * cartItem.quantity;
      subtotal += lineTotal;

      items.push({
        productId: cartItem.productId,
        name: productName,
        price: itemPrice,
        quantity: cartItem.quantity,
        size: cartItem.size,
        color: cartItem.color,
        image: productImage,
        lineTotal: lineTotal
      });
    }

    const tax = storeSettings.calculateTax(subtotal);
    const shipping = storeSettings.calculateShipping(subtotal);
    const total = storeSettings.calculateGrandTotal(subtotal, shipping);

    // Create order object
    const orderData = {
      userId: user.id,
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

    // Create order via API
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

    // Upload payment proof if bank transfer
    if (paymentMethod === 'Bank_Transfer' && paymentProofFile) {
      try {
        const formData = new FormData();
        formData.append('file', paymentProofFile);

        const uploadResponse = await fetch(API_CONFIG.getEndpoint(`/v1/orders/${orderId}/payment-proof`), {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });

        if (!uploadResponse.ok) {
          console.warn('Payment proof upload failed, but order was created', uploadResponse.status);
        }
      } catch (err) {
        console.warn('Error uploading payment proof:', err);
      }
    }

    // Clear cart and checkout data
    localStorage.removeItem('cart');
    localStorage.removeItem('checkout_step1_data');

    // Show success and redirect
    Toast.success('Order placed successfully!');

    setTimeout(() => {
      window.location.href = `checkout-confirmation.html?orderId=${orderId}`;
    }, 1500);

  } catch (error) {
    console.error('Error placing order:', error);
    Toast.error(error.message || 'Failed to place order. Please try again.');
    
    placeOrderBtn.disabled = false;
    placeOrderBtn.innerHTML = 'Place Order <i class="bi bi-lock ms-2"></i>';
  }
}

/**
 * Event Listeners Setup
 */

function setupEventListeners() {
  // Step navigation
  document.getElementById('toReview').addEventListener('click', validateAndGoToStep2);
  document.getElementById('backToShipping').addEventListener('click', () => setStep(1));
  document.getElementById('toPayment').addEventListener('click', validateAndGoToStep3);
  document.getElementById('backToReview').addEventListener('click', () => setStep(2));
  document.getElementById('editShipping').addEventListener('click', () => setStep(1));
  
  // Place order
  document.getElementById('placeOrderBtn').addEventListener('click', placeOrder);

  // Payment method setup
  setupPaymentMethods();
}

function validateAndGoToStep2() {
  // Validate Step 1 form
  const form = document.getElementById('shippingForm');
  const result = Validation.validateForm(form, {
    'firstName': { isRequired: true },
    'lastName': { isRequired: true },
    'email': { isRequired: true },
    'whatsappNumber': { isRequired: true },
    'street': { isRequired: true },
    'city': { isRequired: true },
    'state': { isRequired: true },
    'postalCode': { isRequired: true }
  });

  if (result.isValid) {
    displayOrderReview();
    setStep(2);
  } else {
    Toast.warning('Please fix errors in the form');
  }
}

function validateAndGoToStep3() {
  // Check inventory before proceeding
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  if (cart.length === 0) {
    Toast.error('Your cart is empty');
    return;
  }

  setStep(3);
  updatePaymentSummary();
}

function updatePaymentSummary() {
  // Update COD amount
  const total = document.getElementById('total').textContent;
  document.getElementById('codAmount').textContent = total;
}

/**
 * Step Navigation
 */

function setStep(step) {
  currentStep = step;

  // Hide all steps
  document.querySelectorAll('.checkout-step').forEach(s => {
    s.classList.remove('active');
  });

  // Show current step
  document.getElementById(`step${step}`).classList.add('active');

  // Update progress indicators
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

/**
 * Checkout Data Loading
 */

function loadCheckoutData() {
  loadStep1Data();
  loadOrderSummary();
}

function loadOrderSummary() {
  try {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const orderItemsContainer = document.getElementById('orderItems');

    if (cart.length === 0) {
      // Show test data if cart is empty
      orderItemsContainer.innerHTML = '<p class="text-muted">No items in cart. Add items from the shop to proceed.</p>';
      
      // Set default summary with zero values
      document.getElementById('subtotal').textContent = storeSettings.formatCurrency(0);
      document.getElementById('shipping').textContent = storeSettings.formatCurrency(0);
      document.getElementById('tax').textContent = storeSettings.formatCurrency(0);
      document.getElementById('total').textContent = storeSettings.formatCurrency(0);
      return;
    }

    let subtotal = 0;
    let orderHTML = '';

    cart.forEach(item => {
      const itemPrice = (item.price || 99.99) * item.quantity;
      subtotal += itemPrice;

      orderHTML += `
        <div class="order-item">
          <img src="${item.image || '/assets/images/placeholder.jpg'}" alt="${item.name}" class="order-item-image">
          <div class="order-item-details flex-grow-1">
            <h5>${item.name || 'Product'}</h5>
            <p>Size: ${item.size || 'N/A'}</p>
            <p>Qty: ${item.quantity}</p>
          </div>
          <div class="text-end">
            <p class="fw-bold">${storeSettings.formatCurrency(itemPrice)}</p>
          </div>
        </div>
      `;
    });

    orderItemsContainer.innerHTML = orderHTML;
    updateSummary(subtotal);

  } catch (error) {
    console.error('Error loading order summary:', error);
    // Show error in summary
    document.getElementById('subtotal').textContent = 'Error';
    document.getElementById('total').textContent = 'Error';
  }
}

function updateSummary(subtotal) {
  const shipping = storeSettings.calculateShipping(subtotal);
  const tax = storeSettings.calculateTax(subtotal);
  const total = storeSettings.calculateGrandTotal(subtotal, shipping);

  // Debug logging
  console.log('💰 Calculation:', {
    subtotal,
    tax,
    shipping,
    total,
    settings: storeSettings.settings
  });

  // Update display
  document.getElementById('subtotal').textContent = storeSettings.formatCurrency(subtotal);
  document.getElementById('shipping').textContent = shipping === 0 ? 'Free' : storeSettings.formatCurrency(shipping);
  document.getElementById('tax').textContent = storeSettings.formatCurrency(tax);
  document.getElementById('total').textContent = storeSettings.formatCurrency(total);
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
