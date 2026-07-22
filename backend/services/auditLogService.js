/**
 * Audit Logging Service
 * Comprehensive logging for all order-related operations
 * Ensures compliance and provides investigation trail
 */

const { AuditLog } = require('../models');
const logger = require('../utils/logger');

/**
 * Log event types
 */
const EVENT_TYPES = {
    // Order events
    ORDER_CREATED: 'order_created',
    ORDER_UPDATED: 'order_updated',
    ORDER_CANCELLED: 'order_cancelled',

    // Payment events
    PAYMENT_PROOF_UPLOADED: 'payment_proof_uploaded',
    PAYMENT_VERIFIED: 'payment_verified',
    PAYMENT_REJECTED: 'payment_rejected',

    // Status changes
    STATUS_CHANGED: 'status_changed',
    SHIPMENT_UPDATED: 'shipment_updated',

    // Admin actions
    ADMIN_LOGIN: 'admin_login',
    ADMIN_LOGOUT: 'admin_logout',
    ADMIN_ACCESS: 'admin_access',

    // System events
    NOTIFICATION_SENT: 'notification_sent',
    NOTIFICATION_FAILED: 'notification_failed',
    SYSTEM_ERROR: 'system_error'
};

/**
 * Create audit log entry
 */
const log = async (params) => {
    const {
        eventType,
        orderId = null,
        userId = null,
        adminId = null,
        action,
        details = {},
        status = 'success',
        errorMessage = null,
        ipAddress = null,
        userAgent = null
    } = params;

    try {
        const logEntry = await AuditLog.create({
            eventType,
            orderId,
            userId,
            adminId,
            action,
            details: JSON.stringify(details),
            status,
            errorMessage,
            ipAddress,
            userAgent,
            timestamp: new Date()
        });

        logger.info(`Audit log created: ${eventType}`, {
            orderId,
            userId,
            adminId
        });

        return logEntry.toJSON();

    } catch (error) {
        logger.error(`Error creating audit log: ${error.message}`, error);
        // Don't throw - logging shouldn't break operations
        return null;
    }
};

/**
 * Log order creation
 */
const logOrderCreation = async (order, customer, items) => {
    return log({
        eventType: EVENT_TYPES.ORDER_CREATED,
        orderId: order.id,
        userId: customer.id,
        action: `Order created: #${order.orderId}`,
        details: {
            orderId: order.orderId,
            customerName: customer.firstName + ' ' + customer.lastName,
            customerEmail: customer.email,
            itemCount: items.length,
            total: order.total,
            paymentMethod: order.paymentMethod,
            items: items.map(i => ({
                productId: i.productId,
                productName: i.productName,
                quantity: i.quantity,
                price: i.price
            }))
        }
    });
};

/**
 * Log payment proof upload
 */
const logPaymentProofUpload = async (order, fileName, fileSize, userId) => {
    return log({
        eventType: EVENT_TYPES.PAYMENT_PROOF_UPLOADED,
        orderId: order.id,
        userId,
        action: `Payment proof uploaded for order #${order.orderId}`,
        details: {
            orderId: order.orderId,
            fileName,
            fileSize,
            uploadTime: new Date()
        }
    });
};

/**
 * Log payment verification
 */
const logPaymentVerification = async (order, adminId, decision, reason = null) => {
    return log({
        eventType: decision === 'approve' ? EVENT_TYPES.PAYMENT_VERIFIED : EVENT_TYPES.PAYMENT_REJECTED,
        orderId: order.id,
        adminId,
        action: `Payment ${decision === 'approve' ? 'verified' : 'rejected'} for order #${order.orderId}`,
        details: {
            orderId: order.orderId,
            decision,
            reason,
            adminId,
            verifiedAt: new Date(),
            amount: order.total
        }
    });
};

/**
 * Log status change
 */
const logStatusChange = async (order, oldStatus, newStatus, changedBy, reason = null) => {
    return log({
        eventType: EVENT_TYPES.STATUS_CHANGED,
        orderId: order.id,
        adminId: changedBy,
        action: `Order status changed from ${oldStatus} to ${newStatus}`,
        details: {
            orderId: order.orderId,
            oldStatus,
            newStatus,
            changedBy,
            reason,
            changedAt: new Date()
        }
    });
};

/**
 * Log shipment update
 */
const logShipmentUpdate = async (order, adminId, trackingNumber, carrier) => {
    return log({
        eventType: EVENT_TYPES.SHIPMENT_UPDATED,
        orderId: order.id,
        adminId,
        action: `Shipment details updated for order #${order.orderId}`,
        details: {
            orderId: order.orderId,
            trackingNumber,
            carrier,
            shippedAt: new Date()
        }
    });
};

/**
 * Log admin login
 */
const logAdminLogin = async (admin, ipAddress, userAgent) => {
    return log({
        eventType: EVENT_TYPES.ADMIN_LOGIN,
        adminId: admin.id,
        action: `Admin login: ${admin.email}`,
        details: {
            adminId: admin.id,
            email: admin.email,
            loginTime: new Date()
        },
        ipAddress,
        userAgent
    });
};

/**
 * Log admin logout
 */
const logAdminLogout = async (admin, ipAddress) => {
    return log({
        eventType: EVENT_TYPES.ADMIN_LOGOUT,
        adminId: admin.id,
        action: `Admin logout: ${admin.email}`,
        details: {
            adminId: admin.id,
            email: admin.email,
            logoutTime: new Date()
        },
        ipAddress
    });
};

