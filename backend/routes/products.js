const express = require('express');
const multer = require('multer');
const {
    getProducts,
    getProduct,
    getFeaturedProducts,
    getNewArrivals,
    getBestSellers,
    getSaleProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadProductImage
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Configure multer for product image uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Public routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/new-arrivals', getNewArrivals);
router.get('/best-sellers', getBestSellers);
router.get('/sale', getSaleProducts);

// IMPORTANT: Image upload route MUST come BEFORE /:id routes
// Otherwise POST /image/upload matches POST /:id pattern
router.post('/image/upload', protect, authorize('admin'), upload.single('image'), uploadProductImage);

// Product detail route (comes after specific routes)
router.get('/:id', getProduct);

// Admin only routes
router.post('/', protect, authorize('admin'), createProduct);
router.put('/:id', protect, authorize('admin'), updateProduct);
router.patch('/:id', protect, authorize('admin'), updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);

module.exports = router;
