/**
 * Route Protection System
 * Handles frontend route access control with proper redirects
 * Mimics enterprise e-commerce platforms (Amazon, Daraz, Shopify, Nike, Adidas)
 */

const RouteProtection = (() => {
    const PUBLIC_ROUTES = [
        '/',
        '/index.html',
        '/shop.html',
        '/product.html',
        '/about.html',
        '/contact.html',
        '/faq.html',
        '/shipping.html',
        '/returns.html',
        '/login.html',
        '/register.html'
    ];

    const PROTECTED_CUSTOMER_ROUTES = [
        '/checkout.html',
        '/checkout-confirmation.html',
        '/cart.html',
        '/profile.html',
        '/orders.html',
        '/wishlist.html'
    ];

    const ADMIN_ROUTES = [
        '/admin/dashboard.html',
        '/admin/orders.html',
        '/admin/products.html',
        '/admin/categories.html',
        '/admin/customers.html',
        '/admin/reviews.html',
        '/admin/inventory.html',
        '/admin/analytics.html',
        '/admin/payment-verification.html',
        '/admin/settings.html',
        '/admin/whatsapp-support.html'
    ];

    const ADMIN_PUBLIC_ROUTES = [
        '/admin/login.html'
    ];

    /**
     * Get current page path
     */
    const getCurrentPath = () => {
        return window.location.pathname;
    };

    /**
     * Is route public?
     */
    const isPublicRoute = (path) => {
        return PUBLIC_ROUTES.some(route => path.includes(route));
    };

    /**
     * Is route protected (customer only)?
     */
    const isProtectedCustomerRoute = (path) => {
        return PROTECTED_CUSTOMER_ROUTES.some(route => path.includes(route));
    };

    /**
     * Is route admin?
     */
    const isAdminRoute = (path) => {
        return ADMIN_ROUTES.some(route => path.includes(route));
    };

    /**
     * Is route admin login page?
     */
    const isAdminLoginRoute = (path) => {
        return ADMIN_PUBLIC_ROUTES.some(route => path.includes(route));
    };

    /**
     * Validate JWT Token
     */
    const validateToken = async (token) => {
        try {
            const response = await fetch(`${Config.API_URL}/api/auth/validate`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 401) {
                return { valid: false, reason: 'EXPIRED' };
            }

            if (!response.ok) {
                return { valid: false, reason: 'INVALID' };
            }

            const data = await response.json();
            return { valid: true, user: data.user };
        } catch (error) {
            console.error('Token validation error:', error);
            return { valid: false, reason: 'ERROR' };
        }
    };

    /**
     * Validate admin token
     */
    const validateAdminToken = async (token) => {
        try {
            const response = await fetch(`${Config.API_URL}/api/auth/admin/validate`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 401) {
                return { valid: false, reason: 'EXPIRED' };
            }

            if (!response.ok) {
                return { valid: false, reason: 'INVALID' };
            }

            const data = await response.json();
            return { valid: true, user: data.user };
        } catch (error) {
            console.error('Admin token validation error:', error);
            return { valid: false, reason: 'ERROR' };
        }
    };

    /**
     * Handle expired session
     */
    const handleExpiredSession = (isAdmin = false) => {
        // Clear all auth data
        Auth.logout();
        
        // Show toast
        if (typeof Toast !== 'undefined') {
            Toast.error('Your session has expired. Please log in again.');
        }

        // Redirect
        const redirectUrl = isAdmin ? './login.html' : '/login.html';
        setTimeout(() => {
            window.location.href = redirectUrl;
        }, 1500);
    };

    /**
     * Protect customer routes
     */
    const protectCustomerRoute = async () => {
        const currentPath = getCurrentPath();

        // Check if route requires protection
        if (!isProtectedCustomerRoute(currentPath)) {
            return true;
        }

        // Get token
        const token = Auth.getToken();
        if (!token) {
            // Save intended URL
            sessionStorage.setItem('intendedUrl', window.location.href);
            window.location.href = '/login.html';
            return false;
        }

        // Validate token
        const validation = await validateToken(token);
        if (!validation.valid) {
            if (validation.reason === 'EXPIRED') {
                handleExpiredSession(false);
            } else {
                Auth.logout();
                sessionStorage.setItem('intendedUrl', window.location.href);
                window.location.href = '/login.html';
            }
            return false;
        }

        return true;
    };

    /**
     * Protect admin routes
     */
    const protectAdminRoute = async () => {
        const currentPath = getCurrentPath();

        // Allow admin login page
        if (isAdminLoginRoute(currentPath)) {
            return true;
        }

        // Check if route is admin route
        if (!isAdminRoute(currentPath)) {
            return true;
        }

        // Get admin token
        const adminToken = Auth.getAdminToken();
        if (!adminToken) {
            window.location.href = '/admin/login.html';
            return false;
        }

        // Validate admin token
        const validation = await validateAdminToken(adminToken);
        if (!validation.valid) {
            if (validation.reason === 'EXPIRED') {
                handleExpiredSession(true);
            } else {
                Auth.logoutAdmin();
                window.location.href = '/admin/login.html';
            }
            return false;
        }

        // Check admin role
        const adminUser = Auth.getCurrentAdminUser();
        if (!adminUser || adminUser.role !== 'admin') {
            window.location.href = '/admin/login.html';
            return false;
        }

        return true;
    };

    /**
     * Redirect after login
     * Returns user to intended page if saved
     */
    const redirectAfterLogin = () => {
        const intendedUrl = sessionStorage.getItem('intendedUrl');
        if (intendedUrl) {
            sessionStorage.removeItem('intendedUrl');
            window.location.href = intendedUrl;
        } else {
            window.location.href = '/profile.html';
        }
    };

    /**
     * Check cart before checkout
     */
    const checkCartBeforeCheckout = () => {
        const currentPath = getCurrentPath();
        
        if (currentPath.includes('/checkout')) {
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            if (cart.length === 0) {
                if (typeof Toast !== 'undefined') {
                    Toast.warning('Your cart is empty.');
                }
                window.location.href = '/shop.html';
                return false;
            }
        }
        return true;
    };

    /**
     * Disable browser cache for authenticated pages
     */
    const disableCacheForAuthPages = () => {
        const currentPath = getCurrentPath();
        
        if (isProtectedCustomerRoute(currentPath) || isAdminRoute(currentPath)) {
            // Set cache control headers via meta tags
            let meta = document.querySelector('meta[http-equiv="Cache-Control"]');
            if (!meta) {
                meta = document.createElement('meta');
                meta.httpEquiv = 'Cache-Control';
                meta.content = 'no-cache, no-store, must-revalidate';
                document.head.appendChild(meta);
            }

            // Prevent back button after logout
            window.addEventListener('pageshow', (event) => {
                if (event.persisted) {
                    // Page was restored from cache (back button)
                    const token = Auth.getToken();
                    const adminToken = Auth.getAdminToken();
                    
                    if (!token && !adminToken) {
                        // User is logged out, redirect
                        window.location.href = '/';
                    }
                }
            });
        }
    };

    /**
     * Initialize route protection
     */
    const init = async () => {
        // Disable cache for authenticated pages
        disableCacheForAuthPages();

        // Check cart before checkout
        if (!checkCartBeforeCheckout()) {
            return;
        }

        // Public routes - no protection needed
        if (isPublicRoute(getCurrentPath())) {
            return true;
        }

        // Protect customer routes
        if (isProtectedCustomerRoute(getCurrentPath())) {
            await protectCustomerRoute();
            return;
        }

        // Protect admin routes
        if (isAdminRoute(getCurrentPath()) || isAdminLoginRoute(getCurrentPath())) {
            await protectAdminRoute();
            return;
        }
    };

    return {
        init,
        isPublicRoute,
        isProtectedCustomerRoute,
        isAdminRoute,
        isAdminLoginRoute,
        protectCustomerRoute,
        protectAdminRoute,
        validateToken,
        validateAdminToken,
        redirectAfterLogin,
        handleExpiredSession,
        checkCartBeforeCheckout
    };
})();

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    RouteProtection.init();
});
