/**
 * Admin Dashboard Module
 * Handles dashboard statistics and updates
 */

const AdminDashboard = (() => {
    const updateStats = (orders) => {
        // Get all data - now fetch products from backend
        let products = [];
        let customers = [];
        
        // Use products from localStorage as fallback
        products = AdminStorage.getProducts();
        customers = AdminStorage.getCustomers();

        // Calculate stats
        const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total || 0), 0);
        const totalOrders = orders.length;
        const totalCustomers = customers.length;
        const totalProducts = products.length;
        const lowStockProducts = products.filter(p => p.stock < 20 && p.stock > 0).length;
        const outOfStockProducts = products.filter(p => p.stock === 0).length;
        const avgRating = 4.8; // Sample data
        
        // Pending orders
        const pendingOrders = orders.filter(o => 
            o.status === 'pending' || o.status === 'confirmed' || o.status === 'processing'
        ).length;
        const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
        const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;

        // Update stat cards
        const statCards = document.querySelectorAll('.stat-value');
        if (statCards.length >= 4) {
            statCards[0].textContent = 'Rs ' + totalRevenue.toFixed(0);
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

    const renderRecentOrders = (orders) => {
        const ordersSliced = orders.slice(0, 5);
        const tbody = document.querySelector('.card table tbody');
        
        if (!tbody) return;

        tbody.innerHTML = ordersSliced.map(order => `
            <tr>
                <td><strong>${order.orderId}</strong></td>
                <td>${order.customer}</td>
                <td>${order.date}</td>
                <td>${order.items}</td>
                <td><strong>Rs ${parseFloat(order.total).toFixed(2)}</strong></td>
                <td><span class="badge ${order.payment === 'Paid' ? 'bg-success' : 'bg-danger'}">${order.payment}</span></td>
                <td><span class="badge ${getStatusColor(order.status)}">${order.status}</span></td>
                <td><a href="orders/details.html?id=${order.id}" class="btn btn-sm btn-outline-primary">View</a></td>
            </tr>
        `).join('');
    };

    const getStatusColor = (status) => {
        const colors = {
            'delivered': 'bg-success',
            'shipped': 'bg-info',
            'processing': 'bg-warning',
            'confirmed': 'bg-primary',
            'cancelled': 'bg-danger',
            'pending': 'bg-secondary'
        };
        return colors[status] || 'bg-secondary';
    };

    const renderRecentCustomers = (customers = []) => {
        const customersSliced = customers.slice(0, 3);
        const container = document.querySelector('.row.g-4.mt-2 .col-lg-4 .list-group');
        
        if (!container) return;

        container.innerHTML = customersSliced.map(customer => `
            <div class="list-group-item d-flex align-items-center gap-3">
                <div class="flex-grow-1">
                    <h6 class="mb-0" style="font-size: 0.9rem;">${customer.name}</h6>
                    <small class="text-muted">${customer.email}</small>
                </div>
                <span class="badge ${customer.totalOrders > 10 ? 'bg-primary' : 'bg-secondary'}">${customer.totalOrders > 10 ? 'VIP' : 'New'}</span>
            </div>
        `).join('');
    };

    const renderTopProducts = (products = []) => {
        const productsSliced = products.slice(0, 3);
        const container = document.querySelector('.row.g-4.mt-2 .col-lg-6:last-child .list-group');
        
        if (!container) return;

        container.innerHTML = productsSliced.map(product => `
            <div class="list-group-item d-flex align-items-center gap-3">
                <img src="${product.image}" style="width: 50px; height: 60px; object-fit: cover;">
                <div class="flex-grow-1">
                    <h6 class="mb-0" style="font-size: 0.9rem;">${product.name}</h6>
                    <small class="text-muted">${product.stock} in stock</small>
                </div>
                <strong style="color: var(--secondary-color);">Rs ${product.price.toFixed(2)}</strong>
            </div>
        `).join('');
    };

    return {
        init: async () => {
            try {
                // Fetch orders from API
                const orders = await AdminStorage.getOrders();
                
                // Fetch products from API
                let products = [];
                try {
                    const token = localStorage.getItem('admin-token');
                    if (token) {
                        const response = await fetch(`${Config.API_URL}/api/products?limit=1000`, {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        });
                        if (response.ok) {
                            const data = await response.json();
                            products = data.data || [];
                        }
                    }
                } catch (error) {
                    console.log('Could not fetch products from API, using localStorage');
                    products = AdminStorage.getProducts();
                }
                
                // Fetch customers from API
                let customers = [];
                try {
                    const token = localStorage.getItem('admin-token');
                    if (token) {
                        const response = await fetch(`${Config.API_URL}/api/users?type=customers&limit=1000`, {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        });
                        if (response.ok) {
                            const data = await response.json();
                            customers = (data.data || data.users || []).map(u => ({
                                id: u.id,
                                name: u.name,
                                email: u.email,
                                image: u.profileImage || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100',
                                totalOrders: Math.floor(Math.random() * 20)
                            }));
                        }
                    }
                } catch (error) {
                    console.log('Could not fetch customers from API, using localStorage');
                    customers = AdminStorage.getCustomers();
                }
                
                // Format products for display
                const formattedProducts = products.map(p => ({
                    id: p.id,
                    name: p.name,
                    price: p.salePrice || p.price || 0,
                    image: p.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
                    stock: p.stock || 0
                }));
                
                updateStats(orders, formattedProducts, customers);
                renderRecentOrders(orders);
                renderRecentCustomers(customers);
                renderTopProducts(formattedProducts);

                // Setup listeners for storage changes
                window.addEventListener('storage', async () => {
                    const updatedOrders = await AdminStorage.getOrders();
                    updateStats(updatedOrders, formattedProducts, customers);
                    renderRecentOrders(updatedOrders);
                    renderRecentCustomers(customers);
                    renderTopProducts(formattedProducts);
                });
            } catch (error) {
                console.error('Error initializing dashboard:', error);
                // Fallback initialization
                const orders = await AdminStorage.getOrders();
                const products = AdminStorage.getProducts();
                const customers = AdminStorage.getCustomers();
                updateStats(orders, products, customers);
                renderRecentOrders(orders);
                renderRecentCustomers(customers);
                renderTopProducts(products);
            }
        },

        updateStats: (orders, products = [], customers = []) => updateStats(orders),
        refreshAll: async () => {
            await AdminDashboard.init();
        }
    };
})();

document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.page-title') && document.textContent.includes('Dashboard')) {
        AdminDashboard.init();
    }
});
