const express = require('express');
const {
    getOrders,
    getUserOrders,
    getOrder,
    createOrder,
    updateOrder,
    cancelOrder
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protected routes
router.get('/my-orders', protect, getUserOrders);
router.post('/', protect, createOrder);
router.get('/:id', protect, getOrder);
router.patch('/:id/cancel', protect, cancelOrder);

// Admin only routes
router.get('/', protect, authorize('admin'), getOrders);
router.patch('/:id', protect, authorize('admin'), updateOrder);

module.exports = router;
