const express = require('express');
const {
    getCoupons,
    getCoupon,
    getCouponByCode,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    useCoupon
} = require('../controllers/couponController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getCoupons);
router.get('/code/:code', getCouponByCode);
router.get('/:id', getCoupon);

// Protected routes
router.post('/:id/use', protect, useCoupon);

// Admin only routes
router.post('/', protect, authorize('admin'), createCoupon);
router.patch('/:id', protect, authorize('admin'), updateCoupon);
router.delete('/:id', protect, authorize('admin'), deleteCoupon);

module.exports = router;
