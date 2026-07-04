const express = require('express');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// TODO: Implement order routes
router.get('/', protect, (req, res) => {
    res.json({ message: 'GET /orders - Coming soon' });
});

router.post('/', protect, (req, res) => {
    res.json({ message: 'POST /orders - Coming soon' });
});

module.exports = router;
