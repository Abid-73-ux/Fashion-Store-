const Product = require('../models/Product');
const Category = require('../models/Category');
const { Op } = require('sequelize');

// Get all products with filters
exports.getProducts = async (req, res) => {
    try {
        const { 
            category, 
            search, 
            sortBy = 'latest',
            limit = 12, 
            page = 1,
            minPrice,
            maxPrice,
            size,
            color,
            featured,
            newArrival,
            onSale
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const where = {};

        // Category filter
        if (category && category !== 'all') {
            where.category = category;
        }

        // Search filter
        if (search) {
            where[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { description: { [Op.iLike]: `%${search}%` } }
            ];
        }

        // Price filter
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
            if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
        }

        // Size filter - each selected size must be found in the size column
        if (size) {
            const sizeArray = Array.isArray(size) ? size : [size];
            // Create OR condition for multiple sizes
            where[Op.or] = where[Op.or] || [];
            const sizeConditions = sizeArray.map(s => ({
                size: { [Op.iLike]: `%${s}%` }
            }));
            where[Op.or] = Array.isArray(where[Op.or]) ? [...where[Op.or], ...sizeConditions] : sizeConditions;
        }

        // Color filter - each selected color must be found in the color column
        if (color) {
            const colorArray = Array.isArray(color) ? color : [color];
            // If we already have OR conditions, we need to combine properly
            if (where[Op.or]) {
                // Use AND with a nested OR for colors
                where[Op.and] = where[Op.and] || [];
                where[Op.and].push({
                    [Op.or]: colorArray.map(c => ({
                        color: { [Op.iLike]: `%${c}%` }
                    }))
                });
            } else {
                // First time adding OR, just create color conditions
                where[Op.or] = colorArray.map(c => ({
                    color: { [Op.iLike]: `%${c}%` }
                }));
            }
        }

        // Featured filter
        if (featured === 'true') {
            where.isFeatured = true;
        }

        // New arrival filter
        if (newArrival === 'true') {
            where.isNew = true;
        }

        // Sale filter
        if (onSale === 'true') {
            where.isSale = true;
        }

        // Sorting
        let order = [['createdAt', 'DESC']];
        if (sortBy === 'price_asc' || sortBy === 'price-asc') order = [['price', 'ASC']];
        if (sortBy === 'price_desc' || sortBy === 'price-desc') order = [['price', 'DESC']];
        if (sortBy === 'rating') order = [['rating', 'DESC']];
        if (sortBy === 'newest') order = [['createdAt', 'DESC']];
        if (sortBy === 'latest') order = [['createdAt', 'DESC']];

        console.log('🔍 Filtering with:', { category, search, minPrice, maxPrice, size, color });
        console.log('📋 Where clause:', JSON.stringify(where, null, 2));

        const { count, rows } = await Product.findAndCountAll({
            where,
            order,
            limit: parseInt(limit),
            offset,
            subQuery: false
        });

        res.status(200).json({
            success: true,
            data: rows.map(product => formatProductResponse(product)),
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(count / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get single product by ID
exports.getProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        
        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        res.status(200).json({ 
            success: true, 
            data: formatProductResponse(product)
        });
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get featured products
exports.getFeaturedProducts = async (req, res) => {
    try {
        const { limit = 8 } = req.query;

        const products = await Product.findAll({
            where: { isFeatured: true },
            limit: parseInt(limit),
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            success: true,
            data: products.map(product => formatProductResponse(product))
        });
    } catch (error) {
        console.error('Get featured products error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get new arrivals
exports.getNewArrivals = async (req, res) => {
    try {
        const { limit = 8 } = req.query;

        const products = await Product.findAll({
            where: { isNew: true },
            limit: parseInt(limit),
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            success: true,
            data: products.map(product => formatProductResponse(product))
        });
    } catch (error) {
        console.error('Get new arrivals error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get best sellers
exports.getBestSellers = async (req, res) => {
    try {
        const { limit = 8 } = req.query;

        const products = await Product.findAll({
            where: { isBestseller: true },
            limit: parseInt(limit),
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            success: true,
            data: products.map(product => formatProductResponse(product))
        });
    } catch (error) {
        console.error('Get best sellers error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get sale products
exports.getSaleProducts = async (req, res) => {
    try {
        const { limit = 8 } = req.query;

        const products = await Product.findAll({
            where: { isSale: true },
            limit: parseInt(limit),
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            success: true,
            data: products.map(product => formatProductResponse(product))
        });
    } catch (error) {
        console.error('Get sale products error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Create product (admin only)
exports.createProduct = async (req, res) => {
    try {
        const {
            name, description, price, salePrice, stock, sku, 
            image, images, category, size, color, material, 
            isFeatured, isNew, isBestseller, isSale
        } = req.body;

        // Validate required fields
        if (!name || !price || !sku) {
            return res.status(400).json({
                success: false,
                error: 'Name, price, and SKU are required'
            });
        }

        const product = await Product.create({
            name,
            description,
            price: parseFloat(price),
            salePrice: salePrice ? parseFloat(salePrice) : null,
            stock: parseInt(stock) || 0,
            sku,
            image,
            images: images || [],
            category,
            size,
            color,
            material,
            isFeatured: isFeatured || false,
            isNew: isNew || false,
            isBestseller: isBestseller || false,
            isSale: isSale || false
        });

        res.status(201).json({
            success: true,
            data: formatProductResponse(product)
        });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Update product (admin only)
exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        
        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        // Update fields
        Object.keys(req.body).forEach(key => {
            if (['price', 'salePrice', 'stock'].includes(key)) {
                product[key] = key === 'stock' ? parseInt(req.body[key]) : parseFloat(req.body[key]);
            } else {
                product[key] = req.body[key];
            }
        });

        await product.save();

        res.status(200).json({
            success: true,
            data: formatProductResponse(product)
        });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Delete product (admin only)
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        
        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        await product.destroy();

        res.status(200).json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Helper function to format product response
function formatProductResponse(product) {
    // Use environment-based URL for images
    const baseUrl = process.env.NODE_ENV === 'production' 
        ? 'https://fashion-store-p5m9.onrender.com'
        : 'http://localhost:5000';
    
    return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: parseFloat(product.price),
        salePrice: product.salePrice ? parseFloat(product.salePrice) : null,
        stock: product.stock,
        sku: product.sku,
        image: product.image ? `${baseUrl}/${product.image}` : null,
        imageUrl: product.image ? `${baseUrl}/${product.image}` : null,  // Alternative field name
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
