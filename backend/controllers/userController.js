const User = require('../models/User');

// Get all users (admin only)
exports.getUsers = async (req, res) => {
    try {
        const { role, limit = 10, skip = 0 } = req.query;
        let query = {};

        if (role) {
            query.role = role;
        }

        const users = await User.find(query)
            .select('-password')
            .limit(parseInt(limit))
            .skip(parseInt(skip))
            .sort({ createdAt: -1 });

        const total = await User.countDocuments(query);

        res.status(200).json({
            success: true,
            total,
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
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if user is requesting their own profile or is admin
        if (user._id.toString() !== req.user.id && req.user.role !== 'admin') {
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
        const { name, phone, address, image } = req.body;

        let user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update allowed fields only
        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (image) user.image = image;
        if (address) user.address = address;

        user.updatedAt = new Date();
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                image: user.image,
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

        const user = await User.findById(req.user.id).select('+password');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }

        user.password = newPassword;
        user.updatedAt = new Date();
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
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        await User.findByIdAndDelete(req.params.id);

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

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Deactivate user account
exports.deactivateAccount = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { isActive: false, updatedAt: new Date() },
            { new: true }
        ).select('-password');

        res.status(200).json({
            success: true,
            message: 'Account deactivated successfully'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
