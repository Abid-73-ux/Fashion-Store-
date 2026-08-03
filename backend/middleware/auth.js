const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
    try {
        let token;

        // SECURITY: Check both cookie (HttpOnly) and header (for API clients)
        // Priority: Cookie > Authorization header
        if (req.cookies?.token) {
            token = req.cookies.token;  // HttpOnly cookie (most secure)
        } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];  // Fallback for API clients
        }

        if (!token) {
            return res.status(401).json({ error: 'Not authorized to access this route' });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            next();
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                // Clear expired cookie
                res.clearCookie('token');
                return res.status(401).json({ error: 'Session expired. Please login again.' });
            }
            return res.status(401).json({ error: 'Not authorized to access this route' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        console.log('🔐 Authorization Check:');
        console.log('   User ID:', req.user?.id);
        console.log('   User Role:', req.user?.role);
        console.log('   Required Roles:', roles);
        console.log('   Match:', roles.includes(req.user?.role));
        
        if (!roles.includes(req.user?.role)) {
            console.error('❌ Authorization failed - user role not in allowed roles');
            return res.status(403).json({ error: 'Not authorized to perform this action' });
        }
        console.log('✅ Authorization passed');
        next();
    };
};

module.exports = { protect, authorize };
