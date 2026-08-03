/**
 * Admin Inventory Module
 * Handles inventory and stock management with backend persistence
 */

const AdminInventory = (() => {
    let products = [];
    let isLoading = false;

    const fetchProducts = async () => {
        try {
            isLoading = true;
            const token = Auth.getAdminToken();
            const response = await fetch(`${Config.API_URL}/api/products`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }

            const data = await response.json();
            if (data.success) {
                products = data.data || data.products || [];
            } else {
                products = [];
            }
            renderInventory();
        } catch (error) {
            console.error('Error fetching products:', error);
            Toast.error('Failed to load inventory');
            products = [];
            renderInventory();
        } finally {
            isLoading = false;
        }
    };

    const updateProductStock = async (productId, newStock) => {
        try {
            const token = Auth.getAdminToken();
            const response = await fetch(`${Config.API_URL}/api/products/${productId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ stock: newStock })
            });

            if (!response.ok) {
                throw new Error('Failed to update stock');
            }

            return true;
        } catch (error) {
            console.error('Error updating stock:', error);
            throw error;
        }
    };

    const renderInventory = () => {
        const tbody = document.querySelector('table tbody');
        
        if (!tbody) return;

        // Calculate inventory stats
        const lowStock = products.filter(p => p.stock < 30 && p.stock > 0).length;
        const outOfStock = products.filter(p => p.stock === 0).length;
        const inStock = products.filter(p => p.stock >= 30).length;
        const totalItems = products.reduce((sum, p) => sum + (p.stock || 0), 0);

        // Update stat cards using IDs
        const totalItemsCount = document.getElementById('totalItemsCount');
        const lowStockCount = document.getElementById('lowStockCount');
        const outOfStockCount = document.getElementById('outOfStockCount');
        const inStockCount = document.getElementById('inStockCount');

        if (totalItemsCount) totalItemsCount.textContent = totalItems;
        if (lowStockCount) lowStockCount.textContent = lowStock;
        if (outOfStockCount) outOfStockCount.textContent = outOfStock;
        if (inStockCount) inStockCount.textContent = inStock;

        // Render table
        if (products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-5">No products found. Add products to track inventory.</td></tr>';
            return;
        }

        tbody.innerHTML = products.map(product => `
            <tr>
                <td><strong>${product.name}</strong></td>
                <td>${product.sku || 'N/A'}</td>
                <td>
                    <div class="input-group input-group-sm" style="max-width: 120px;">
                        <button class="btn btn-outline-secondary stock-decrease" data-id="${product.id}">-</button>
                        <input type="number" class="form-control text-center stock-input" value="${product.stock || 0}" data-id="${product.id}" readonly>
                        <button class="btn btn-outline-secondary stock-increase" data-id="${product.id}">+</button>
                    </div>
                </td>
                <td>30</td>
                <td>
                    <span class="badge ${product.stock > 50 ? 'bg-success' : product.stock > 0 ? 'bg-warning' : 'bg-danger'}">
                        ${product.stock > 50 ? 'Good' : product.stock > 0 ? 'Low' : 'Out'}
                    </span>
                </td>
                <td><button class="btn btn-sm btn-outline-primary update-stock" data-id="${product.id}">Update</button></td>
            </tr>
        `).join('');

        attachInventoryHandlers();
    };

    const attachInventoryHandlers = () => {
        document.querySelectorAll('.stock-increase').forEach(btn => {
            btn.addEventListener('click', async () => {
                const productId = parseInt(btn.dataset.id);
                const product = products.find(p => p.id === productId);
                if (product) {
                    const newStock = (product.stock || 0) + 1;
                    try {
                        await updateProductStock(productId, newStock);
                        product.stock = newStock;
                        renderInventory();
                        Toast.success('Stock increased');
                    } catch (error) {
                        Toast.error('Failed to update stock');
                    }
                }
            });
        });

        document.querySelectorAll('.stock-decrease').forEach(btn => {
            btn.addEventListener('click', async () => {
                const productId = parseInt(btn.dataset.id);
                const product = products.find(p => p.id === productId);
                if (product && product.stock > 0) {
                    const newStock = product.stock - 1;
                    try {
                        await updateProductStock(productId, newStock);
                        product.stock = newStock;
                        renderInventory();
                        Toast.success('Stock decreased');
                    } catch (error) {
                        Toast.error('Failed to update stock');
                    }
                }
            });
        });

        document.querySelectorAll('.update-stock').forEach(btn => {
            btn.addEventListener('click', async () => {
                const productId = parseInt(btn.dataset.id);
                const product = products.find(p => p.id === productId);
                if (product) {
                    const newStock = prompt('Enter new stock quantity:', product.stock || 0);
                    
                    if (newStock !== null) {
                        const quantity = parseInt(newStock);
                        if (!isNaN(quantity) && quantity >= 0) {
                            try {
                                await updateProductStock(productId, quantity);
                                product.stock = quantity;
                                Toast.success('Stock updated successfully');
                                renderInventory();
                            } catch (error) {
                                Toast.error('Failed to update stock');
                            }
                        } else {
                            Toast.error('Please enter a valid number');
                        }
                    }
                }
            });
        });
    };

    return {
        init: () => {
            fetchProducts();
        },

        render: renderInventory
    };
})();

document.addEventListener('DOMContentLoaded', () => {
    if (document.textContent.includes('Inventory Management')) {
        AdminInventory.init();
    }
});
