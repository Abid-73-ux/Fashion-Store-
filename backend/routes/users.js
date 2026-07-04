const express = require('express');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// TODO: Implement user routes
router.get('/', protect, authorize('admin'), (req, res) => {
    res.json({ message: 'GET /users - Coming soon' });
});

router.get('/:id', protect, (req, res) => {
    res.json({ message: 'GET /users/:id - Coming soon' });
});

module.exports = router;
