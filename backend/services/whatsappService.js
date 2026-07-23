/**
 * WhatsApp Notification Service
 * Handles sending WhatsApp messages for order events
 * Validates numbers, queues notifications, handles retries
 */

const axios = require('axios');
const logger = require('../utils/logger');

/**
 * WhatsApp validation regex - Pakistani format
 * Accepts: +923001234567 or 03001234567
 */
const WHATSAPP_REGEX = /^(\+92|0)[3-9]\d{9}$/;

/**
 * Retry configuration
 */
const RETRY_CONFIG = {
    maxAttempts: 3,
    delayMs: 5000, // 5 seconds between retries
    backoffMultiplier: 2
};

/**
 * Message templates for different events
 */
const MESSAGE_TEMPLATES = {
    ORDER_PLACED_COD: (orderId, total) => `
Hello! Your order #${orderId} has been placed successfully.

💰 Order Total: ₨${total}

Payment Method: Cash on Delivery
We'll deliver your order and collect payment upon delivery.

Thank you for shopping with TAKANJ! 🎉

Track your order: fashionstorea.netlify.app/orders
    `.trim(),

    ORDER_PLACED_BANK: (orderId, total) => `
Hello! Your order #${orderId} has been placed successfully.

💰 Order Total: ₨${total}

Payment Method: Bank Transfer
We're waiting for your payment proof verification.

Thank you for shopping with TAKANJ! 🎉

Track your order: fashionstorea.netlify.app/orders
    `.trim(),

    PAYMENT_VERIFIED: (orderId) => `
Great news! 🎉

Your payment for order #${orderId} has been verified and approved.

Your order is now being processed and will be shipped soon.

Track your order: fashionstorea.netlify.app/orders
    `.trim(),

    PAYMENT_REJECTED: (orderId, reason) => `
We need your attention!

Your payment proof for order #${orderId} was rejected.

Reason: ${reason || 'Does not match bank details or payment criteria'}

Please resubmit your payment proof at: fashionstorea.netlify.app/orders

Contact support: support@takanj.com
    `.trim(),

    ORDER_SHIPPED: (orderId, trackingNumber) => `
Your order is on the way! 🚚

Order #${orderId}
Tracking Number: ${trackingNumber}

Track your shipment: fashionstorea.netlify.app/orders

We appreciate your business!
    `.trim(),

    ORDER_DELIVERED: (orderId) => `
Your order has been delivered! 📦

Order #${orderId} successfully delivered.

Thank you for shopping with TAKANJ! 🎉

We'd love your feedback!
    `.trim(),

    ORDER_CANCELLED: (orderId, reason) => `
Your order has been cancelled.

Order #${orderId}

Reason: ${reason || 'Requested by customer'}

If you have any questions, please contact support:
support@takanj.com
    `.trim()
};

/**
 * Validate WhatsApp number format
 * @param {string} number - Phone number to validate
 * @returns {boolean} - True if valid
 */
const validatePhoneNumber = (number) => {
    if (!number || typeof number !== 'string') {
        return false;
    }
    return WHATSAPP_REGEX.test(number);
};

/**
 * Normalize WhatsApp number to international format
 * @param {string} number - Phone number
 * @returns {string} - Normalized number (e.g., +923001234567)
 */
const normalizePhoneNumber = (number) => {
    if (!validatePhoneNumber(number)) {
        throw new Error('Invalid WhatsApp number format');
    }

    // Remove any spaces or special characters except +
    let cleaned = number.replace(/[\s\-()]/g, '');

    // Convert 0 prefix to +92
    if (cleaned.startsWith('0')) {
        cleaned = '+92' + cleaned.substring(1);
    }

    return cleaned;
};

/**
 * Send WhatsApp message with retry logic
 * @param {Object} params - Message parameters
 * @param {string} params.phoneNumber - Recipient phone number
 * @param {string} params.message - Message text
 * @param {string} params.orderId - Order ID for tracking
 * @param {string} params.eventType - Type of event (order_placed, payment_verified, etc.)
 * @returns {Promise<Object>} - Result with status and interaction record
 */
