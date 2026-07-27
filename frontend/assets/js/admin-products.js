/**
 * Admin Products Module
 * Handles all product-related functionality
 */

const AdminProducts = (() => {
    let currentSearch = '';
    let currentFilter = 'All Categories';
    let currentSort = 'Latest';
    let allProducts = [];

    const fetchProductsFromAPI = async () => {
        try {
            const token = localStorage.getItem('token');
            const url = API_CONFIG.getEndpoint('/products');
            
            console.log('📦 Fetching products from API:', url);
            
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                console.warn('⚠️ Failed to fetch from API, falling back to localStorage');
                allProducts = AdminStorage.getProducts();
                return;
            }

            const result = await response.json();
            allProducts = result.data || [];
            console.log('✅ Products fetched from API:', allProducts.length, 'products');
        } catch (error) {
            console.error('❌ API fetch error, using localStorage:', error);
            allProducts = AdminStorage.getProducts();
        }
    };

    const renderProducts = () => {
        let products = [...allProducts];

        // Apply filters
        if (currentFilter !== 'All Categories') {
            products = products.filter(p => p.category === currentFilter);
        }

        // Apply search
        if (currentSearch) {
            products = products.filter(p =>
                p.name.toLowerCase().includes(currentSearch.toLowerCase()) ||
                p.sku.toLowerCase().includes(currentSearch.toLowerCase())
            );
        }

        // Apply sorting
        switch(currentSort) {
            case 'Oldest':
                products.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case 'Price: Low to High':
                products.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
                break;
            case 'Price: High to Low':
                products.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
                break;
            case 'Most Sold':
                products.sort((a, b) => (b.sold || 0) - (a.sold || 0));
                break;
            default: // Latest
                products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        const tbody = document.querySelector('table tbody');
        if (!tbody) return;

        if (products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="text-center text-muted py-5">No products found. <a href="products/add-edit.html">Add your first product</a></td></tr>';
            return;
        }

        tbody.innerHTML = products.map(product => {
            const imageUrl = product.imageUrl || product.image || 'https://via.placeholder.com/40x50?text=No+Image';
            const createdDate = new Date(product.createdAt).toLocaleDateString();
            
            return `
            <tr>
                <td><input class="form-check-input" type="checkbox" data-product-id="${product.id}"></td>
                <td>
                    <div class="d-flex align-items-center gap-2">
                        <img src="${imageUrl}" style="width: 40px; height: 50px; object-fit: cover; border-radius: 4px;" alt="${product.name}" onerror="this.src='https://via.placeholder.com/40x50?text=No+Image'">
                        <strong>${product.name}</strong>
                    </div>
                </td>
                <td>${product.sku}</td>
                <td>${product.category}</td>
                <td><strong>$${parseFloat(product.price).toFixed(2)}</strong></td>
                <td><span class="badge bg-${product.stock > 50 ? 'success' : product.stock > 0 ? 'warning' : 'danger'}">${product.stock}</span></td>
                <td><span class="badge bg-success">Active</span></td>
                <td>${createdDate}</td>
                <td>
                    <div class="dropdown">
                        <button class="btn btn-sm btn-outline-secondary" type="button" data-bs-toggle="dropdown">
                            <i class="bi bi-three-dots-vertical"></i>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end">
                            <li><a class="dropdown-item" href="products/add-edit.html?id=${product.id}"><i class="bi bi-pencil me-2"></i>Edit</a></li>
                            <li><a class="dropdown-item view-product" href="#" data-id="${product.id}"><i class="bi bi-eye me-2"></i>View</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item text-danger delete-product" href="#" data-id="${product.id}"><i class="bi bi-trash me-2"></i>Delete</a></li>
                        </ul>
                    </div>
                </td>
            </tr>
        `};
        }).join('');

        attachProductHandlers();
    };

    const attachProductHandlers = () => {
        document.querySelectorAll('.delete-product').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const productId = parseInt(btn.dataset.id);
                showDeleteConfirmation('Product', async () => {
                    try {
                        const token = localStorage.getItem('token');
                        const url = API_CONFIG.getEndpoint(`/products/${productId}`);
                        
                        const response = await fetch(url, {
                            method: 'DELETE',
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });

                        if (!response.ok) {
                            throw new Error('Failed to delete product');
                        }

                        Toast.success('Product deleted successfully');
                        // Also delete from localStorage for consistency
                        AdminStorage.deleteProduct(productId);
                        await fetchProductsFromAPI();
                        renderProducts();
                    } catch (error) {
                        console.error('Delete error:', error);
                        Toast.error('Error deleting product: ' + error.message);
                    }
                });
            });
        });

        document.querySelectorAll('.view-product').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const productId = parseInt(btn.dataset.id);
                window.location.href = `products/details.html?id=${productId}`;
            });
        });
    };

    const showDeleteConfirmation = (type, callback) => {
        const modal = new bootstrap.Modal(document.getElementById('deleteConfirmModal') || createDeleteModal());
        document.getElementById('confirmDeleteBtn').onclick = () => {
            callback();
            modal.hide();
        };
        modal.show();
    };

    const createDeleteModal = () => {
        const div = document.createElement('div');
        div.id = 'deleteConfirmModal';
        div.className = 'modal fade';
        div.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Confirm Delete</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        Are you sure you want to delete this item? This action cannot be undone.
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-danger" id="confirmDeleteBtn">Delete</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(div);
        return div;
    };

    return {
        init: async () => {
            // Fetch products from API first
            await fetchProductsFromAPI();

            // Search input
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    currentSearch = e.target.value;
                    renderProducts();
                });
            }

            // Category filter
            const categorySelect = document.querySelector('select[aria-label="Category"]') ||
                                 document.querySelectorAll('select')[0];
            if (categorySelect) {
                categorySelect.addEventListener('change', (e) => {
                    currentFilter = e.target.value;
                    renderProducts();
                });
            }

            // Sort select
            const sortSelect = document.querySelectorAll('select')[1];
            if (sortSelect) {
                sortSelect.addEventListener('change', (e) => {
                    currentSort = e.target.value;
                    renderProducts();
                });
            }

            // Reset button
            const resetBtn = document.querySelector('.btn-outline-secondary');
            if (resetBtn && resetBtn.textContent.includes('Reset')) {
                resetBtn.addEventListener('click', async () => {
                    currentSearch = '';
                    currentFilter = 'All Categories';
                    currentSort = 'Latest';
                    if (searchInput) searchInput.value = '';
                    if (categorySelect) categorySelect.value = 'All Categories';
                    if (sortSelect) sortSelect.value = 'Latest';
                    await fetchProductsFromAPI();
                    renderProducts();
                });
            }

            // Select all checkbox
            const selectAllCheckbox = document.querySelector('input[id="selectAll"]');
            if (selectAllCheckbox) {
                selectAllCheckbox.addEventListener('change', (e) => {
                    document.querySelectorAll('input[data-product-id]').forEach(cb => {
                        cb.checked = e.target.checked;
                    });
                });
            }

            renderProducts();
        },

        render: renderProducts,
        
        refresh: async () => {
            await fetchProductsFromAPI();
            renderProducts();
        }
    };
})();

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('table tbody') && document.body.querySelector('.page-title')?.textContent.includes('Product Management')) {
        AdminProducts.init();
    }
});
