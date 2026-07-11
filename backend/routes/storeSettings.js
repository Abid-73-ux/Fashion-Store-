/**
 * Store Settings Routes
 * API endpoints for getting and updating store configuration
 */

const express = require('express');
const router = express.Router();
const storeSettingsController = require('../controllers/storeSettingsController');

// Get current store settings (public)
router.get('/', storeSettingsController.getSettings);

// Update store settings (admin only - add auth middleware as needed)
router.put('/', storeSettingsController.updateSettings);

// Reset to default settings (admin only)
router.post('/reset', storeSettingsController.resetSettings);

module.exports = router;
