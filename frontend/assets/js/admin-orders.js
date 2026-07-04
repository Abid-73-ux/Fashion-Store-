/**
 * Admin Orders Module
 * Handles all order-related functionality
 */

const AdminOrders = (() => {
    let currentSearch = '';
    let currentStatusFilter = 'All';

    const updateStats = () => {
        const orders = AdminStorage.getOrders();
        const stats = {
            pending: orders.filter(o => o.status === 'Pending' || o.status === 'Processing' || o.status === 'Packed').length,
            shipped: orders.filter(o => o.status === 'Shipped' || o.status === 'Out for Delivery').length,
            delivered: orders.filter(o => o.status === 'Delivered').length,
            cancelled: orders.filter(o => o.status === 'Cancelled').length
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

    const renderOrders = () => {
        console.log('renderOrders called');
        let orders = AdminStorage.getOrders();
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
                <td><strong>$${parseFloat(order.total).toFixed(2)}</strong></td>
                <td><span class="badge ${order.payment === 'Paid' ? 'bg-success' : 'bg-danger'}">${order.payment}</span></td>
                <td>
                    <select class="form-select form-select-sm status-select" data-order-id="${order.id}" style="width: auto; display: inline-block;">
                        <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="Processing" ${order.status === 'Processing' ? 'selected' : ''}>Processing</option>
                        <option value="Packed" ${order.status === 'Packed' ? 'selected' : ''}>Packed</option>
                        <option value="Shipped" ${order.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                        <option value="Out for Delivery" ${order.status === 'Out for Delivery' ? 'selected' : ''}>Out for Delivery</option>
                        <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                        <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </td>
                <td><a href="orders/details.html?id=${order.id}" class="btn btn-sm btn-outline-primary">View</a></td>
            </tr>
        `).join('');

        attachOrderHandlers();
        updateStats();
    };

    const attachOrderHandlers = () => {
        document.querySelectorAll('.status-select').forEach(select => {
            select.addEventListener('change', (e) => {
                const orderId = parseInt(select.dataset.orderId);
                const newStatus = e.target.value;
                AdminStorage.updateOrder(orderId, { status: newStatus });
                Toast.success(`Order status updated to ${newStatus}`);
                renderOrders();
            });
        });
    };

    return {
        init: () => {
            console.log('AdminOrders.init() called');
            renderOrders();

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

        getOrderStats: () => {
            const orders = AdminStorage.getOrders();
            return {
                pending: orders.filter(o => o.status === 'Pending' || o.status === 'Processing' || o.status === 'Packed').length,
                shipped: orders.filter(o => o.status === 'Shipped' || o.status === 'Out for Delivery').length,
                delivered: orders.filter(o => o.status === 'Delivered').length,
                cancelled: orders.filter(o => o.status === 'Cancelled').length,
                total: orders.length
            };
        }
    };
})();

console.log('admin-orders.js loaded');
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded fired');
    AdminOrders.init();
});
