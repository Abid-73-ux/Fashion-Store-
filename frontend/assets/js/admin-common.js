/**
 * Admin Common Utilities
 * Shared functionality for all admin pages including payment verification polling
 */

const AdminCommon = (() => {
    // Polling configuration
    const POLL_INTERVAL = 30000; // 30 seconds
    let pollIntervalId = null;
    let lastKnownPendingCount = 0;

    /**
     * Initialize admin common utilities
     * Call this from every admin page that loads
     */
    const init = () => {
        // Check admin authentication
        if (!Auth.isAdmin()) {
            console.warn('Admin access required');
            return false;
        }

        // Start polling for pending payment verification count
        startPendingPaymentPolling();

        // Stop polling when user leaves admin pages
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('beforeunload', stopPolling);

        return true;
    };

    /**
     * Start polling for pending payment verification orders
     */
    const startPendingPaymentPolling = () => {
        // Initial fetch
        updatePendingPaymentCount();

        // Setup polling
        if (pollIntervalId) {
            clearInterval(pollIntervalId);
        }

        pollIntervalId = setInterval(() => {
            updatePendingPaymentCount();
        }, POLL_INTERVAL);
    };

    /**
     * Stop polling
     */
    const stopPolling = () => {
        if (pollIntervalId) {
            clearInterval(pollIntervalId);
            pollIntervalId = null;
        }
    };

    /**
     * Resume polling when returning to admin page
     */
    const resumePolling = () => {
        if (!pollIntervalId) {
            startPendingPaymentPolling();
        }
    };

    /**
     * Handle visibility change (tab becomes hidden/visible)
     */
    const handleVisibilityChange = () => {
        if (document.hidden) {
            stopPolling();
        } else {
            resumePolling();
        }
    };

    /**
     * Fetch pending payment verification count from API
     */
    const updatePendingPaymentCount = async () => {
        try {
            const token = localStorage.getItem('auth-token');
            if (!token) {
                return;
            }

            // Use the API endpoint to get pending verification orders
            const endpoint = API_CONFIG.getEndpoint('/v1/admin/orders/pending-verification?page=1&limit=1');
            
            const response = await fetch(endpoint, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 401) {
                // Token expired, redirect to login
                console.warn('Admin token expired');
                Auth.logout();
                window.location.href = '/admin/login.html';
                return;
            }

            if (!response.ok) {
                console.error('Failed to fetch pending payments:', response.status);
                return;
            }

            const data = await response.json();

            if (data.success && data.data) {
                const pendingCount = data.data.pagination?.total || 0;
                lastKnownPendingCount = pendingCount;

                // Update badge on all admin pages
                updateBadges(pendingCount);
            }
        } catch (error) {
            console.error('Error fetching pending payment count:', error);
            // Don't clear the badge on error - keep the last known count
        }
    };

    /**
     * Update badges across all admin pages
     */
    const updateBadges = (count) => {
        // Update sidebar badge
        const sidebarBadge = document.getElementById('paymentVerificationBadge');
        if (sidebarBadge) {
            if (count > 0) {
                sidebarBadge.textContent = count;
                sidebarBadge.style.display = 'inline-block';
            } else {
                sidebarBadge.style.display = 'none';
            }
        }

        // Update stat card on dashboard
        const pendingPaymentsCount = document.getElementById('pendingPaymentsCount');
        if (pendingPaymentsCount) {
            pendingPaymentsCount.textContent = count;
        }

        // Update pending badge in payment verification page
        const pendingBadge = document.getElementById('pendingBadge');
        if (pendingBadge) {
            pendingBadge.textContent = `Pending: ${count}`;
        }

        // Update pending count stat on payment verification page
        const pendingCountStat = document.getElementById('pendingCount');
        if (pendingCountStat) {
            pendingCountStat.textContent = count;
        }
    };

    /**
     * Get the last known pending payment count
     */
    const getLastKnownCount = () => {
        return lastKnownPendingCount;
    };

    /**
     * Force an immediate update (e.g., after order verification)
     */
    const forceUpdate = async () => {
        await updatePendingPaymentCount();
    };

    return {
        init,
        startPolling: startPendingPaymentPolling,
        stopPolling,
        resumePolling,
        updateCount: updatePendingPaymentCount,
        forceUpdate,
        getLastKnownCount
    };
})();

// Auto-initialize when DOM is ready and page contains admin elements
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize on admin pages
    if (document.querySelector('.admin-wrapper') || document.querySelector('.admin-sidebar')) {
        AdminCommon.init();
    }
});
