const Category = require('../models/Category');

// Get all categories
exports.getCategories = async (req, res) => {
    try {
        const { active } = req.query;
        let query = {};

        if (active !== undefined) {
            query.active = active === 'true';
        }

        const categories = await Category.find(query).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: categories.length,
            categories
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get single category
exports.getCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        res.status(200).json({ success: true, category });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create category
exports.createCategory = async (req, res) => {
    try {
        const { name, description, image } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Category name is required' });
        }

        // Check if category already exists
        const categoryExists = await Category.findOne({ name });
        if (categoryExists) {
            return res.status(400).json({ error: 'Category already exists' });
        }

        const category = await Category.create({
            name,
            description: description || null,
            image: image || null
        });

        res.status(201).json({ success: true, category });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update category
exports.updateCategory = async (req, res) => {
    try {
        let category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        // Check if new name already exists (if name is being updated)
        if (req.body.name && req.body.name !== category.name) {
            const categoryExists = await Category.findOne({ name: req.body.name });
            if (categoryExists) {
                return res.status(400).json({ error: 'Category name already exists' });
            }
        }

        category = await Category.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, category });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete category
exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        await Category.findByIdAndDelete(req.params.id);

        res.status(200).json({ success: true, message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
