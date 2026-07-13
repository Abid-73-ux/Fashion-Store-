const User = require('../models/User');

// Get all users (admin only)
exports.getUsers = async (req, res) => {
    try {
        const { role, limit = 10, offset = 0 } = req.query;
        const where = {};

        if (role) {
            where.role = role;
        }

        const { count, rows: users } = await User.findAndCountAll({
            where,
            attributes: { exclude: ['password'] },
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            success: true,
            total: count,
            count: users.length,
            users
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get single user
exports.getUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if user is requesting their own profile or is admin
        if (user.id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized to view this user' });
        }

        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, phone, address, profileImage } = req.body;

        let user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update allowed fields only
        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (profileImage) user.profileImage = profileImage;
        if (address) user.address = address;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                profileImage: user.profileImage,
                address: user.address
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Change password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Please provide current and new password' });
        }

        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        await user.destroy();

        res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update user role (admin only)
exports.updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;

        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.role = role;
        await user.save();

        const userResponse = user.toJSON();
        delete userResponse.password;

        res.status(200).json({ success: true, user: userResponse });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Deactivate user account
exports.deactivateAccount = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.isActive = false;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Account deactivated successfully'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
