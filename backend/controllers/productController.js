const Product = require('../models/Product');

// Get all products
exports.getProducts = async (req, res) => {
    try {
        const { category, search, sortBy, limit = 10, skip = 0 } = req.query;
        let query = { active: true };

        if (category) {
            query.category = category;
        }

        if (search) {
            query.$text = { $search: search };
        }

        let sort = { createdAt: -1 };
        if (sortBy === 'price-asc') sort = { price: 1 };
        if (sortBy === 'price-desc') sort = { price: -1 };
        if (sortBy === 'rating') sort = { rating: -1 };

        const products = await Product.find(query)
            .sort(sort)
            .limit(parseInt(limit))
            .skip(parseInt(skip))
            .populate('category');

        const total = await Product.countDocuments(query);

        res.status(200).json({
            success: true,
            total,
            count: products.length,
            products
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get single product
exports.getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('category');
        
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.status(200).json({ success: true, product });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create product (admin only)
exports.createProduct = async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json({ success: true, product });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update product (admin only)
exports.updateProduct = async (req, res) => {
    try {
        let product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, product });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete product (admin only)
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        await Product.findByIdAndDelete(req.params.id);

        res.status(200).json({ success: true, message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
