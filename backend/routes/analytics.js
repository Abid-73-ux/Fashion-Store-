const express = require('express');
const {
    getSalesData,
    getRevenueData,
    getTopProducts,
    getCustomerGrowth,
    getDashboardStats,
    getOrderStatusBreakdown
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All analytics routes require admin authorization
router.get('/sales', protect, authorize('admin'), getSalesData);
router.get('/revenue', protect, authorize('admin'), getRevenueData);
router.get('/top-products', protect, authorize('admin'), getTopProducts);
router.get('/customer-growth', protect, authorize('admin'), getCustomerGrowth);
router.get('/dashboard', protect, authorize('admin'), getDashboardStats);
router.get('/order-status', protect, authorize('admin'), getOrderStatusBreakdown);

module.exports = router;
