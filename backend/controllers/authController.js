const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
    );
};

// SECURITY: Password length limits to prevent DoS
const MAX_PASSWORD_LENGTH = 128;
const MIN_PASSWORD_LENGTH = 8;

// Register
exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Please provide all required fields' });
        }

        // SECURITY: Prevent long password DoS attack
        if (password.length < MIN_PASSWORD_LENGTH) {
            return res.status(422).json({ error: 'Password must be at least 8 characters' });
        }

        if (password.length > MAX_PASSWORD_LENGTH) {
            return res.status(422).json({ error: 'Password cannot exceed 128 characters' });
        }

        // Check if user exists
        const userExists = await User.findOne({ where: { email } });
        if (userExists) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            role: role || 'user'
        });

        const token = generateToken(user);

        // SECURITY: Set HttpOnly cookie instead of sending token in response
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/',
            signed: false
        });

        // Don't send token in response body - it's in the secure cookie
        res.status(201).json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Please provide email and password' });
        }

        // SECURITY: Prevent long password DoS attack on login too
        if (password.length > 128) {
            return res.status(422).json({ error: 'Invalid credentials' });
        }

        // Check for user
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = generateToken(user);

        // SECURITY: Set HttpOnly cookie instead of sending token in response
        res.cookie('token', token, {
            httpOnly: true,                                                   // JavaScript cannot read
            secure: process.env.NODE_ENV === 'production',                   // HTTPS only in production
            sameSite: 'strict',                                              // CSRF protection
            maxAge: 7 * 24 * 60 * 60 * 1000,                                // 7 days
            path: '/',
            signed: false                                                    // Not signed (not needed with HttpOnly)
        });

        // Don't send token in response body - it's in the secure cookie
        res.status(200).json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get current user
exports.getMe = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Validate token
exports.validate = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(401).json({ success: false, error: 'User not found' });
        }
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Logout
exports.logout = async (req, res) => {
    try {
        // SECURITY: Clear the HttpOnly cookie
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/'
        });

        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
