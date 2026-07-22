const express = require('express');
const multer = require('multer');
const {
    getOrders,
    getUserOrders,
    getOrder,
    createOrder,
    uploadPaymentProof,
    verifyPayment,
    updateOrderStatus,
    getPendingVerificationOrders,
    updateOrder,
    cancelOrder
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads (memory storage for direct file handling)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Validate MIME type
        const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only JPG, PNG, and WebP images are allowed'));
        }
    }
});

// ==================== Phase 2 & Legacy Routes ====================
// NOTE: Order matters! Specific routes before wildcard routes

// Task 2.1: Create order
router.post('/create', protect, createOrder);

// Task 2.6: Admin get pending verification orders (specific path)
router.get('/admin/pending-verification', protect, authorize('admin'), getPendingVerificationOrders);

// Task 2.4: Admin verify payment (specific path)
router.post('/admin/verify-payment/:orderId', protect, authorize('admin'), verifyPayment);

// Task 2.5: Admin update order status (specific path)
router.put('/admin/:orderId/status', protect, authorize('admin'), updateOrderStatus);

// Legacy: Get all orders (admin, specific path)
router.get('/admin/list/all', protect, authorize('admin'), getOrders);

// Legacy: Get user orders (specific path)
router.get('/my-orders', protect, getUserOrders);

// Legacy: Cancel order (specific path with 'cancel')
router.patch('/:id/cancel', protect, cancelOrder);

// Task 2.3: Upload payment proof (specific path with 'payment-proof')
router.post('/:orderId/payment-proof', protect, upload.single('file'), uploadPaymentProof);

// Task 2.2: Get order by orderId (catch-all GET - must be last)
router.get('/:orderId', protect, getOrder);

// Legacy: Update order (admin, catch-all PATCH - must be last)
router.patch('/:id', protect, authorize('admin'), updateOrder);

module.exports = router;
