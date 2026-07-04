const express = require('express');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// TODO: Implement coupon routes
router.get('/', (req, res) => {
    res.json({ message: 'GET /coupons - Coming soon' });
});

router.post('/', protect, authorize('admin'), (req, res) => {
    res.json({ message: 'POST /coupons - Coming soon' });
});

module.exports = router;
