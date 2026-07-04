/**
 * Admin Coupons Module
 * Handles coupon management
 */

const AdminCoupons = (() => {
    const renderCoupons = () => {
        console.log('renderCoupons called');
        const coupons = AdminStorage.getCoupons();
        console.log('Coupons from storage:', coupons);
        const tbody = document.getElementById('couponsContainer');
        console.log('tbody element found:', tbody);
        
        if (!tbody) {
            console.error('couponsContainer not found!');
            return;
        }

        if (coupons.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-5">No coupons found. <a href="coupons/add-edit.html">Add your first coupon</a></td></tr>';
            return;
        }

        tbody.innerHTML = coupons.map(coupon => `
            <tr>
                <td><strong>${coupon.code}</strong></td>
                <td>${coupon.discount}</td>
                <td>${coupon.type}</td>
                <td>${coupon.usage}</td>
                <td>${coupon.expires}</td>
                <td>
                    <span class="badge ${coupon.status === 'Active' ? 'bg-success' : 'bg-danger'}">
                        ${coupon.status}
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
        `).join('');

        console.log('Rendered', coupons.length, 'coupons');
        attachCouponHandlers();
    };

    const attachCouponHandlers = () => {
        document.querySelectorAll('.delete-coupon').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const couponId = parseInt(btn.dataset.id);
                const coupon = AdminStorage.getCoupons().find(c => c.id === couponId);
                
                if (confirm(`Are you sure you want to delete "${coupon.code}"?`)) {
                    AdminStorage.deleteCoupon(couponId);
                    Toast.success('Coupon deleted successfully');
                    renderCoupons();
                }
            });
        });
    };

    return {
        init: () => {
            console.log('AdminCoupons.init() called');
            renderCoupons();
        },

        render: renderCoupons
    };
})();

// Direct initialization
console.log('admin-coupons.js loaded');
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded fired');
    AdminCoupons.init();
});
