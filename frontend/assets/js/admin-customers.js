/**
 * Admin Customers Module
 * Handles all customer-related functionality
 */

const AdminCustomers = (() => {
    const renderCustomers = () => {
        const customers = AdminStorage.getCustomers();
        const container = document.getElementById('customersContainer');
        
        if (!container) return;

        if (customers.length === 0) {
            container.innerHTML = '<div class="col-12"><div class="text-center text-muted py-5"><p>No customers found.</p></div></div>';
            return;
        }

        container.innerHTML = customers.map(customer => `
            <div class="col-lg-4 col-md-6">
                <div class="card">
                    <div class="card-body text-center">
                        <img src="${customer.image}" alt="Customer" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; margin-bottom: 1rem;">
                        <h5 class="mb-2">${customer.name}</h5>
                        <p class="text-muted mb-3" style="font-size: 0.9rem;">${customer.email}</p>
                        
                        <div class="row mb-3">
                            <div class="col-6">
                                <div class="p-2 bg-light">
                                    <div style="font-size: 0.8rem; color: var(--gray-600);">Orders</div>
                                    <strong>${customer.totalOrders}</strong>
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="p-2 bg-light">
                                    <div style="font-size: 0.8rem; color: var(--gray-600);">Spent</div>
                                    <strong>$${customer.totalSpend.toFixed(0)}</strong>
                                </div>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <span class="badge ${customer.totalOrders > 10 ? 'bg-primary' : 'bg-secondary'}">${customer.totalOrders > 10 ? 'VIP' : 'Regular'}</span>
                            <span class="badge bg-success">${customer.status}</span>
                        </div>
                        
                        <div class="d-grid gap-2">
                            <a href="customers/profile.html?id=${customer.id}" class="btn btn-outline-primary btn-sm"><i class="bi bi-eye me-2"></i>View Profile</a>
                            <button class="btn btn-outline-danger btn-sm delete-customer" data-id="${customer.id}"><i class="bi bi-trash me-2"></i>Delete</button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        attachCustomerHandlers();
    };

    const attachCustomerHandlers = () => {
        document.querySelectorAll('.delete-customer').forEach(btn => {
            btn.addEventListener('click', () => {
                const customerId = parseInt(btn.dataset.id);
                const customer = AdminStorage.getCustomer(customerId);
                
                if (confirm(`Are you sure you want to delete ${customer.name}?`)) {
                    AdminStorage.deleteCustomer(customerId);
                    Toast.success('Customer deleted successfully');
                    renderCustomers();
                }
            });
        });
    };

    return {
        init: () => {
            renderCustomers();
        },

        render: renderCustomers,

        getCustomerStats: () => {
            const customers = AdminStorage.getCustomers();
            const totalSpend = customers.reduce((sum, c) => sum + c.totalSpend, 0);
            return {
                total: customers.length,
                active: customers.filter(c => c.status === 'Active').length,
                totalSpend: totalSpend,
                avgSpend: customers.length > 0 ? totalSpend / customers.length : 0
            };
        }
    };
})();

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('customersContainer') && document.body.textContent.includes('Customer Management')) {
        AdminCustomers.init();
    }
});