/**
 * Log admin access
 */
const logAdminAccess = async (admin, page, ipAddress, userAgent) => {
    return log({
        eventType: EVENT_TYPES.ADMIN_ACCESS,
        adminId: admin.id,
        action: `Admin accessed page: ${page}`,
        details: {
            adminId: admin.id,
            email: admin.email,
            page,
            accessTime: new Date()
        },
        ipAddress,
        userAgent
    });
};

/**
 * Log notification sent
 */
const logNotificationSent = async (orderId, userId, notificationType, medium) => {
    return log({
        eventType: EVENT_TYPES.NOTIFICATION_SENT,
        orderId,
        userId,
        action: `${notificationType} notification sent via ${medium}`,
        details: {
            orderId,
            notificationType,
            medium,
            sentAt: new Date()
        }
    });
};

/**
 * Log notification failure
 */
const logNotificationFailure = async (orderId, userId, notificationType, medium, error) => {
    return log({
        eventType: EVENT_TYPES.NOTIFICATION_FAILED,
        orderId,
        userId,
        action: `${notificationType} notification failed via ${medium}`,
        details: {
            orderId,
            notificationType,
            medium,
            failedAt: new Date()
        },
        status: 'failed',
        errorMessage: error.message
    });
};

/**
 * Log system error
 */
const logSystemError = async (error, context = {}) => {
    return log({
        eventType: EVENT_TYPES.SYSTEM_ERROR,
        action: `System error occurred`,
        details: {
            errorMessage: error.message,
            errorStack: error.stack,
            context,
            occurredAt: new Date()
        },
        status: 'failed',
        errorMessage: error.message
    });
};

/**
 * Get audit logs for order
 */
const getOrderLogs = async (orderId, limit = 100) => {
    try {
        const logs = await AuditLog.findAll({
            where: { orderId },
            order: [['timestamp', 'DESC']],
            limit
        });

        return logs.map(log => ({
            id: log.id,
            eventType: log.eventType,
            action: log.action,
            details: log.details ? JSON.parse(log.details) : {},
            status: log.status,
            errorMessage: log.errorMessage,
            timestamp: log.timestamp
        }));

    } catch (error) {
        logger.error(`Error fetching audit logs for order ${orderId}:`, error);
        return [];
    }
};

/**
 * Get audit logs for admin
 */
const getAdminLogs = async (adminId, limit = 100) => {
    try {
        const logs = await AuditLog.findAll({
            where: { adminId },
            order: [['timestamp', 'DESC']],
            limit
        });

        return logs.map(log => ({
            id: log.id,
            eventType: log.eventType,
            orderId: log.orderId,
            action: log.action,
            timestamp: log.timestamp
        }));

    } catch (error) {
        logger.error(`Error fetching audit logs for admin ${adminId}:`, error);
        return [];
    }
};

/**
 * Search audit logs
 */
const searchLogs = async (query, filters = {}) => {
    try {
        const where = {};

        if (filters.eventType) where.eventType = filters.eventType;
        if (filters.orderId) where.orderId = filters.orderId;
        if (filters.userId) where.userId = filters.userId;
        if (filters.adminId) where.adminId = filters.adminId;
        if (filters.status) where.status = filters.status;

        if (filters.startDate || filters.endDate) {
            where.timestamp = {};
            if (filters.startDate) where.timestamp[require('sequelize').Op.gte] = new Date(filters.startDate);
            if (filters.endDate) where.timestamp[require('sequelize').Op.lte] = new Date(filters.endDate);
        }

        const logs = await AuditLog.findAll({
            where,
            order: [['timestamp', 'DESC']],
            limit: 500
        });

        return logs.map(log => log.toJSON());

    } catch (error) {
        logger.error(`Error searching audit logs:`, error);
        return [];
    }
};

/**
 * Export logs for compliance
 */
const exportLogs = async (startDate, endDate, format = 'json') => {
    try {
        const logs = await AuditLog.findAll({
            where: {
                timestamp: {
                    [require('sequelize').Op.between]: [new Date(startDate), new Date(endDate)]
                }
            },
            order: [['timestamp', 'ASC']]
        });

        if (format === 'csv') {
            return convertLogsToCSV(logs);
        }

        return logs.map(log => log.toJSON());

    } catch (error) {
        logger.error(`Error exporting logs:`, error);
        return [];
    }
};

/**
 * Convert logs to CSV format
 */
const convertLogsToCSV = (logs) => {
    const headers = ['Timestamp', 'Event Type', 'Action', 'Order ID', 'User ID', 'Admin ID', 'Status', 'Error Message'];
    const rows = logs.map(log => [
        log.timestamp,
        log.eventType,
        log.action,
        log.orderId || '',
        log.userId || '',
        log.adminId || '',
        log.status,
        log.errorMessage || ''
    ]);

    const csv = [headers, ...rows]
        .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n');

    return csv;
};

module.exports = {
    EVENT_TYPES,
    log,
    logOrderCreation,
    logPaymentProofUpload,
    logPaymentVerification,
    logStatusChange,
    logShipmentUpdate,
    logAdminLogin,
    logAdminLogout,
    logAdminAccess,
    logNotificationSent,
    logNotificationFailure,
    logSystemError,
    getOrderLogs,
    getAdminLogs,
    searchLogs,
    exportLogs
};
