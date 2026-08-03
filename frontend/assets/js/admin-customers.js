/**
 * Admin Customers Module
 * Handles all customer-related functionality
 */

const AdminCustomers = (() => {
    let customers = [];
    let isLoading = false;

    const fetchCustomers = async () => {
        try {
            isLoading = true;
            // Use getAdminToken() from Auth module instead of direct localStorage
            const token = Auth.getAdminToken();
            
            console.log('🔍 Fetching customers...');
            console.log('Token exists:', !!token);
            console.log('API URL:', `${Config.API_URL}/api/users?type=customers`);
            
            if (!token) {
                console.error('❌ No admin token found');
                throw new Error('Admin not authenticated');
            }
            
            const response = await fetch(`${Config.API_URL}/api/users?type=customers`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorData = await response.text();
                console.error('❌ API Error:', response.status, errorData);
                throw new Error(`Status ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ API Response received:', data);
            
            if (data.success && data.users) {
                customers = data.users;
                console.log('✅ Customers loaded:', customers.length);
            } else {
                customers = [];
                console.log('⚠️ No customers in response');
            }
            renderCustomers();
        } catch (error) {
            console.error('❌ Fetch error:', error);
            Toast.error('Failed to load customers');
            customers = [];
            renderCustomers();
        } finally {
            isLoading = false;
        }
    };

    const deleteCustomer = async (customerId) => {
        try {
            const token = Auth.getAdminToken();
            
            if (!token) {
                throw new Error('Admin not authenticated');
            }
            
            const response = await fetch(`${Config.API_URL}/api/users/${customerId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete customer');
            }

            Toast.success('Customer deleted successfully');
            fetchCustomers();
        } catch (error) {
            console.error('Error deleting customer:', error);
            Toast.error('Failed to delete customer');
        }
    };

    const renderCustomers = () => {
        const container = document.getElementById('customersContainer');
        
        if (!container) {
            console.error('❌ customersContainer not found!');
            return;
        }

        if (customers.length === 0) {
            container.innerHTML = '<div class="col-12"><div class="text-center text-muted py-5"><p>No customers found.</p></div></div>';
            return;
        }

        container.innerHTML = customers.map(customer => `
            <div class="col-lg-4 col-md-6">
                <div class="card">
                    <div class="card-body text-center">
                        <img src="${customer.profileImage || 'https://via.placeholder.com/80'}" alt="Customer" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; margin-bottom: 1rem;">
                        <h5 class="mb-2">${customer.name || 'N/A'}</h5>
                        <p class="text-muted mb-3" style="font-size: 0.9rem;">${customer.email}</p>
                        
                        <div class="row mb-3">
                            <div class="col-6">
                                <div class="p-2 bg-light">
                                    <div style="font-size: 0.8rem; color: var(--gray-600);">Member</div>
                                    <strong>${new Date(customer.createdAt).toLocaleDateString()}</strong>
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="p-2 bg-light">
                                    <div style="font-size: 0.8rem; color: var(--gray-600);">Status</div>
                                    <strong>${customer.isActive ? 'Active' : 'Inactive'}</strong>
                                </div>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <span class="badge bg-success">${customer.isActive ? 'Active' : 'Inactive'}</span>
                            <span class="badge bg-info">${customer.role || 'User'}</span>
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
                const customer = customers.find(c => c.id === customerId);
                
                if (confirm(`Are you sure you want to delete ${customer.name}?`)) {
                    deleteCustomer(customerId);
                }
            });
        });
    };

    return {
        init: () => {
            console.log('🚀 AdminCustomers initializing...');
            fetchCustomers();
        },

        render: renderCustomers,

        getCustomerStats: () => {
            const totalSpend = customers.reduce((sum, c) => sum + (c.totalSpend || 0), 0);
            return {
                total: customers.length,
                active: customers.filter(c => c.isActive).length,
                totalSpend: totalSpend,
                avgSpend: customers.length > 0 ? totalSpend / customers.length : 0
            };
        }
    };
})();
