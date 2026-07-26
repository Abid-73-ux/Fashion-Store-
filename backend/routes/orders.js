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

// Task 2.3: Upload payment proof (temporary - before order creation)
// This endpoint accepts a file and creates a temporary PaymentProof record
// Returns paymentProofId to be used during order creation
router.post('/temporary/payment-proof', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
        error: { file: 'Payment proof file is required' }
      });
    }

    const fileValidation = require('../services/fileService').validateFile(req.file);
    if (!fileValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'File validation failed',
        error: { file: fileValidation.error }
      });
    }

    const fileService = require('../services/fileService');
    const saveResult = fileService.savePaymentProof(req.file, 0); // Use 0 for temporary files
    if (!saveResult.success) {
      return res.status(500).json({
        success: false,
        message: 'File upload failed',
        error: { file: saveResult.error }
      });
    }

    // Create temporary payment proof record (no orderId yet)
    const paymentProof = await require('../models/PaymentProof').create({
      filePath: saveResult.filePath,
      fileName: saveResult.fileName,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      orderId: null // Temporary - will be linked during order creation
    });

    res.status(201).json({
      success: true,
      message: 'Payment proof uploaded successfully',
      data: {
        paymentProofId: paymentProof.id,
        fileName: paymentProof.fileName,
        fileSize: paymentProof.fileSize,
        fileUrl: fileService.getFileUrl(paymentProof.filePath)
      }
    });
  } catch (error) {
    console.error('Temporary payment proof upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading payment proof',
      error: error.message
    });
  }
});

// Task 2.3: Upload payment proof (specific path with 'payment-proof')
router.post('/:orderId/payment-proof', protect, upload.single('file'), uploadPaymentProof);

// Task 2.2: Get order by orderId (catch-all GET - must be last)
router.get('/:orderId', protect, getOrder);

// Legacy: Update order (admin, catch-all PATCH - must be last)
router.patch('/:id', protect, authorize('admin'), updateOrder);

module.exports = router;
