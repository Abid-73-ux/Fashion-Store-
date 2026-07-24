// Navigation Module - Role-Based UI
const Navigation = {
    // Update navbar based on user role
    updateNavbar() {
        console.log('🔄 Updating navbar...');
        
        // Wait for DOM to be ready
        if (document.readyState !== 'complete' && document.readyState !== 'interactive') {
            console.log('⏳ DOM not ready, waiting...');
            setTimeout(() => this.updateNavbar(), 100);
            return;
        }
        
        const user = Auth.getCurrentUser();
        const role = Auth.getCurrentRole();
        console.log('👤 Current user:', user, 'Role:', role);

        // First, try to handle the loggedInMenu/loggedOutMenu structure (newer pages)
        const loggedOutMenu = document.getElementById('loggedOutMenu');
        const loggedInMenu = document.getElementById('loggedInMenu');
        
        if (loggedOutMenu && loggedInMenu) {
            console.log('✅ Found loggedInMenu/loggedOutMenu structure');
            
            if (role === Auth.ROLES.GUEST) {
                // Guest navigation - show login button
                console.log('👥 GUEST role detected - showing LOGIN button');
                loggedOutMenu.classList.remove('d-none');
                loggedInMenu.classList.add('d-none');
            } else if (role === Auth.ROLES.CUSTOMER) {
                // Customer navigation - show profile dropdown
                console.log('✅ CUSTOMER role detected - showing profile menu');
                loggedOutMenu.classList.add('d-none');
                loggedInMenu.classList.remove('d-none');
            } else if (role === Auth.ROLES.ADMIN) {
                // Admins on customer pages - show logout button
                console.log('🔒 ADMIN role detected - showing logout button');
                loggedOutMenu.classList.remove('d-none');
                loggedInMenu.classList.add('d-none');
                
                // Change the login button to logout
                const loginBtn = loggedOutMenu.querySelector('a');
                if (loginBtn) {
                    loginBtn.textContent = 'Logout';
                    loginBtn.href = '#';
                    loginBtn.onclick = (e) => {
                        e.preventDefault();
                        Navigation.handleLogout();
                        return false;
                    };
                }
            }
        } else {
            console.log('⚠️ loggedInMenu/loggedOutMenu not found, using simple structure');
        }
        
        // ALWAYS attach logout handler to logoutBtn if it exists (works for both structures)
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            console.log('🔗 Setting up logout button handler');
            // Use onclick instead of addEventListener for better compatibility with dropdowns
            logoutBtn.onclick = function(e) {
                console.log('🖱️ Logout button click handler triggered');
                e.preventDefault();
                e.stopPropagation();
                Navigation.handleLogout();
                return false;
            };
            console.log('✅ Logout handler attached via onclick');
        } else {
            console.warn('⚠️ logoutBtn not found anywhere on page');
        }

        // Update cart count
        this.updateCartCount();
        
        // Update wishlist count
        this.updateWishlistCount();
    },

    // Handle logout
    handleLogout() {
        console.log('🔐 handleLogout() called');
        // Simple confirmation
        if (confirm('Are you sure you want to logout?')) {
            console.log('✅ User confirmed logout');
            Auth.logout();
            console.log('✅ Auth.logout() executed, localStorage cleared');
            
            // Show toast if available
            if (typeof Toast !== 'undefined') {
                Toast.success('Logged out successfully');
            }
            
            setTimeout(() => {
                console.log('🔄 Redirecting to home page...');
                // Go to home regardless of current page location
                window.location.href = 'index.html';
            }, 300);
        } else {
            console.log('❌ User cancelled logout');
        }
    },

    // Update cart count
    updateCartCount() {
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
            cartCount.textContent = count;
            cartCount.classList.toggle('d-none', count === 0);
        }
    },

    // Update wishlist count
    updateWishlistCount() {
        const wishlistCount = document.getElementById('wishlistCount');
        if (wishlistCount) {
            const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
            wishlistCount.textContent = wishlist.length;
            wishlistCount.classList.toggle('d-none', wishlist.length === 0);
        }
    },

    // Check guest restrictions
    checkGuestAction(action) {
        if (!Auth.isLoggedIn()) {
            Modal.showLoginRequired(action);
            return false;
        }
        return true;
    }
};

// Initialize navigation on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM loaded, initializing navigation...');
    if (typeof Auth !== 'undefined') {
        Navigation.updateNavbar();
    } else {
        console.error('❌ Auth module not loaded');
    }
});

// Also listen for storage changes (when logged in from another tab)
window.addEventListener('storage', () => {
    console.log('💾 Storage changed, updating navbar...');
    Navigation.updateNavbar();
});

// Initial check in case DOM is already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    console.log('📄 DOM already ready, initializing navigation immediately...');
    if (typeof Auth !== 'undefined') {
        Navigation.updateNavbar();
    }
}

console.log('✅ Navigation module loaded successfully');
