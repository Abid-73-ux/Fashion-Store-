/**
 * Admin Dashboard Module
 * Handles dashboard statistics and updates
 */

const AdminDashboard = (() => {
    const updateStats = () => {
        // Get all data
        const products = AdminStorage.getProducts();
        const orders = AdminStorage.getOrders();
        const customers = AdminStorage.getCustomers();

        // Calculate stats
        const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total), 0);
        const totalOrders = orders.length;
        const totalCustomers = customers.length;
        const totalProducts = products.length;
        const lowStockProducts = products.filter(p => p.stock < 20 && p.stock > 0).length;
        const outOfStockProducts = products.filter(p => p.stock === 0).length;
        const avgRating = 4.8; // Sample data
        
        // Pending orders
        const pendingOrders = orders.filter(o => 
            o.status === 'Pending' || o.status === 'Processing' || o.status === 'Packed'
        ).length;
        const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;
        const cancelledOrders = orders.filter(o => o.status === 'Cancelled').length;

        // Update stat cards
        const statCards = document.querySelectorAll('.stat-value');
        if (statCards.length >= 4) {
            statCards[0].textContent = '$' + totalRevenue.toFixed(0);
            statCards[1].textContent = totalOrders;
            statCards[2].textContent = totalCustomers;
            statCards[3].textContent = totalProducts;
        }

        // Update quick stats
        const quickStats = document.querySelectorAll('.row.g-3.mb-4 .stat-value');
        if (quickStats.length >= 4) {
            quickStats[0].textContent = pendingOrders;
            quickStats[1].textContent = deliveredOrders;
            quickStats[2].textContent = lowStockProducts;
            quickStats[3].textContent = avgRating;
        }

        // Update recent orders count
        const recentOrdersText = document.querySelector('.card-header .card-title');
        if (recentOrdersText && recentOrdersText.textContent.includes('Recent')) {
            const viewAllBtn = document.querySelector('.card-header .btn-outline-secondary');
            if (viewAllBtn) {
                viewAllBtn.textContent = `View All (${totalOrders})`;
            }
        }
    };

    const renderRecentOrders = () => {
        const orders = AdminStorage.getOrders().slice(0, 5);
        const tbody = document.querySelector('.card table tbody');
        
        if (!tbody) return;

        tbody.innerHTML = orders.map(order => `
            <tr>
                <td><strong>${order.orderId}</strong></td>
                <td>${order.customer}</td>
                <td>${order.date}</td>
                <td>${order.items}</td>
                <td><strong>$${parseFloat(order.total).toFixed(2)}</strong></td>
                <td><span class="badge ${order.payment === 'Paid' ? 'bg-success' : 'bg-danger'}">${order.payment}</span></td>
                <td><span class="badge ${getStatusColor(order.status)}">${order.status}</span></td>
                <td><a href="orders/details.html?id=${order.id}" class="btn btn-sm btn-outline-primary">View</a></td>
            </tr>
        `).join('');
    };

    const getStatusColor = (status) => {
        const colors = {
            'Delivered': 'bg-success',
            'Shipped': 'bg-info',
            'Processing': 'bg-warning',
            'Cancelled': 'bg-danger',
            'Pending': 'bg-secondary'
        };
        return colors[status] || 'bg-secondary';
    };

    const renderRecentCustomers = () => {
        const customers = AdminStorage.getCustomers().slice(0, 3);
        const container = document.querySelector('.row.g-4.mt-2 .col-lg-4 .list-group');
        
        if (!container) return;

        container.innerHTML = customers.map(customer => `
            <div class="list-group-item d-flex align-items-center gap-3">
                <img src="${customer.image}" style="width: 45px; height: 45px; border-radius: 50%; object-fit: cover;">
                <div class="flex-grow-1">
                    <h6 class="mb-0" style="font-size: 0.9rem;">${customer.name}</h6>
                    <small class="text-muted">${customer.email}</small>
                </div>
                <span class="badge ${customer.totalOrders > 10 ? 'bg-primary' : 'bg-secondary'}">${customer.totalOrders > 10 ? 'VIP' : 'New'}</span>
            </div>
        `).join('');
    };

    const renderTopProducts = () => {
        const products = AdminStorage.getProducts().slice(0, 3);
        const container = document.querySelector('.row.g-4.mt-2 .col-lg-6:last-child .list-group');
        
        if (!container) return;

        container.innerHTML = products.map(product => `
            <div class="list-group-item d-flex align-items-center gap-3">
                <img src="${product.image}" style="width: 50px; height: 60px; object-fit: cover;">
                <div class="flex-grow-1">
                    <h6 class="mb-0" style="font-size: 0.9rem;">${product.name}</h6>
                    <small class="text-muted">${product.stock} in stock</small>
                </div>
                <strong style="color: var(--secondary-color);">$${product.price.toFixed(2)}</strong>
            </div>
        `).join('');
    };

    return {
        init: () => {
            updateStats();
            renderRecentOrders();
            renderRecentCustomers();
            renderTopProducts();

            // Setup listeners for storage changes
            window.addEventListener('storage', () => {
                updateStats();
                renderRecentOrders();
                renderRecentCustomers();
                renderTopProducts();
            });
        },

        updateStats: updateStats,
        refreshAll: () => {
            updateStats();
            renderRecentOrders();
            renderRecentCustomers();
            renderTopProducts();
        }
    };
})();

document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.page-title') && document.textContent.includes('Dashboard')) {
        AdminDashboard.init();
    }
});
