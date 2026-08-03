/**
 * Admin Orders Module
 * Handles all order-related functionality
 */

const AdminOrders = (() => {
    let currentSearch = '';
    let currentStatusFilter = 'All';

    const updateStats = (orders) => {
        const stats = {
            pending: orders.filter(o => o.status === 'pending' || o.status === 'confirmed' || o.status === 'processing').length,
            shipped: orders.filter(o => o.status === 'shipped').length,
            delivered: orders.filter(o => o.status === 'delivered').length,
            cancelled: orders.filter(o => o.status === 'cancelled').length
        };

        // Update stat cards on orders page
        const pendingCount = document.getElementById('pendingCount');
        const shippedCount = document.getElementById('shippedCount');
        const deliveredCount = document.getElementById('deliveredCount');
        const cancelledCount = document.getElementById('cancelledCount');

        if (pendingCount) pendingCount.textContent = stats.pending;
        if (shippedCount) shippedCount.textContent = stats.shipped;
        if (deliveredCount) deliveredCount.textContent = stats.delivered;
        if (cancelledCount) cancelledCount.textContent = stats.cancelled;
    };

    const renderOrders = async () => {
        console.log('renderOrders called');
        let orders = await AdminStorage.getOrders();
        console.log('Orders from storage:', orders);

        // Apply search filter
        if (currentSearch) {
            orders = orders.filter(o => 
                o.orderId.toLowerCase().includes(currentSearch.toLowerCase()) ||
                o.customer.toLowerCase().includes(currentSearch.toLowerCase())
            );
        }

        // Apply status filter
        if (currentStatusFilter !== 'All') {
            orders = orders.filter(o => o.status === currentStatusFilter);
        }

        const tbody = document.querySelector('.orders-table tbody') || document.querySelector('table tbody');
        
        if (!tbody) {
            console.error('tbody not found!');
            return;
        }

        if (orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted py-5">No orders found.</td></tr>';
            updateStats();
            return;
        }

        tbody.innerHTML = orders.map(order => `
            <tr>
                <td><strong>${order.orderId}</strong></td>
                <td>${order.customer}</td>
                <td>${order.date}</td>
                <td>${order.items}</td>
                <td><strong>Rs ${parseFloat(order.total).toFixed(2)}</strong></td>
                <td><span class="badge ${order.payment === 'Paid' ? 'bg-success' : 'bg-danger'}">${order.payment}</span></td>
                <td>
                    <select class="form-select form-select-sm status-select" data-order-id="${order.id}" style="width: auto; display: inline-block;">
                        <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                        <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                        <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                        <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                        <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary view-order-btn" data-order-id="${order.id}" data-order='${JSON.stringify(order)}'>View</button>
                </td>
            </tr>
        `).join('');

        attachOrderHandlers();
        updateStats(orders);
    };

    const attachOrderHandlers = () => {
        // Status change handlers
        document.querySelectorAll('.status-select').forEach(select => {
            select.addEventListener('change', async (e) => {
                const orderId = parseInt(select.dataset.orderId);
                const newStatus = e.target.value;
                const previousStatus = select.value;
                
                // Convert status to lowercase for backend
                const backendStatus = newStatus.toLowerCase();
                
                // Find the order to get its orderId (not database id)
                const allOrders = await AdminStorage.getOrders();
                const order = allOrders.find(o => o.id === orderId);
                
                if (!order) {
                    Toast.error('Order not found');
                    return;
                }
                
                console.log('📋 Updating order status:', {
                    orderId: order.orderId,
                    currentStatus: order.status,
                    newStatus: backendStatus,
                    apiEndpoint: API_CONFIG.getEndpoint(`/orders/admin/${order.orderId}/status`)
                });
                
                // Send update to backend API
                try {
                    const token = localStorage.getItem('admin-token');
                    if (!token) {
                        Toast.error('Admin token not found');
                        return;
                    }

                    const endpoint = API_CONFIG.getEndpoint(`/orders/admin/${order.orderId}/status`);
                    console.log('🔗 Calling endpoint:', endpoint);
                    
                    const response = await fetch(endpoint, {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            orderStatus: backendStatus,
                            reason: `Status updated to ${newStatus}`
                        })
                    });

                    console.log('📊 Response status:', response.status);

                    if (!response.ok) {
                        const errorData = await response.json();
                        console.error('❌ API Error:', errorData);
                        throw new Error(errorData.message || `HTTP ${response.status}: Failed to update order status`);
                    }

                    const result = await response.json();
                    console.log('✅ Update successful:', result);
                    
                    Toast.success(`Order status updated to ${newStatus}`);
                    
                    // Refresh orders from API after a short delay
                    setTimeout(async () => {
                        try {
                            await renderOrders();
                        } catch (error) {
                            console.error('Error refreshing orders:', error);
                        }
                    }, 500);
                    
                } catch (error) {
                    console.error('❌ Error updating order status:', error);
                    Toast.error(`Failed to update: ${error.message}`);
                    // Revert the select to previous value
                    select.value = previousStatus;
                }
            });
        });

        // View order button handlers
        document.querySelectorAll('.view-order-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                try {
                    const orderData = btn.getAttribute('data-order');
                    const order = JSON.parse(orderData);
                    
                    console.log('📋 Opening order details for:', order.orderId);
                    
                    // Fetch full order details from backend API
                    const token = localStorage.getItem('admin-token');
                    if (!token) {
                        Toast.error('Admin token not found');
                        return;
                    }

                    console.log('🔗 Fetching full order details from API:', order.orderId);
                    const response = await fetch(API_CONFIG.getEndpoint(`/orders/${order.orderId}`), {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (!response.ok) {
                        console.warn('Could not fetch full order details, using cached data');
                        // Use cached data if API fails
                        if (typeof OrderDetailModal !== 'undefined') {
                            OrderDetailModal.show(order, async () => {
                                console.log('Order action completed, refreshing...');
                                await renderOrders();
                            });
                        }
                        return;
                    }

                    const result = await response.json();
                    const fullOrder = result.data || result;
                    
                    console.log('✅ Full order details fetched:', fullOrder);
                    
                    // Show order detail modal with full data
                    if (typeof OrderDetailModal !== 'undefined') {
                        OrderDetailModal.show(fullOrder, async () => {
                            console.log('Order action completed, refreshing...');
                            await renderOrders();
                        });
                    } else {
                        Toast.error('Order detail component not loaded');
                    }
                } catch (error) {
                    console.error('Error opening order details:', error);
                    Toast.error('Failed to open order details');
                }
            });
        });
    };

    return {
        init: async () => {
            console.log('AdminOrders.init() called');
            
            // Fetch orders from API
            await AdminStorage.getOrders();
            await renderOrders();

            // Setup search input
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    currentSearch = e.target.value;
                    renderOrders();
                });
            }

            // Setup status filter
            const statusFilter = document.getElementById('statusFilter');
            if (statusFilter) {
                statusFilter.addEventListener('change', (e) => {
                    currentStatusFilter = e.target.value;
                    renderOrders();
                });
            }
        },

        render: renderOrders,

        getOrderStats: async () => {
            const orders = await AdminStorage.getOrders();
            return {
                pending: orders.filter(o => o.status === 'pending' || o.status === 'confirmed' || o.status === 'processing').length,
                shipped: orders.filter(o => o.status === 'shipped').length,
                delivered: orders.filter(o => o.status === 'delivered').length,
                cancelled: orders.filter(o => o.status === 'cancelled').length,
                total: orders.length
            };
        }
    };
})();

console.log('admin-orders.js loaded');
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOMContentLoaded fired');
    if (typeof AdminOrders !== 'undefined') {
        await AdminOrders.init();
    }
});
