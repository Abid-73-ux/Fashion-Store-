/**
 * Orders Page JavaScript - Phase 3 Implementation
 * Features: Dynamic order loading, status polling, real-time updates, status badges
 */

let ordersList = [];
let statusPollingInterval = null;

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize store settings
  await storeSettings.initialize();
  
  // Check if user is logged in
  if (!isUserLoggedIn()) {
    window.location.href = 'login.html?redirect=orders.html';
    return;
  }

  // Load orders
  await loadOrders();

  // Start polling for status updates (every 30 seconds)
  startStatusPolling();
});

// Stop polling when user leaves
window.addEventListener('beforeunload', () => {
  if (statusPollingInterval) {
    clearInterval(statusPollingInterval);
  }
});

/**
 * Load user's orders from API
 */
async function loadOrders() {
  try {
    const user = getCurrentUser();
    if (!user || !user.id) {
      showEmptyOrders();
      return;
    }

    const response = await fetch(API_CONFIG.getEndpoint(`/v1/customers/${user.id}/orders`), {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        showEmptyOrders();
        return;
      }
      throw new Error('Failed to load orders');
    }

    const result = await response.json();
    ordersList = result.data || result || [];

    if (ordersList.length === 0) {
      showEmptyOrders();
    } else {
      displayOrders(ordersList);
    }

  } catch (error) {
    console.error('Error loading orders:', error);
    showEmptyOrders();
  }
}

/**
 * Display orders in the list
 */
