const express = require('express');
const {
    getReviews,
    getReview,
    createReview,
    updateReview,
    approveReview,
    deleteReview,
    getProductReviews
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/product/:productId', getProductReviews);

// Protected routes
router.post('/', protect, createReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

// Admin only routes
router.get('/', protect, authorize('admin'), getReviews);
router.get('/:id', protect, authorize('admin'), getReview);
router.patch('/:id/approve', protect, authorize('admin'), approveReview);

module.exports = router;
