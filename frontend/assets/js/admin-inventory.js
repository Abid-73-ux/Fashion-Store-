/**
 * Admin Inventory Module
 * Handles inventory and stock management
 */

const AdminInventory = (() => {
    const renderInventory = () => {
        const products = AdminStorage.getProducts();
        const tbody = document.querySelector('table tbody');
        
        if (!tbody) return;

        // Calculate inventory stats
        const lowStock = products.filter(p => p.stock < 30 && p.stock > 0).length;
        const outOfStock = products.filter(p => p.stock === 0).length;
        const inStock = products.filter(p => p.stock >= 30).length;
        const totalItems = products.reduce((sum, p) => sum + p.stock, 0);

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
                <td>${product.sku}</td>
                <td>
                    <div class="input-group input-group-sm" style="max-width: 120px;">
                        <button class="btn btn-outline-secondary stock-decrease" data-id="${product.id}">-</button>
                        <input type="number" class="form-control text-center" value="${product.stock}" readonly>
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
            btn.addEventListener('click', () => {
                const productId = parseInt(btn.dataset.id);
                const product = AdminStorage.getProduct(productId);
                AdminStorage.updateProduct(productId, { stock: product.stock + 1 });
                renderInventory();
            });
        });

        document.querySelectorAll('.stock-decrease').forEach(btn => {
            btn.addEventListener('click', () => {
                const productId = parseInt(btn.dataset.id);
                const product = AdminStorage.getProduct(productId);
                if (product.stock > 0) {
                    AdminStorage.updateProduct(productId, { stock: product.stock - 1 });
                    renderInventory();
                }
            });
        });

        document.querySelectorAll('.update-stock').forEach(btn => {
            btn.addEventListener('click', () => {
                const productId = parseInt(btn.dataset.id);
                const product = AdminStorage.getProduct(productId);
                const newStock = prompt('Enter new stock quantity:', product.stock);
                
                if (newStock !== null) {
                    const quantity = parseInt(newStock);
                    if (!isNaN(quantity) && quantity >= 0) {
                        AdminStorage.updateProduct(productId, { stock: quantity });
                        Toast.success('Stock updated successfully');
                        renderInventory();
                    } else {
                        Toast.error('Please enter a valid number');
                    }
                }
            });
        });
    };

    return {
        init: () => {
            renderInventory();
        },

        render: renderInventory
    };
})();

document.addEventListener('DOMContentLoaded', () => {
    if (document.textContent.includes('Inventory Management')) {
        AdminInventory.init();
    }
});
