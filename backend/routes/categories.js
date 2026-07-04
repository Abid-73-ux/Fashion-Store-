const express = require('express');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// TODO: Implement category routes
router.get('/', (req, res) => {
    res.json({ message: 'GET /categories - Coming soon' });
});

router.post('/', protect, authorize('admin'), (req, res) => {
    res.json({ message: 'POST /categories - Coming soon' });
});

module.exports = router;
