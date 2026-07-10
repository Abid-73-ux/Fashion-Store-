const Category = require('../models/Category');
const Product = require('../models/Product');
const { Op } = require('sequelize');

// Get all categories
exports.getCategories = async (req, res) => {
    try {
        const { active = true } = req.query;

        const where = {};
        if (active !== 'false') {
            where.isActive = true;
        }

        const categories = await Category.findAll({
            where,
            order: [['createdAt', 'DESC']]
        });

        // Get product count for each category
        const categoriesWithCount = await Promise.all(
            categories.map(async (category) => {
                const productCount = await Product.count({
                    where: { category: category.name }
                });

                return {
                    id: category.id,
                    name: category.name,
                    slug: category.slug,
                    image: category.image ? `http://localhost:5000/${category.image}` : null,
                    description: category.description,
                    isActive: category.isActive,
                    productCount,
                    createdAt: category.createdAt,
                    updatedAt: category.updatedAt
                };
            })
        );

        res.status(200).json({
            success: true,
            data: categoriesWithCount
        });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get single category
exports.getCategory = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);

        if (!category) {
            return res.status(404).json({ success: false, error: 'Category not found' });
        }

        const productCount = await Product.count({
            where: { category: category.name }
        });

        res.status(200).json({
            success: true,
            data: {
                id: category.id,
                name: category.name,
                slug: category.slug,
                image: category.image ? `http://localhost:5000/${category.image}` : null,
                description: category.description,
                isActive: category.isActive,
                productCount,
                createdAt: category.createdAt,
                updatedAt: category.updatedAt
            }
        });
    } catch (error) {
        console.error('Get category error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get category by slug
exports.getCategoryBySlug = async (req, res) => {
    try {
        const category = await Category.findOne({
            where: { slug: req.params.slug }
        });

        if (!category) {
            return res.status(404).json({ success: false, error: 'Category not found' });
        }

        const products = await Product.findAll({
            where: { category: category.name },
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            success: true,
            data: {
                id: category.id,
                name: category.name,
                slug: category.slug,
                image: category.image ? `http://localhost:5000/${category.image}` : null,
                description: category.description,
                isActive: category.isActive,
                products: products.map(p => formatProductResponse(p)),
                productCount: products.length,
                createdAt: category.createdAt,
                updatedAt: category.updatedAt
            }
        });
    } catch (error) {
        console.error('Get category by slug error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Create category (admin only)
exports.createCategory = async (req, res) => {
    try {
        const { name, slug, image, description, isActive } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                error: 'Category name is required'
            });
        }

        const category = await Category.create({
            name,
            slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
            image,
            description,
            isActive: isActive !== false
        });

        res.status(201).json({
            success: true,
            data: {
                id: category.id,
                name: category.name,
                slug: category.slug,
                image: category.image ? `http://localhost:5000/${category.image}` : null,
                description: category.description,
                isActive: category.isActive,
                productCount: 0,
                createdAt: category.createdAt,
                updatedAt: category.updatedAt
            }
        });
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Update category (admin only)
exports.updateCategory = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);

        if (!category) {
            return res.status(404).json({ success: false, error: 'Category not found' });
        }

        // Update fields
        Object.keys(req.body).forEach(key => {
            if (key !== 'id' && key !== 'createdAt') {
                category[key] = req.body[key];
            }
        });

        await category.save();

        const productCount = await Product.count({
            where: { category: category.name }
        });

        res.status(200).json({
            success: true,
            data: {
                id: category.id,
                name: category.name,
                slug: category.slug,
                image: category.image ? `http://localhost:5000/${category.image}` : null,
                description: category.description,
                isActive: category.isActive,
                productCount,
                createdAt: category.createdAt,
                updatedAt: category.updatedAt
            }
        });
    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Delete category (admin only)
exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);

        if (!category) {
            return res.status(404).json({ success: false, error: 'Category not found' });
        }

        // Check if products exist in this category
        const productCount = await Product.count({
            where: { category: category.name }
        });

        if (productCount > 0) {
            return res.status(400).json({
                success: false,
                error: `Cannot delete category with ${productCount} products. Please delete or reassign products first.`
            });
        }

        await category.destroy();

        res.status(200).json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Helper function to format product response
function formatProductResponse(product) {
    return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: parseFloat(product.price),
        salePrice: product.salePrice ? parseFloat(product.salePrice) : null,
        stock: product.stock,
        sku: product.sku,
        image: product.image ? `http://localhost:5000/${product.image}` : null,
        images: product.images || [],
        category: product.category,
        size: product.size,
        color: product.color,
        material: product.material,
        rating: parseFloat(product.rating) || 0,
        reviews: product.reviews || 0,
        inStock: product.inStock,
        isFeatured: product.isFeatured,
        isNew: product.isNew,
        isBestseller: product.isBestseller,
        isSale: product.isSale,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
    };
}