function displayOrders(orders) {
  const container = document.getElementById('ordersList');
  const emptyOrders = document.getElementById('emptyOrders');

  if (!orders || orders.length === 0) {
    showEmptyOrders();
    return;
  }

  // Hide empty state
  if (emptyOrders) {
    emptyOrders.classList.add('d-none');
  }

  let ordersHtml = '';

  orders.forEach(order => {
    const orderDate = new Date(order.createdAt);
    const formattedDate = orderDate.toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const statusBadge = getStatusBadge(order.orderStatus || order.status || 'pending');
    const statusExplanation = getStatusExplanation(order.orderStatus || order.status || 'pending', order.paymentMethod);
    const itemsHtml = getOrderItemsHtml(order.items || []);
    const total = order.total || 0;

    ordersHtml += `
      <div class="order-card" data-order-id="${order.orderId || order.id}">
        <div class="order-header">
          <div>
            <div class="order-number">${order.orderId || `Order #${order.id}`}</div>
            <div class="order-date">Placed on ${formattedDate}</div>
          </div>
          <div>
            ${statusBadge}
            <div class="status-explanation">${statusExplanation}</div>
          </div>
        </div>
        
        <div class="order-items">
          ${itemsHtml}
        </div>
        
        <div class="order-footer">
          <div>
            <span class="text-muted me-2" style="font-size: var(--font-size-sm);">Total:</span>
            <span class="order-total">${storeSettings.formatCurrency(total)}</span>
          </div>
          <div class="order-actions">
            <button class="btn-order-action" onclick="viewOrderDetails('${order.orderId || order.id}')">
              <i class="bi bi-eye me-1"></i> View Details
            </button>
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = ordersHtml;
}

/**
 * Get status badge HTML
 */
function getStatusBadge(status) {
  const statusMap = {
    'pending': { text: 'Pending', class: 'status-pending' },
    'confirmed': { text: 'Confirmed', class: 'status-confirmed' },
    'processing': { text: 'Processing', class: 'status-processing' },
    'shipped': { text: 'Shipped', class: 'status-shipped' },
    'delivered': { text: 'Delivered', class: 'status-delivered' },
    'cancelled': { text: 'Cancelled', class: 'status-cancelled' }
  };

  const statusInfo = statusMap[status] || { text: status, class: 'status-pending' };

  return `<span class="order-status ${statusInfo.class}">${statusInfo.text}</span>`;
}

/**
 * Get status explanation message
 */
function getStatusExplanation(status, paymentMethod) {
  const explanations = {
    'pending': paymentMethod === 'Bank_Transfer' 
      ? 'Awaiting payment verification' 
      : 'Awaiting confirmation',
    'confirmed': 'Order confirmed, preparing for dispatch',
    'processing': 'Your order is being prepared',
    'shipped': 'Your order is on the way',
    'delivered': 'Your order has been delivered',
    'cancelled': 'This order has been cancelled'
  };

  return explanations[status] || 'Processing your order';
}

/**
 * Get order items HTML
 */
function getOrderItemsHtml(items) {
  if (!items || items.length === 0) {
    return '<p class="text-muted">No items</p>';
  }

  const displayItems = items.slice(0, 3); // Show max 3 items
  let itemsHtml = displayItems.map(item => `
    <img src="${item.image || '/assets/images/placeholder.jpg'}" alt="${item.name || 'Product'}" class="order-item-image" title="${item.name}">
  `).join('');

  if (items.length > 3) {
    itemsHtml += `<div style="width: 80px; height: 100px; background: var(--gray-200); border: 1px solid var(--gray-300); display: flex; align-items: center; justify-content: center; font-weight: bold;">+${items.length - 3}</div>`;
  }

  return itemsHtml;
}

/**
 * Start polling for status updates
 */
function startStatusPolling() {
  // Poll every 30 seconds
  statusPollingInterval = setInterval(async () => {
    await checkOrderStatusUpdates();
  }, 30000);
}

/**
 * Check for order status updates
 */
async function checkOrderStatusUpdates() {
  try {
    const user = getCurrentUser();
    if (!user || !user.id) return;

    const response = await fetch(API_CONFIG.getEndpoint(`/v1/customers/${user.id}/orders`), {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) return;

    const result = await response.json();
    const newOrders = result.data || result || [];

    // Check for status changes
    newOrders.forEach(newOrder => {
      const oldOrder = ordersList.find(o => (o.orderId || o.id) === (newOrder.orderId || newOrder.id));
      
      if (oldOrder && (oldOrder.orderStatus || oldOrder.status) !== (newOrder.orderStatus || newOrder.status)) {
        // Status changed - update UI
        const orderCard = document.querySelector(`[data-order-id="${newOrder.orderId || newOrder.id}"]`);
        if (orderCard) {
          // Update status badge
          const statusBadge = getStatusBadge(newOrder.orderStatus || newOrder.status || 'pending');
          const statusExplanation = getStatusExplanation(newOrder.orderStatus || newOrder.status || 'pending', newOrder.paymentMethod);
          
          const headerDiv = orderCard.querySelector('.order-header');
          headerDiv.innerHTML = `
            <div>
              <div class="order-number">${newOrder.orderId || `Order #${newOrder.id}`}</div>
              <div class="order-date">Placed on ${new Date(newOrder.createdAt).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>
            <div>
              ${statusBadge}
              <div class="status-explanation">${statusExplanation}</div>
            </div>
          `;

          // Show notification
          showStatusUpdateNotification(newOrder.orderId || newOrder.id, newOrder.orderStatus || newOrder.status);
        }
      }
    });

    // Update stored orders
    ordersList = newOrders;

  } catch (error) {
    console.warn('Error checking order status updates:', error);
  }
}

/**
 * Show status update notification
 */
function showStatusUpdateNotification(orderId, newStatus) {
  // Try to use Toast notification if available
  if (window.Toast) {
    const statusText = getStatusBadge(newStatus).replace(/<[^>]*>/g, ''); // Strip HTML
    Toast.success(`Order ${orderId} status updated to: ${newStatus}`);
  }
}

/**
 * View order details
 */
function viewOrderDetails(orderId) {
  // Navigate to order detail page (can be implemented later)
  // For now, just open order confirmation page if orderId matches
  window.location.href = `checkout-confirmation.html?orderId=${orderId}`;
}

/**
 * Show empty orders message
 */
function showEmptyOrders() {
  const container = document.getElementById('ordersList');
  const emptyOrders = document.getElementById('emptyOrders');

  if (container) {
    container.innerHTML = '';
  }

  if (emptyOrders) {
    emptyOrders.classList.remove('d-none');
  }
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

// Handle visibility changes to pause/resume polling
document.addEventListener('visibilitychange', () => {
  if (document.hidden && statusPollingInterval) {
    clearInterval(statusPollingInterval);
    statusPollingInterval = null;
  } else if (!document.hidden && !statusPollingInterval) {
    startStatusPolling();
  }
});
