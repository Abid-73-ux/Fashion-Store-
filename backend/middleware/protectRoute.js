/**
 * Route Protection Middleware
 * Handles JWT validation for protected routes
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Verify JWT Token
 * Attached to req.user on success
 */
exports.verifyToken = async (req, res, next) => {
    try {
        let token;

        // Check for token in headers
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        // Make sure token exists
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                error: 'Not authorized to access this route' 
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            req.token = token;
            next();
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ 
                    success: false, 
                    error: 'Token has expired',
                    code: 'TOKEN_EXPIRED'
                });
            }
            return res.status(401).json({ 
                success: false, 
                error: 'Not authorized to access this route',
                code: 'INVALID_TOKEN'
            });
        }
    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            error: 'Server error during authentication' 
        });
    }
};

/**
 * Check if user role is allowed
 * Usage: protect(['admin', 'manager'])
 */
exports.authorize = (...roles) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ 
                    success: false, 
                    error: 'Not authenticated' 
                });
            }

            if (!roles.includes(req.user.role)) {
                return res.status(403).json({ 
                    success: false, 
                    error: 'Not authorized to access this route',
                    code: 'FORBIDDEN'
                });
            }

            next();
        } catch (error) {
            return res.status(500).json({ 
                success: false, 
                error: 'Server error during authorization' 
            });
        }
    };
};

/**
 * Admin Only Middleware
 */
exports.adminOnly = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ 
                success: false, 
                error: 'Not authenticated' 
            });
        }

        if (req.user.role !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                error: 'Only admins can access this route',
                code: 'ADMIN_ONLY'
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            error: 'Server error during admin check' 
        });
    }
};

/**
 * Verify user owns the resource
 * Usage: verifyOwnership('userId', 'id')
 * Checks if req.params.id matches req.user.id
 */
exports.verifyOwnership = (paramName = 'id') => {
    return async (req, res, next) => {
        try {
            const resourceId = req.params[paramName];
            const userId = req.user.id;

            if (resourceId !== userId.toString() && req.user.role !== 'admin') {
                return res.status(403).json({ 
                    success: false, 
                    error: 'You do not have permission to access this resource',
                    code: 'OWNERSHIP_DENIED'
                });
            }

            next();
        } catch (error) {
            return res.status(500).json({ 
                success: false, 
                error: 'Server error during ownership verification' 
            });
        }
    };
};

/**
 * Verify user owns the order
 * Checks if order belongs to the requesting user
 */
exports.verifyOrderOwnership = async (req, res, next) => {
    try {
        const Order = require('../models/Order');
        const orderId = req.params.id;
        const userId = req.user.id;

        const order = await Order.findByPk(orderId);
        
        if (!order) {
            return res.status(404).json({ 
                success: false, 
                error: 'Order not found',
                code: 'ORDER_NOT_FOUND'
            });
        }

        // Check if user owns the order or is admin
        if (order.userId !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                error: 'You do not have permission to view this order',
                code: 'ORDER_ACCESS_DENIED'
            });
        }

        req.order = order;
        next();
    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            error: 'Server error during order verification' 
        });
    }
};
