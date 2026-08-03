/**
 * Admin Categories Module
 * Handles all category-related functionality
 */

const AdminCategories = (() => {
    let allCategories = [];

    const fetchCategoriesFromAPI = async () => {
        try {
            const token = localStorage.getItem('admin-token') || localStorage.getItem('token');
            const url = API_CONFIG.getEndpoint('/categories');
            
            console.log('📦 Fetching categories from API:', url);
            
            const response = await fetch(url, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });

            if (!response.ok) {
                console.warn('⚠️ Failed to fetch from API, falling back to localStorage');
                allCategories = AdminStorage.getCategories();
                return;
            }

            const result = await response.json();
            allCategories = result.data || [];
            console.log('✅ Categories fetched from API:', allCategories.length, 'categories');
        } catch (error) {
            console.error('❌ API fetch error:', error);
            console.log('📦 Falling back to localStorage');
            allCategories = AdminStorage.getCategories();
        }
    };

    const renderCategories = () => {
        console.log('🎨 renderCategories called with', allCategories.length, 'categories');
        const tbody = document.getElementById('categoriesContainer');
        
        if (!tbody) {
            console.error('❌ categoriesContainer not found!');
            return;
        }

        if (allCategories.length === 0) {
            console.warn('⚠️ No categories to display');
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-5">No categories found. <a href="categories/add-edit.html">Add your first category</a></td></tr>';
            return;
        }

        console.log('✅ Rendering', allCategories.length, 'categories');
        tbody.innerHTML = allCategories.map(category => `
            <tr>
                <td><strong>${category.name}</strong></td>
                <td><span class="text-muted">${category.description || '-'}</span></td>
                <td>
                    ${category.image ? `<img src="${category.image}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;">` : '-'}
                </td>
                <td>${category.productCount || 0}</td>
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

        console.log('✅ Table updated');
        attachCategoryHandlers();
    };

    const attachCategoryHandlers = () => {
        document.querySelectorAll('.delete-category').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const categoryId = parseInt(btn.dataset.id);
                const category = allCategories.find(c => c.id === categoryId);
                
                if (confirm(`Are you sure you want to delete "${category.name}"?`)) {
                    deleteCategoryFromAPI(categoryId);
                }
            });
        });
    };

    const deleteCategoryFromAPI = async (categoryId) => {
        try {
            const token = localStorage.getItem('admin-token') || localStorage.getItem('token');
            const url = API_CONFIG.getEndpoint(`/categories/${categoryId}`);
            
            console.log('🗑️  Deleting category:', categoryId);
            
            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete category');
            }

            Toast.success('Category deleted successfully');
            console.log('✅ Category deleted');
            
            // Also delete from localStorage for consistency
            AdminStorage.deleteCategory(categoryId);
            
            // Refresh the list
            await AdminCategories.refresh();
        } catch (error) {
            console.error('❌ Delete error:', error);
            Toast.error('Error deleting category: ' + error.message);
        }
    };

    return {
        init: async () => {
            console.log('🚀 AdminCategories.init() called');
            await fetchCategoriesFromAPI();
            renderCategories();
        },

        render: renderCategories,
        
        refresh: async () => {
            console.log('🔄 AdminCategories.refresh() called');
            await fetchCategoriesFromAPI();
            renderCategories();
        }
    };
})();

// Direct initialization
console.log('✅ admin-categories.js loaded');
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOMContentLoaded fired, initializing AdminCategories');
    AdminCategories.init();
});
