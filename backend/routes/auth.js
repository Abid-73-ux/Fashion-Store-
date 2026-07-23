const express = require('express');
const { register, login, getMe, validate } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/validate', protect, validate);

module.exports = router;
