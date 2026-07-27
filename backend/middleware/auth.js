const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ error: 'Not authorized to access this route' });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            next();
        } catch (error) {
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