const sendMessage = async (params) => {
    const {
        phoneNumber,
        message,
        orderId,
        eventType,
        userId,
        attempt = 1
    } = params;

    try {
        // Validate phone number
        if (!validatePhoneNumber(phoneNumber)) {
            throw new Error(`Invalid WhatsApp number: ${phoneNumber}`);
        }

        const normalizedNumber = normalizePhoneNumber(phoneNumber);

        // Log attempt
        logger.info(`WhatsApp: Sending ${eventType} to ${normalizedNumber} (Attempt ${attempt}/${RETRY_CONFIG.maxAttempts})`);

        // Send via WhatsApp API (Twilio or similar)
        const response = await sendViaAPI(normalizedNumber, message);

        // Log successful send (commented out DB storage for now)
        // const interaction = await WhatsAppInteraction.create({...});

        logger.info(`WhatsApp: Message sent successfully. ID: ${response.messageId}`);

        return {
            success: true,
            messageId: response.messageId,
            interaction: {
                orderId,
                userId,
                phoneNumber: normalizedNumber,
                eventType,
                status: 'sent',
                externalMessageId: response.messageId,
                attempt,
                sentAt: new Date()
            }
        };

    } catch (error) {
        logger.error(`WhatsApp Error (Attempt ${attempt}):`, error.message);

        // Log failed attempt (commented out DB storage for now)
        // await WhatsAppInteraction.create({...});

        // Retry logic
        if (attempt < RETRY_CONFIG.maxAttempts) {
            const delay = RETRY_CONFIG.delayMs * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt - 1);
            logger.info(`WhatsApp: Retrying in ${delay}ms...`);

            await new Promise(resolve => setTimeout(resolve, delay));

            return sendMessage({
                ...params,
                attempt: attempt + 1
            });
        }

        throw new Error(`Failed to send WhatsApp after ${RETRY_CONFIG.maxAttempts} attempts: ${error.message}`);
    }
};

/**
 * Send message via WhatsApp Business API
 * Uses Twilio or custom API based on configuration
 */
const sendViaAPI = async (phoneNumber, message) => {
    const apiProvider = process.env.WHATSAPP_API_PROVIDER || 'twilio';

    if (apiProvider === 'twilio') {
        return sendViaTwilio(phoneNumber, message);
    } else if (apiProvider === 'custom') {
        return sendViaCustomAPI(phoneNumber, message);
    } else {
        throw new Error(`Unsupported WhatsApp API provider: ${apiProvider}`);
    }
};

/**
 * Send via Twilio WhatsApp API
 */
const sendViaTwilio = async (phoneNumber, message) => {
    try {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;

        if (!accountSid || !authToken || !fromNumber) {
            throw new Error('Twilio credentials not configured');
        }

        const client = require('twilio')(accountSid, authToken);

        const response = await client.messages.create({
            body: message,
            from: `whatsapp:${fromNumber}`,
            to: `whatsapp:${phoneNumber}`
        });

        return {
            messageId: response.sid,
            status: response.status
        };

    } catch (error) {
        throw new Error(`Twilio API error: ${error.message}`);
    }
};

/**
 * Send via custom WhatsApp API
 */
const sendViaCustomAPI = async (phoneNumber, message) => {
    try {
        const apiUrl = process.env.WHATSAPP_API_URL;
        const apiKey = process.env.WHATSAPP_API_KEY;

        if (!apiUrl || !apiKey) {
            throw new Error('Custom WhatsApp API credentials not configured');
        }

        const response = await axios.post(
            apiUrl,
            {
                phone: phoneNumber,
                message: message
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            }
        );

        return {
            messageId: response.data.messageId || response.data.id,
            status: response.data.status || 'sent'
        };

    } catch (error) {
        if (error.response) {
            throw new Error(`Custom API error: ${error.response.data?.message || error.response.statusText}`);
        }
        throw new Error(`WhatsApp API request failed: ${error.message}`);
    }
};

/**
 * Send order placed notification
 */
