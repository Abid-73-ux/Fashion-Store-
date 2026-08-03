/**
 * Audit Log Service
 * Logs all sensitive operations for compliance and security monitoring
 * 
 * Logs: Admin actions, payment verification, price changes, order updates
 */

const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const LOGS_DIR = path.join(__dirname, '../logs');
if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
}

const AUDIT_LOG_FILE = path.join(LOGS_DIR, 'audit.log');

/**
 * Log an audit event
 * @param {string} action - Action performed (e.g., 'PAYMENT_VERIFIED', 'ORDER_CANCELLED')
 * @param {number} userId - ID of user performing action
 * @param {number} resourceId - ID of resource being modified
 * @param {string} resourceType - Type of resource ('order', 'product', 'user', etc.)
 * @param {*} oldValue - Previous value
 * @param {*} newValue - New value
 * @param {Object} details - Additional context
 */
exports.log = (action, userId, resourceId, resourceType = 'unknown', oldValue = null, newValue = null, details = {}) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        action,              // What action was performed
        userId,              // Who performed it
        resourceId,          // What was modified
        resourceType,        // Type of resource
        oldValue,            // Before state
        newValue,            // After state
        ipAddress: details.ipAddress || 'unknown',
        userAgent: details.userAgent || 'unknown',
        reason: details.reason || null,
        error: details.error || null
    };

    // Stringify and write to log
    const logLine = JSON.stringify(logEntry) + '\n';
    
    try {
        fs.appendFileSync(AUDIT_LOG_FILE, logLine);
    } catch (err) {
        console.error('🔴 Failed to write audit log:', err.message);
    }

    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
        console.log(`\n🔍 AUDIT LOG:`);
        console.log(`  Action: ${action}`);
        console.log(`  User: ${userId}`);
        console.log(`  Resource: ${resourceType}:${resourceId}`);
        console.log(`  Changed: ${JSON.stringify(oldValue)} → ${JSON.stringify(newValue)}`);
        if (details.reason) console.log(`  Reason: ${details.reason}`);
        if (details.error) console.log(`  Error: ${details.error}`);
        console.log();
    }
};

/**
 * Log payment verification action
 */
exports.logPaymentVerification = (orderId, adminUserId, approved, rejectionReason = null, details = {}) => {
    exports.log(
        approved ? 'PAYMENT_VERIFIED' : 'PAYMENT_REJECTED',
        adminUserId,
        orderId,
        'order',
        { status: 'pending_verification' },
        { status: approved ? 'verified' : 'rejected', rejectionReason },
        {
            ...details,
            reason: rejectionReason || (approved ? 'Approved' : 'Rejected')
        }
    );
};

/**
 * Log order status change
 */
exports.logOrderStatusChange = (orderId, adminUserId, oldStatus, newStatus, details = {}) => {
    exports.log(
        'ORDER_STATUS_CHANGED',
        adminUserId,
        orderId,
        'order',
        { status: oldStatus },
        { status: newStatus },
        details
    );
};

/**
 * Log order cancellation
 */
exports.logOrderCancellation = (orderId, userId, reason = null, details = {}) => {
    exports.log(
        'ORDER_CANCELLED',
        userId,
        orderId,
        'order',
        { status: 'active' },
        { status: 'cancelled' },
        {
            ...details,
            reason: reason || 'Cancelled by user'
        }
    );
};

/**
 * Log product price change
 */
exports.logPriceChange = (productId, adminUserId, oldPrice, newPrice, oldSalePrice, newSalePrice, details = {}) => {
    exports.log(
        'PRICE_CHANGED',
        adminUserId,
        productId,
        'product',
        { price: oldPrice, salePrice: oldSalePrice },
        { price: newPrice, salePrice: newSalePrice },
        details
    );
};

/**
 * Log coupon usage/creation
 */
exports.logCouponAction = (couponId, userId, action, details = {}) => {
    exports.log(
        action,  // COUPON_CREATED, COUPON_DELETED, COUPON_USED
        userId,
        couponId,
        'coupon',
        null,
        details.couponData || null,
        details
    );
};

/**
 * Log admin login
 */
exports.logAdminLogin = (userId, success, reason = null, details = {}) => {
    exports.log(
        success ? 'ADMIN_LOGIN_SUCCESS' : 'ADMIN_LOGIN_FAILED',
        userId,
        userId,
        'user',
        null,
        { status: success ? 'success' : 'failed' },
        {
            ...details,
            reason: reason || (success ? 'Successful login' : 'Failed login attempt')
        }
    );
};

/**
 * Log sensitive user data access
 */
exports.logDataAccess = (userId, targetUserId, dataType, details = {}) => {
    exports.log(
        'SENSITIVE_DATA_ACCESSED',
        userId,
        targetUserId,
        'user_data',
        null,
        { dataType },
        {
            ...details,
            reason: `Accessed ${dataType}`
        }
    );
};

/**
 * Log payment proof upload
 */
exports.logPaymentProofUpload = (orderId, userId, fileName, fileSize, details = {}) => {
    exports.log(
        'PAYMENT_PROOF_UPLOADED',
        userId,
        orderId,
        'payment_proof',
        null,
        { fileName, fileSize },
        details
    );
};

/**
 * Retrieve audit logs (for admin dashboard)
 * @param {Object} options - Filter options
 * @returns {Array} Array of audit log entries
 */
exports.getLogs = (options = {}) => {
    try {
        const content = fs.readFileSync(AUDIT_LOG_FILE, 'utf-8');
        const lines = content.trim().split('\n').filter(line => line.length > 0);
        
        let logs = lines.map(line => {
            try {
                return JSON.parse(line);
            } catch {
                return null;
            }
        }).filter(Boolean);

        // Apply filters
        if (options.action) {
            logs = logs.filter(log => log.action === options.action);
        }

        if (options.userId) {
            logs = logs.filter(log => log.userId === options.userId);
        }

        if (options.resourceType) {
            logs = logs.filter(log => log.resourceType === options.resourceType);
        }

        if (options.startDate) {
            logs = logs.filter(log => new Date(log.timestamp) >= new Date(options.startDate));
        }

        if (options.endDate) {
            logs = logs.filter(log => new Date(log.timestamp) <= new Date(options.endDate));
        }

        // Sort by timestamp descending (newest first)
        logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // Limit results
        const limit = options.limit || 100;
        return logs.slice(0, limit);
    } catch (err) {
        console.error('Error reading audit logs:', err.message);
        return [];
    }
};
