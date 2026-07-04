// Navigation Module - Role-Based UI
const Navigation = {
    // Update navbar based on user role
    updateNavbar() {
        console.log('Updating navbar...');
        const user = Auth.getCurrentUser();
        const role = Auth.getCurrentRole();
        console.log('Current user:', user, 'Role:', role);

        // Update user menu
        const userMenuContainer = document.getElementById('userMenuContainer');
        if (!userMenuContainer) {
            console.warn('userMenuContainer not found');
            return;
        }

        if (role === Auth.ROLES.GUEST) {
            // Guest navigation
            userMenuContainer.innerHTML = `
                <a href="login.html" class="btn btn-sm" style="background: var(--primary-color); color: var(--white); padding: 0.5rem 1.5rem; letter-spacing: 0.1em; text-transform: uppercase; font-size: 0.75rem;">Login</a>
            `;
        } else if (role === Auth.ROLES.CUSTOMER) {
            // Customer navigation
            userMenuContainer.innerHTML = `
                <div class="dropdown">
                    <button class="btn btn-link text-dark p-0 dropdown-toggle d-flex align-items-center gap-2" type="button" id="userDropdown" data-bs-toggle="dropdown" style="text-decoration: none;">
                        <img src="${user.avatar}" alt="Profile" style="width: 35px; height: 35px; border-radius: 50%; object-fit: cover; border: 2px solid var(--secondary-color);">
                        <span class="d-none d-lg-inline" style="font-size: 0.875rem; color: var(--gray-800);">${user.name}</span>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end border-0 shadow-lg" style="min-width: 200px;">
                        <li><a class="dropdown-item" href="profile.html"><i class="bi bi-person me-2"></i>My Profile</a></li>
                        <li><a class="dropdown-item" href="orders.html"><i class="bi bi-box-seam me-2"></i>My Orders</a></li>
                        <li><a class="dropdown-item" href="wishlist.html"><i class="bi bi-heart me-2"></i>Wishlist</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item text-danger" href="#" id="logoutBtn"><i class="bi bi-box-arrow-right me-2"></i>Logout</a></li>
                    </ul>
                </div>
            `;

            // Add logout handler
            setTimeout(() => {
                const logoutBtn = document.getElementById('logoutBtn');
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        Navigation.handleLogout();
                    });
                }
            }, 100);
        } else if (role === Auth.ROLES.ADMIN) {
            // Admin navigation
            userMenuContainer.innerHTML = `
                <a href="admin/dashboard.html" class="btn btn-sm" style="background: var(--secondary-color); color: var(--white); padding: 0.5rem 1.5rem; letter-spacing: 0.1em; text-transform: uppercase; font-size: 0.75rem;">
                    <i class="bi bi-speedometer2 me-1"></i> Dashboard
                </a>
            `;
        }

        // Update cart count
        this.updateCartCount();
        
        // Update wishlist count
        this.updateWishlistCount();
    },

    // Handle logout
    handleLogout() {
        Modal.showLogoutConfirm(() => {
            Auth.logout();
            Toast.success('Logged out successfully');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        });
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
    console.log('DOM loaded, initializing navigation...');
    if (typeof Auth !== 'undefined') {
        Navigation.updateNavbar();
    } else {
        console.error('Auth module not loaded');
    }
});

console.log('Navigation module loaded successfully');
