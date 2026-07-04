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
        // Only initialize if keys don't exist yet
        if (!localStorage.getItem(KEYS.PRODUCTS)) {
            localStorage.setItem(KEYS.PRODUCTS, JSON.stringify([]));
        }
        if (!localStorage.getItem(KEYS.CUSTOMERS)) {
            localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify([]));
        }
        if (!localStorage.getItem(KEYS.ORDERS)) {
            localStorage.setItem(KEYS.ORDERS, JSON.stringify([]));
        }
        if (!localStorage.getItem(KEYS.CATEGORIES)) {
            localStorage.setItem(KEYS.CATEGORIES, JSON.stringify([]));
        }
        if (!localStorage.getItem(KEYS.COUPONS)) {
            localStorage.setItem(KEYS.COUPONS, JSON.stringify([]));
        }
        if (!localStorage.getItem(KEYS.REVIEWS)) {
            localStorage.setItem(KEYS.REVIEWS, JSON.stringify([]));
        }
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
        getOrders: () => {
            return JSON.parse(localStorage.getItem(KEYS.ORDERS)) || [];
        },
        updateOrder: (id, updates) => {
            let orders = AdminStorage.getOrders();
            orders = orders.map(o => o.id === id ? { ...o, ...updates } : o);
            localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
            return orders.find(o => o.id === id);
        },
        getOrder: (id) => {
            return AdminStorage.getOrders().find(o => o.id === parseInt(id));
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
