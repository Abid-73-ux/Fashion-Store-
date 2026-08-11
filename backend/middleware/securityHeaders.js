/**
 * Security Headers Middleware
 * Implements enterprise-grade security headers
 */

const helmet = require('helmet');

/**
 * Configure all security headers
 */
exports.setupSecurityHeaders = (app) => {
    // Use Helmet for standard security headers
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
                styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net"],
                fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdn.jsdelivr.net"],
                imgSrc: ["'self'", "data:", "https:"],
                connectSrc: ["'self'", "https:"],
                frameSrc: ["'none'"],
                objectSrc: ["'none'"],
                upgradeInsecureRequests: []
            }
        },
        crossOriginEmbedderPolicy: false,
        crossOriginResourcePolicy: { policy: "cross-origin" }
    }));

    // Additional security headers
    app.use((req, res, next) => {
        // Prevent clickjacking
        res.setHeader('X-Frame-Options', 'DENY');

        // Prevent MIME-type sniffing
        res.setHeader('X-Content-Type-Options', 'nosniff');

        // Enable XSS protection
        res.setHeader('X-XSS-Protection', '1; mode=block');

        // Referrer Policy
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

        // Feature Policy
        res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

        // Remove X-Powered-By header
        res.removeHeader('X-Powered-By');

        next();
    });
};

/**
 * CORS Configuration
 */
exports.configureCORS = (corsOptions = {}) => {
    const allowedOrigins = process.env.CORS_ORIGIN?.split(',').map(origin => origin.trim()) || ['http://localhost:3000'];
    
    const defaultOptions = {
        origin: (origin, callback) => {
            // TEMPORARILY ALLOW ALL ORIGINS FOR TESTING
            return callback(null, true);
            
            /*
            // Allow requests with no origin (mobile apps, Postman, etc.)
            if (!origin) return callback(null, true);
            
            // Allow if origin is in the allowed list
            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            
            // Allow Vercel preview deployments
            if (origin.includes('vercel.app')) {
                return callback(null, true);
            }
            
            // Allow Render backend
            if (origin.includes('onrender.com')) {
                return callback(null, true);
            }
            
            callback(new Error('Not allowed by CORS'));
            */
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        maxAge: 3600,
        optionsSuccessStatus: 200
    };

    return { ...defaultOptions, ...corsOptions };
};

/**
 * Rate Limiting Middleware
 * Prevents brute force and DDoS attacks
 */
exports.rateLimiter = (windowMs = 15 * 60 * 1000, maxRequests = 100) => {
    const requests = new Map();

    return (req, res, next) => {
        const key = req.ip || req.connection.remoteAddress;
        const now = Date.now();
        const userRequests = requests.get(key) || [];

        // Remove old requests outside the time window
        const recentRequests = userRequests.filter(time => now - time < windowMs);

        if (recentRequests.length >= maxRequests) {
            return res.status(429).json({
                success: false,
                error: 'Too many requests, please try again later'
            });
        }

        recentRequests.push(now);
        requests.set(key, recentRequests);

        // Clean up old entries periodically
        if (requests.size > 10000) {
            requests.clear();
        }

        next();
    };
};

/**
 * Input Validation Middleware
 * Sanitizes inputs to prevent injection attacks
 */
exports.sanitizeInput = (req, res, next) => {
    const sanitize = (obj) => {
        if (typeof obj === 'string') {
            // Remove potential XSS vectors
            return obj
                .replace(/[<>]/g, '')
                .trim()
                .substring(0, 10000); // Max length
        }
        if (Array.isArray(obj)) {
            return obj.map(sanitize);
        }
        if (obj !== null && typeof obj === 'object') {
            const sanitized = {};
            for (const key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    sanitized[key] = sanitize(obj[key]);
                }
            }
            return sanitized;
        }
        return obj;
    };

    req.body = sanitize(req.body);
    req.query = sanitize(req.query);
    req.params = sanitize(req.params);

    next();
};

/**
 * CSRF Protection
 * (For forms if needed)
 */
exports.generateCSRFToken = () => {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
};

/**
 * Secure Cookie Configuration
 */
exports.getSecureCookieOptions = () => {
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    };
};
