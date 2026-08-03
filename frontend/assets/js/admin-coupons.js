/**
 * Admin Coupons Module
 * Handles coupon management with backend integration
 */

const AdminCoupons = (() => {
    let coupons = [];
    let isLoading = false;

    const fetchCoupons = async () => {
        try {
            isLoading = true;
            const token = Auth.getAdminToken();
            
            if (!token) {
                throw new Error('Admin not authenticated');
            }
            
            const response = await fetch(`${Config.API_URL}/api/coupons`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch coupons');
            }

            const data = await response.json();
            if (data.success) {
                coupons = data.coupons || [];
            } else {
                coupons = [];
            }
            renderCoupons();
        } catch (error) {
            console.error('Error fetching coupons:', error);
            Toast.error('Failed to load coupons');
            coupons = [];
            renderCoupons();
        } finally {
            isLoading = false;
        }
    };

    const deleteCoupon = async (couponId) => {
        try {
            const token = Auth.getAdminToken();
            
            if (!token) {
                throw new Error('Admin not authenticated');
            }
            
            const response = await fetch(`${Config.API_URL}/api/coupons/${couponId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete coupon');
            }

            Toast.success('Coupon deleted successfully');
            fetchCoupons();
        } catch (error) {
            console.error('Error deleting coupon:', error);
            Toast.error('Failed to delete coupon');
        }
    };

    const renderCoupons = () => {
        const tbody = document.getElementById('couponsContainer');
        
        if (!tbody) {
            console.error('couponsContainer not found!');
            return;
        }

        if (coupons.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-5">No coupons found. <a href="coupons/add-edit.html">Add your first coupon</a></td></tr>';
            return;
        }

        tbody.innerHTML = coupons.map(coupon => {
            const expiryDate = new Date(coupon.expiryDate);
            const isExpired = expiryDate < new Date();
            const isActive = coupon.isActive && !isExpired;
            const discountDisplay = coupon.discountType === 'percentage' 
                ? `${coupon.discountValue}%` 
                : `Rs ${coupon.discountValue}`;

            return `
                <tr>
                    <td><strong>${coupon.code}</strong></td>
                    <td>${discountDisplay}</td>
                    <td>${coupon.discountType === 'percentage' ? 'Percentage' : 'Fixed'}</td>
                    <td>${coupon.usageCount}/${coupon.usageLimit || '∞'}</td>
                    <td>${expiryDate.toLocaleDateString()}</td>
                    <td>
                        <span class="badge ${isActive ? 'bg-success' : 'bg-danger'}">
                            ${isActive ? 'Active' : isExpired ? 'Expired' : 'Inactive'}
                        </span>
                    </td>
                    <td>
                        <div class="dropdown">
                            <button class="btn btn-sm btn-outline-secondary" type="button" data-bs-toggle="dropdown">
                                <i class="bi bi-three-dots-vertical"></i>
                            </button>
                            <ul class="dropdown-menu dropdown-menu-end">
                                <li><a class="dropdown-item" href="coupons/add-edit.html?id=${coupon.id}"><i class="bi bi-pencil me-2"></i>Edit</a></li>
                                <li><hr class="dropdown-divider"></li>
                                <li><a class="dropdown-item text-danger delete-coupon" href="#" data-id="${coupon.id}"><i class="bi bi-trash me-2"></i>Delete</a></li>
                            </ul>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        attachCouponHandlers();
    };

    const attachCouponHandlers = () => {
        document.querySelectorAll('.delete-coupon').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const couponId = parseInt(btn.dataset.id);
                const coupon = coupons.find(c => c.id === couponId);
                
                if (confirm(`Are you sure you want to delete "${coupon.code}"?`)) {
                    deleteCoupon(couponId);
                }
            });
        });
    };

    return {
        init: () => {
            fetchCoupons();
        },

        render: renderCoupons
    };
})();

// Direct initialization
document.addEventListener('DOMContentLoaded', () => {
    AdminCoupons.init();
});
