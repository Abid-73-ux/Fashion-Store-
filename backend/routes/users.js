const express = require('express');
const {
    getUsers,
    getUser,
    updateProfile,
    changePassword,
    deleteUser,
    updateUserRole,
    deactivateAccount
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protected routes
router.get('/profile/:id', protect, getUser);
router.patch('/profile/update', protect, updateProfile);
router.patch('/password/change', protect, changePassword);
router.delete('/account/deactivate', protect, deactivateAccount);

// Admin only routes
router.get('/', protect, authorize('admin'), getUsers);
router.delete('/:id', protect, authorize('admin'), deleteUser);
router.patch('/:id/role', protect, authorize('admin'), updateUserRole);

module.exports = router;
