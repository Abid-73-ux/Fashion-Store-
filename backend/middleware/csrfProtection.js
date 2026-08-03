/**
 * CSRF Protection Middleware
 * Protects against Cross-Site Request Forgery attacks
 */

const cookieParser = require('cookie-parser');
const csrf = require('csurf');

// CSRF protection middleware configuration
const csrfProtection = csrf({ 
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
    }
});

/**
 * Middleware to generate CSRF token for the response
 * Makes token available in res.locals.csrfToken
 */
const csrfTokenGenerator = (req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
};

/**
 * Middleware to check CSRF token on POST/PUT/DELETE requests
 * Can be used on specific routes that modify state
 */
const csrfCheck = (req, res, next) => {
    // Skip CSRF check for GET/HEAD/OPTIONS
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
    }

    // Check for CSRF token in multiple places
    const token = 
        req.body._csrf ||                    // Hidden form field
        req.body.csrfToken ||               // JSON body
        req.headers['x-csrf-token'] ||      // Custom header
        req.headers['csrf-token'] ||        // Alternative header
        req.query._csrf;                     // Query string (less common)

    if (!token) {
        return res.status(403).json({
            error: 'CSRF token missing',
            code: 'CSRF_TOKEN_MISSING'
        });
    }

    // Verify token
    csrfProtection(req, res, (err) => {
        if (err) {
            if (err.code === 'EBADCSRFTOKEN') {
                return res.status(403).json({
                    error: 'CSRF token invalid',
                    code: 'CSRF_TOKEN_INVALID'
                });
            }
            return next(err);
        }
        next();
    });
};

module.exports = {
    csrfProtection,
    csrfTokenGenerator,
    csrfCheck
};
