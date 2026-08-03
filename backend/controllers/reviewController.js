const Review = require('../models/Review');
const Product = require('../models/Product');
const User = require('../models/User');

// Get all reviews (with optional filters)
exports.getReviews = async (req, res) => {
    try {
        const { productId, isApproved, limit = 10, offset = 0 } = req.query;
        const where = {};

        if (productId) {
            where.productId = productId;
        }

        if (isApproved !== undefined) {
            where.isApproved = isApproved === 'true';
        }

        const { count, rows: reviews } = await Review.findAndCountAll({
            where,
            include: [
                {
                    model: User,
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: Product,
                    attributes: ['id', 'name']
                }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            success: true,
            total: count,
            count: reviews.length,
            reviews
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get single review
exports.getReview = async (req, res) => {
    try {
        const review = await Review.findByPk(req.params.id, {
            include: [
                {
                    model: User,
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: Product,
                    attributes: ['id', 'name']
                }
            ]
        });

        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }

        res.status(200).json({ success: true, review });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create review
exports.createReview = async (req, res) => {
    try {
        const { productId, rating, title, comment } = req.body;
        const userId = req.user.id;

        if (!productId || !rating) {
            return res.status(400).json({ error: 'Product ID and rating are required' });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        // Check if product exists
        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Check if user already reviewed this product
        const existingReview = await Review.findOne({
            where: {
                productId,
                userId
            }
        });

        if (existingReview) {
            return res.status(400).json({ error: 'You have already reviewed this product' });
        }

        const review = await Review.create({
            productId,
            userId,
            rating,
            title: title || null,
            comment: comment || null,
            isApproved: false
        });

        res.status(201).json({ success: true, review });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update review (user can update their own, admin can update approval status)
exports.updateReview = async (req, res) => {
    try {
        const review = await Review.findByPk(req.params.id);

        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }

        // User can only update their own review
        if (review.userId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized to update this review' });
        }

        // Update allowed fields
        if (req.body.rating && req.body.rating >= 1 && req.body.rating <= 5) {
            review.rating = req.body.rating;
        }
        if (req.body.title !== undefined) review.title = req.body.title;
        if (req.body.comment !== undefined) review.comment = req.body.comment;
        
        // Only admin can update approval status
        if (req.user.role === 'admin' && req.body.isApproved !== undefined) {
            review.isApproved = req.body.isApproved;
        }

        await review.save();

        res.status(200).json({ success: true, review });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Approve review (admin only)
exports.approveReview = async (req, res) => {
    try {
        const review = await Review.findByPk(req.params.id);

        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }

        review.isApproved = true;
        await review.save();

        res.status(200).json({ success: true, message: 'Review approved', review });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete review
exports.deleteReview = async (req, res) => {
    try {
        const review = await Review.findByPk(req.params.id);

        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }

        // User can delete their own, admin can delete any
        if (review.userId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized to delete this review' });
        }

        await review.destroy();

        res.status(200).json({ success: true, message: 'Review deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get product reviews (public - only approved)
exports.getProductReviews = async (req, res) => {
    try {
        const { productId, limit = 10, offset = 0 } = req.query;

        const { count, rows: reviews } = await Review.findAndCountAll({
            where: {
                productId,
                isApproved: true
            },
            include: [
                {
                    model: User,
                    attributes: ['id', 'name']
                }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            success: true,
            total: count,
            count: reviews.length,
            reviews
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
