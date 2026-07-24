/**
 * AdminStorage Module
 * Manages all LocalStorage operations for the Admin Dashboard
 */

const AdminStorage = (() => {
    const KEYS = {
        PRODUCTS: 'admin_products',
        CATEGORIES: 'admin_categories',
        CUSTOMERS: 'admin_customers',
        ORDERS: 'admin_orders',
        REVIEWS: 'admin_reviews',
        COUPONS: 'admin_coupons',
        INVENTORY: 'admin_inventory'
    };

    // Initialize default data only once, on first load
    const initializeDefaults = () => {
        // Initialize all with empty arrays (no dummy data)
        localStorage.setItem(KEYS.PRODUCTS, JSON.stringify([]));
        localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify([]));
        localStorage.setItem(KEYS.ORDERS, JSON.stringify([]));
        localStorage.setItem(KEYS.CATEGORIES, JSON.stringify([]));
        localStorage.setItem(KEYS.COUPONS, JSON.stringify([]));
        localStorage.setItem(KEYS.REVIEWS, JSON.stringify([]));
    };

    // Call initialization once when module loads
    initializeDefaults();

    return {
        // Products
        getProducts: () => {
            return JSON.parse(localStorage.getItem(KEYS.PRODUCTS)) || [];
        },
        addProduct: (product) => {
            const products = AdminStorage.getProducts();
            product.id = Math.max(...products.map(p => p.id || 0), 0) + 1;
            product.created = new Date().toISOString();
            products.push(product);
            localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
            return product;
        },
        updateProduct: (id, updates) => {
            let products = AdminStorage.getProducts();
            products = products.map(p => p.id === id ? { ...p, ...updates } : p);
            localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
            return products.find(p => p.id === id);
        },
        deleteProduct: (id) => {
            let products = AdminStorage.getProducts();
            products = products.filter(p => p.id !== id);
            localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
        },
        getProduct: (id) => {
            return AdminStorage.getProducts().find(p => p.id === parseInt(id));
        },

        // Orders
        getOrders: async () => {
            try {
                // Try to fetch from backend first
                const token = localStorage.getItem('admin-token');
                if (!token) {
                    return JSON.parse(localStorage.getItem(KEYS.ORDERS)) || [];
                }

                const response = await fetch(API_CONFIG.getEndpoint('/orders/admin/list/all?limit=1000'), {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const result = await response.json();
                    const orders = result.data || [];
                    
                    // Map backend orders to frontend format
                    const formattedOrders = orders.map(o => ({
                        id: o.id,
                        orderId: o.orderId,
                        customer: `${o.customerFirstName || ''} ${o.customerLastName || ''}`.trim() || o.customerEmail || 'Unknown',
                        date: new Date(o.createdAt).toLocaleDateString(),
                        items: o.items?.length || 0,
                        total: o.total,
                        payment: o.paymentStatus === 'verified' ? 'Paid' : 'Pending',
                        status: o.orderStatus || o.status || 'pending'
                    }));
                    
                    // Cache in localStorage
                    localStorage.setItem(KEYS.ORDERS, JSON.stringify(formattedOrders));
                    return formattedOrders;
                } else if (response.status === 401) {
                    // Token invalid, clear admin session
                    localStorage.removeItem('admin-token');
                    localStorage.removeItem('admin-user');
                    return JSON.parse(localStorage.getItem(KEYS.ORDERS)) || [];
                } else {
                    // Fallback to localStorage
                    return JSON.parse(localStorage.getItem(KEYS.ORDERS)) || [];
                }
            } catch (error) {
                console.error('Error fetching orders:', error);
                // Fallback to localStorage
                return JSON.parse(localStorage.getItem(KEYS.ORDERS)) || [];
            }
        },
        updateOrder: (id, updates) => {
            let orders = JSON.parse(localStorage.getItem(KEYS.ORDERS)) || [];
            orders = orders.map(o => o.id === id ? { ...o, ...updates } : o);
            localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
            return orders.find(o => o.id === id);
        },
        getOrder: (id) => {
            let orders = JSON.parse(localStorage.getItem(KEYS.ORDERS)) || [];
            return orders.find(o => o.id === parseInt(id));
        },

        // Customers
        getCustomers: () => {
            return JSON.parse(localStorage.getItem(KEYS.CUSTOMERS)) || [];
        },
        addCustomer: (customer) => {
            const customers = AdminStorage.getCustomers();
            customer.id = Math.max(...customers.map(c => c.id || 0), 0) + 1;
            customers.push(customer);
            localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(customers));
            return customer;
        },
        updateCustomer: (id, updates) => {
            let customers = AdminStorage.getCustomers();
            customers = customers.map(c => c.id === id ? { ...c, ...updates } : c);
            localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(customers));
            return customers.find(c => c.id === id);
        },
        deleteCustomer: (id) => {
            let customers = AdminStorage.getCustomers();
            customers = customers.filter(c => c.id !== id);
            localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(customers));
        },
        getCustomer: (id) => {
            return AdminStorage.getCustomers().find(c => c.id === parseInt(id));
        },

        // Categories
        getCategories: () => {
            return JSON.parse(localStorage.getItem(KEYS.CATEGORIES)) || [];
        },
        addCategory: (category) => {
            const categories = AdminStorage.getCategories();
            category.id = Math.max(...categories.map(c => c.id || 0), 0) + 1;
            categories.push(category);
            localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(categories));
            return category;
        },
        updateCategory: (id, updates) => {
            let categories = AdminStorage.getCategories();
            categories = categories.map(c => c.id === id ? { ...c, ...updates } : c);
            localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(categories));
            return categories.find(c => c.id === id);
        },
        deleteCategory: (id) => {
            let categories = AdminStorage.getCategories();
            categories = categories.filter(c => c.id !== id);
            localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(categories));
        },

        // Coupons
        getCoupons: () => {
            return JSON.parse(localStorage.getItem(KEYS.COUPONS)) || [];
        },
        addCoupon: (coupon) => {
            const coupons = AdminStorage.getCoupons();
            coupon.id = Math.max(...coupons.map(c => c.id || 0), 0) + 1;
            coupons.push(coupon);
            localStorage.setItem(KEYS.COUPONS, JSON.stringify(coupons));
            return coupon;
        },
        updateCoupon: (id, updates) => {
            let coupons = AdminStorage.getCoupons();
            coupons = coupons.map(c => c.id === id ? { ...c, ...updates } : c);
            localStorage.setItem(KEYS.COUPONS, JSON.stringify(coupons));
            return coupons.find(c => c.id === id);
        },
        deleteCoupon: (id) => {
            let coupons = AdminStorage.getCoupons();
            coupons = coupons.filter(c => c.id !== id);
            localStorage.setItem(KEYS.COUPONS, JSON.stringify(coupons));
        },

        // Reviews
        getReviews: () => {
            return JSON.parse(localStorage.getItem(KEYS.REVIEWS)) || [];
        },
        updateReview: (id, updates) => {
            let reviews = AdminStorage.getReviews();
            reviews = reviews.map(r => r.id === id ? { ...r, ...updates } : r);
            localStorage.setItem(KEYS.REVIEWS, JSON.stringify(reviews));
            return reviews.find(r => r.id === id);
        },
        deleteReview: (id) => {
            let reviews = AdminStorage.getReviews();
            reviews = reviews.filter(r => r.id !== id);
            localStorage.setItem(KEYS.REVIEWS, JSON.stringify(reviews));
        },

        // Utility
        clearAll: () => {
            Object.values(KEYS).forEach(key => localStorage.removeItem(key));
            initializeDefaults();
        }
    };
})();
