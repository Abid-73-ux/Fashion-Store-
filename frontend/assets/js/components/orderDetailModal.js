/**
 * Order Detail Modal Component
 * Displays complete order information with payment proof preview
 * Allows admin to approve/reject payment
 */

const OrderDetailModal = (() => {
    const modalId = 'orderDetailModal';
    let currentOrder = null;
    let onActionCallback = null;

    /**
     * Initialize the component
     */
    const init = () => {
        setupEventListeners();
    };

    /**
     * Setup event listeners
     */
    const setupEventListeners = () => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.addEventListener('hidden.bs.modal', () => {
                currentOrder = null;
            });
        }
    };

    /**
     * Show order detail modal
     * @param {Object} order - Order object with details
     * @param {Function} callback - Callback after approval/rejection
     */
    const show = async (order, callback) => {
        currentOrder = order;
        onActionCallback = callback;

        try {
            const modalElement = document.getElementById(modalId);
            if (!modalElement) {
                console.error('Order detail modal not found');
                return;
            }

            // Render order details
            renderOrderDetails(order);

            // Show modal
            const modal = new bootstrap.Modal(modalElement);
            modal.show();

        } catch (error) {
            console.error('Error showing order detail:', error);
            Toast.error('Failed to load order details');
        }
    };

    /**
     * Render order details in modal
     */
    const renderOrderDetails = (order) => {
        const content = document.getElementById('orderDetailContent');

        const itemsHtml = order.items && order.items.length > 0
            ? order.items.map(item => `
                <tr>
                    <td>${item.productName}</td>
                    <td>${item.size || '-'}</td>
                    <td>${item.quantity}</td>
                    <td>₨${parseFloat(item.price).toFixed(2)}</td>
                    <td>₨${(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
                </tr>
            `).join('')
            : '<tr><td colspan="5" class="text-center text-muted">No items</td></tr>';

        const statusBadge = `
            <span class="badge badge-${order.paymentStatus}">
                ${capitalizeFirst(order.paymentStatus)}
            </span>
        `;

        const paymentProofSection = order.paymentProofUrl ? `
            <div class="payment-proof-section">
                <h6 class="mb-3">Payment Proof</h6>
                <img src="${order.paymentProofUrl}" alt="Payment Proof" 
                     class="proof-thumbnail" 
                     onclick="PaymentProofLightbox.open('${order.paymentProofUrl}', '${order.orderId}')">
                <p style="margin-top: 10px; font-size: 0.85rem;">
                    <i class="bi bi-info-circle"></i> Click to view full-size image
                </p>
            </div>
        ` : '<p class="text-muted">No payment proof uploaded</p>';

        const statusHistoryHtml = order.statusHistory && order.statusHistory.length > 0
            ? order.statusHistory.map(change => `
                <div class="status-change-item">
                    <small class="text-muted">${formatDate(change.createdAt)}</small>
                    <p class="mb-1">
                        <strong>${change.oldStatus}</strong> → <strong>${change.newStatus}</strong>
                    </p>
                    ${change.reason ? `<small class="text-muted">${change.reason}</small>` : ''}
                </div>
            `).join('')
            : '<p class="text-muted">No status changes</p>';

        const actionButtons = order.paymentStatus === 'pending'
            ? `
                <div class="action-buttons mt-3">
                    <button class="btn btn-success btn-sm me-2" onclick="OrderDetailModal.approvePayment()">
                        <i class="bi bi-check-circle"></i> Approve Payment
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="OrderDetailModal.rejectPayment()">
                        <i class="bi bi-x-circle"></i> Reject Payment
                    </button>
                </div>
            `
            : `
                <div class="alert alert-info mt-3">
                    <small>This payment has already been ${order.paymentStatus}</small>
                </div>
            `;

        content.innerHTML = `
            <div class="order-details">
                <!-- Order Header -->
                <div class="card mb-3">
                    <div class="card-header">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="mb-0">Order #${order.orderId}</h6>
                                <small class="text-muted">${formatDate(order.createdAt)}</small>
                            </div>
                            ${statusBadge}
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="row g-3">
                            <div class="col-md-6">
                                <h6>Customer Information</h6>
                                <p class="mb-1"><strong>${order.customerName}</strong></p>
                                <p class="mb-1"><a href="mailto:${order.customerEmail}">${order.customerEmail}</a></p>
                                <p class="mb-0"><a href="tel:${order.customerPhone}">${order.customerPhone}</a></p>
                            </div>
                            <div class="col-md-6">
                                <h6>Shipping Address</h6>
                                ${order.shippingAddress ? `
                                    <p class="mb-1">${order.shippingAddress.street}</p>
                                    <p class="mb-1">${order.shippingAddress.city}, ${order.shippingAddress.state}</p>
                                    <p class="mb-0">${order.shippingAddress.postalCode}</p>
                                ` : '<p class="text-muted">No address</p>'}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Order Items -->
                <div class="card mb-3">
                    <div class="card-header">
                        <h6 class="mb-0">Order Items</h6>
                    </div>
                    <div class="card-body p-0">
                        <div class="table-responsive">
                            <table class="table table-sm mb-0">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Size</th>
                                        <th>Qty</th>
                                        <th>Unit Price</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${itemsHtml}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Order Summary -->
                <div class="card mb-3">
                    <div class="card-header">
                        <h6 class="mb-0">Order Summary</h6>
                    </div>
                    <div class="card-body">
                        <div class="row g-2">
                            <div class="col-6"><strong>Subtotal:</strong></div>
                            <div class="col-6 text-end">₨${parseFloat(order.subtotal || 0).toFixed(2)}</div>
                            
                            <div class="col-6"><strong>Tax (${order.taxPercentage || 0}%):</strong></div>
                            <div class="col-6 text-end">₨${parseFloat(order.tax || 0).toFixed(2)}</div>
                            
                            <div class="col-6"><strong>Shipping:</strong></div>
                            <div class="col-6 text-end">₨${parseFloat(order.shipping || 0).toFixed(2)}</div>
                            
                            ${order.discount ? `
                                <div class="col-6"><strong>Discount:</strong></div>
                                <div class="col-6 text-end">-₨${parseFloat(order.discount).toFixed(2)}</div>
                            ` : ''}
                            
                            <div class="col-6"><strong>Total:</strong></div>
                            <div class="col-6 text-end"><strong>₨${parseFloat(order.total).toFixed(2)}</strong></div>
                        </div>
                    </div>
                </div>

                <!-- Payment Information -->
                <div class="card mb-3">
                    <div class="card-header">
                        <h6 class="mb-0">Payment Information</h6>
                    </div>
                    <div class="card-body">
                        <p class="mb-2"><strong>Method:</strong> ${capitalizeFirst(order.paymentMethod)}</p>
                        <p class="mb-3"><strong>Status:</strong> ${statusBadge}</p>
                        ${paymentProofSection}
                    </div>
                </div>

                <!-- Status History -->
                <div class="card mb-3">
                    <div class="card-header">
                        <h6 class="mb-0">Status History</h6>
                    </div>
                    <div class="card-body">
                        ${statusHistoryHtml}
                    </div>
                </div>

                <!-- Action Buttons -->
                ${actionButtons}
            </div>
        `;
    };

    /**
     * Approve payment
     */
    const approvePayment = async () => {
        if (!currentOrder || currentOrder.paymentStatus !== 'pending') {
            Toast.error('Invalid order state');
            return;
        }

        if (!confirm('Approve payment for order #' + currentOrder.orderId + '?')) {
            return;
        }

        try {
            const token = Auth.getToken();
            const endpoint = `${API_CONFIG.getEndpoint('/v1/admin/orders')}/${currentOrder.orderId}/verify-payment`;

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    decision: 'approve'
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            Toast.success('Payment approved successfully');

            // Close modal
            const modalElement = document.getElementById(modalId);
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) {
                modal.hide();
            }

            // Call callback
            if (onActionCallback) {
                onActionCallback();
            }

        } catch (error) {
            console.error('Error approving payment:', error);
            Toast.error('Failed to approve payment: ' + error.message);
        }
    };

    /**
     * Reject payment with reason
     */
    const rejectPayment = async () => {
        if (!currentOrder || currentOrder.paymentStatus !== 'pending') {
            Toast.error('Invalid order state');
            return;
        }

        const reason = prompt('Enter rejection reason:');
        if (reason === null) {
            return; // User cancelled
        }

        if (!reason.trim()) {
            Toast.error('Rejection reason is required');
            return;
        }

        try {
            const token = Auth.getToken();
            const endpoint = `${API_CONFIG.getEndpoint('/v1/admin/orders')}/${currentOrder.orderId}/verify-payment`;

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    decision: 'reject',
                    reason: reason
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            Toast.success('Payment rejected');

            // Close modal
            const modalElement = document.getElementById(modalId);
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) {
                modal.hide();
            }

            // Call callback
            if (onActionCallback) {
                onActionCallback();
            }

        } catch (error) {
            console.error('Error rejecting payment:', error);
            Toast.error('Failed to reject payment: ' + error.message);
        }
    };

    /**
     * Format date helper
     */
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    /**
     * Capitalize first letter helper
     */
    const capitalizeFirst = (str) => {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    // Public API
    return {
        init,
        show,
        approvePayment,
        rejectPayment
    };
})();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    OrderDetailModal.init();
});
