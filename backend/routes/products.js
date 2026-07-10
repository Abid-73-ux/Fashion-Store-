const express = require('express');
const {
    getProducts,
    getProduct,
    getFeaturedProducts,
    getNewArrivals,
    getBestSellers,
    getSaleProducts,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/new-arrivals', getNewArrivals);
router.get('/best-sellers', getBestSellers);
router.get('/sale', getSaleProducts);
router.get('/:id', getProduct);

// Admin only routes
router.post('/', protect, authorize('admin'), createProduct);
router.patch('/:id', protect, authorize('admin'), updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);

module.exports = router;
