const express = require('express');
const rateLimit = require('express-rate-limit');
const { register, login, getMe, validate, logout } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { csrfTokenGenerator } = require('../middleware/csrfProtection');

const router = express.Router();

// SECURITY: Rate limiting for login attempts (brute force protection)
// Max 5 login attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again after 15 minutes',
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  }
});

// SECURITY: Rate limiting for registration (prevent bot signups)
// Max 3 registrations per hour per IP
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registrations
  message: 'Too many accounts created from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

// SECURITY: Endpoint to get CSRF token (no auth required)
router.get('/csrf-token', csrfTokenGenerator, (req, res) => {
  res.json({ csrfToken: res.locals.csrfToken });
});

router.post('/register', registerLimiter, register);
router.post('/login', loginLimiter, login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.get('/validate', protect, validate);

module.exports = router;