const notifyOrderPlaced = async (order, customer) => {
    if (!customer.whatsappNumber) {
        logger.warn(`No WhatsApp number for customer ${customer.id}`);
        return null;
    }

    const message = order.paymentMethod === 'COD'
        ? MESSAGE_TEMPLATES.ORDER_PLACED_COD(order.orderId, order.total)
        : MESSAGE_TEMPLATES.ORDER_PLACED_BANK(order.orderId, order.total);

    try {
        return await sendMessage({
            phoneNumber: customer.whatsappNumber,
            message,
            orderId: order.id,
            userId: customer.id,
            eventType: 'order_placed'
        });
    } catch (error) {
        logger.error(`Failed to send order placed notification:`, error);
        // Don't throw - failure shouldn't block order creation
        return null;
    }
};

/**
 * Send payment verified notification
 */
const notifyPaymentVerified = async (order, customer) => {
    if (!customer.whatsappNumber) {
        logger.warn(`No WhatsApp number for customer ${customer.id}`);
        return null;
    }

    const message = MESSAGE_TEMPLATES.PAYMENT_VERIFIED(order.orderId);

    try {
        return await sendMessage({
            phoneNumber: customer.whatsappNumber,
            message,
            orderId: order.id,
            userId: customer.id,
            eventType: 'payment_verified'
        });
    } catch (error) {
        logger.error(`Failed to send payment verified notification:`, error);
        return null;
    }
};

/**
 * Send payment rejected notification
 */
const notifyPaymentRejected = async (order, customer, reason) => {
    if (!customer.whatsappNumber) {
        logger.warn(`No WhatsApp number for customer ${customer.id}`);
        return null;
    }

    const message = MESSAGE_TEMPLATES.PAYMENT_REJECTED(order.orderId, reason);

    try {
        return await sendMessage({
            phoneNumber: customer.whatsappNumber,
            message,
            orderId: order.id,
            userId: customer.id,
            eventType: 'payment_rejected'
        });
    } catch (error) {
        logger.error(`Failed to send payment rejected notification:`, error);
        return null;
    }
};

/**
 * Send order status update notification
 */
const notifyOrderStatusChange = async (order, customer, newStatus, trackingNumber) => {
    if (!customer.whatsappNumber) {
        logger.warn(`No WhatsApp number for customer ${customer.id}`);
        return null;
    }

    let message;
    let eventType = `order_${newStatus}`;

    switch (newStatus) {
        case 'shipped':
            message = MESSAGE_TEMPLATES.ORDER_SHIPPED(order.orderId, trackingNumber);
            break;
        case 'delivered':
            message = MESSAGE_TEMPLATES.ORDER_DELIVERED(order.orderId);
            break;
        case 'cancelled':
            message = MESSAGE_TEMPLATES.ORDER_CANCELLED(order.orderId);
            break;
        default:
            message = `Your order #${order.orderId} status has been updated to: ${newStatus}`;
    }

    try {
        return await sendMessage({
            phoneNumber: customer.whatsappNumber,
            message,
            orderId: order.id,
            userId: customer.id,
            eventType
        });
    } catch (error) {
        logger.error(`Failed to send order status notification:`, error);
        return null;
    }
};

/**
 * Queue notification for background processing
 * Used for non-blocking notification sends
 */
const queueNotification = async (notificationType, orderId, customerId, data = {}) => {
    try {
        // If using Bull queue or similar
        if (process.env.USE_JOB_QUEUE === 'true') {
            // Queue implementation
            logger.info(`Queued ${notificationType} notification for order ${orderId}`);
        } else {
            // Direct send (for development/testing)
            logger.info(`Notification ${notificationType} queued for order ${orderId}`);
        }
    } catch (error) {
        logger.error(`Error queuing notification:`, error);
    }
};

/**
 * Get WhatsApp interaction history
 * (Disabled for now - no database storage)
 */
const getInteractionHistory = async (orderId) => {
    logger.info(`WhatsApp interaction history lookup for order ${orderId} - feature disabled`);
    return [];
};

/**
 * Retry failed notifications
 * (Disabled for now - no database storage)
 */
const retryFailedNotifications = async (orderId) => {
    logger.info(`Retry failed notifications for order ${orderId} - feature disabled`);
    return [];
};

module.exports = {
    validatePhoneNumber,
    normalizePhoneNumber,
    sendMessage,
    notifyOrderPlaced,
    notifyPaymentVerified,
    notifyPaymentRejected,
    notifyOrderStatusChange,
    queueNotification,
    getInteractionHistory,
    retryFailedNotifications,
    MESSAGE_TEMPLATES
};
