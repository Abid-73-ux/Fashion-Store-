/**
 * Admin Categories Module
 * Handles all category-related functionality
 */

const AdminCategories = (() => {
    const renderCategories = () => {
        console.log('renderCategories called');
        const categories = AdminStorage.getCategories();
        console.log('Categories from storage:', categories);
        const tbody = document.getElementById('categoriesContainer');
        console.log('tbody element found:', tbody);
        
        if (!tbody) {
            console.error('categoriesContainer not found!');
            return;
        }

        if (categories.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-5">No categories found. <a href="categories/add-edit.html">Add your first category</a></td></tr>';
            return;
        }

        tbody.innerHTML = categories.map(category => `
            <tr>
                <td><strong>${category.name}</strong></td>
                <td><span class="text-muted">${category.description || '-'}</span></td>
                <td>
                    ${category.image ? `<img src="${category.image}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;">` : '-'}
                </td>
                <td>${category.products || 0}</td>
                <td>
                    <div class="dropdown">
                        <button class="btn btn-sm btn-outline-secondary" type="button" data-bs-toggle="dropdown">
                            <i class="bi bi-three-dots-vertical"></i>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end">
                            <li><a class="dropdown-item" href="categories/add-edit.html?id=${category.id}"><i class="bi bi-pencil me-2"></i>Edit</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item text-danger delete-category" href="#" data-id="${category.id}"><i class="bi bi-trash me-2"></i>Delete</a></li>
                        </ul>
                    </div>
                </td>
            </tr>
        `).join('');

        console.log('Rendered', categories.length, 'categories');
        attachCategoryHandlers();
    };

    const attachCategoryHandlers = () => {
        document.querySelectorAll('.delete-category').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const categoryId = parseInt(btn.dataset.id);
                const category = AdminStorage.getCategories().find(c => c.id === categoryId);
                
                if (confirm(`Are you sure you want to delete "${category.name}"?`)) {
                    AdminStorage.deleteCategory(categoryId);
                    Toast.success('Category deleted successfully');
                    renderCategories();
                }
            });
        });
    };

    return {
        init: () => {
            console.log('AdminCategories.init() called');
            renderCategories();
        },

        render: renderCategories
    };
})();

// Direct initialization
console.log('admin-categories.js loaded');
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded fired');
    AdminCategories.init();
});
