/**
 * Email Notification Service
 * Handles sending emails for order events
 * Includes HTML templates, retry logic, and tracking
 */

const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

/**
 * Initialize email transporter
 */
const createTransporter = () => {
    const provider = process.env.EMAIL_PROVIDER || 'gmail';

    if (provider === 'gmail') {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASSWORD
            }
        });
    } else if (provider === 'smtp') {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        });
    } else if (provider === 'sendgrid') {
        const sgTransport = require('nodemailer-sendgrid-transport');
        return nodemailer.createTransport(
            sgTransport({
                auth: {
                    api_key: process.env.SENDGRID_API_KEY
                }
            })
        );
    }

    throw new Error(`Unsupported email provider: ${provider}`);
};

let transporter;

/**
 * Initialize transporter on first use
 */
const getTransporter = () => {
    if (!transporter) {
        transporter = createTransporter();
    }
    return transporter;
};

/**
 * Email templates
 */
const EMAIL_TEMPLATES = {
    ORDER_CONFIRMATION: (order, customer) => ({
        subject: `Order Confirmation #${order.orderId} - TAKANJ Fashion Store`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Montserrat', Arial, sans-serif; background: #f5f5f5; }
                    .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; }
                    .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
                    .header h1 { margin: 0; font-size: 24px; }
                    .order-id { font-size: 14px; opacity: 0.9; margin-top: 5px; }
                    .section { margin-bottom: 25px; }
                    .section-title { font-size: 16px; font-weight: 600; margin-bottom: 15px; border-bottom: 2px solid #eee; padding-bottom: 10px; }
                    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
                    .info-item label { font-weight: 600; color: #666; font-size: 12px; text-transform: uppercase; }
                    .info-item p { margin: 5px 0 0 0; color: #333; }
                    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
                    .items-table th { background: #f9f9f9; padding: 10px; text-align: left; font-weight: 600; font-size: 13px; }
                    .items-table td { padding: 10px; border-bottom: 1px solid #eee; }
                    .summary { background: #f9f9f9; padding: 15px; border-radius: 6px; }
                    .summary-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
                    .summary-row.total { font-weight: 600; font-size: 16px; border-top: 1px solid #ddd; padding-top: 10px; margin-top: 10px; color: #1a1a2e; }
                    .payment-badge { display: inline-block; padding: 6px 12px; border-radius: 4px; font-weight: 600; font-size: 12px; margin-top: 10px; }
                    .payment-badge.cod { background: #fff3cd; color: #856404; }
                    .payment-badge.bank { background: #d1ecf1; color: #0c5460; }
                    .cta-button { display: inline-block; background: #1a1a2e; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 20px 0; font-weight: 600; }
                    .footer { text-align: center; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999; }
                    .tracking-url { background: #e7f3ff; padding: 10px; border-radius: 4px; margin-top: 10px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Order Confirmed! ✓</h1>
                        <div class="order-id">Order #${order.orderId} - ${new Date(order.createdAt).toLocaleDateString()}</div>
                    </div>

                    <div class="section">
                        <p>Hello ${customer.firstName},</p>
                        <p>Thank you for your order! We've received your purchase and are processing it right away.</p>
                    </div>

                    <div class="section">
                        <div class="section-title">Order Details</div>
                        <div class="info-grid">
                            <div class="info-item">
                                <label>Order Number</label>
                                <p>${order.orderId}</p>
                            </div>
                            <div class="info-item">
                                <label>Order Date</label>
                                <p>${new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div class="info-item">
                                <label>Payment Method</label>
                                <p>${order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Bank Transfer'}</p>
                            </div>
                            <div class="info-item">
                                <label>Order Status</label>
                                <p>Pending Confirmation</p>
                            </div>
                        </div>
                    </div>

                    <div class="section">
                        <div class="section-title">Items Ordered</div>
                        <table class="items-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Size</th>
                                    <th>Qty</th>
                                    <th>Price</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${order.items.map(item => `
                                    <tr>
                                        <td>${item.productName}</td>
                                        <td>${item.size || '-'}</td>
                                        <td>${item.quantity}</td>
                                        <td>₨${parseFloat(item.price).toFixed(2)}</td>
                                        <td>₨${(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>

                    <div class="section">
                        <div class="summary">
                            <div class="summary-row">
                                <span>Subtotal:</span>
                                <span>₨${parseFloat(order.subtotal || 0).toFixed(2)}</span>
                            </div>
                            <div class="summary-row">
                                <span>Tax (${order.taxPercentage || 0}%):</span>
                                <span>₨${parseFloat(order.tax || 0).toFixed(2)}</span>
                            </div>
                            <div class="summary-row">
                                <span>Shipping:</span>
                                <span>₨${parseFloat(order.shipping || 0).toFixed(2)}</span>
                            </div>
                            ${order.discount ? `
                                <div class="summary-row">
                                    <span>Discount:</span>
                                    <span>-₨${parseFloat(order.discount).toFixed(2)}</span>
                                </div>
                            ` : ''}
                            <div class="summary-row total">
                                <span>Total Amount:</span>
                                <span>₨${parseFloat(order.total).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <div class="section">
                        <div class="section-title">Shipping Address</div>
                        <p>
                            ${order.shippingAddress.street}<br/>
                            ${order.shippingAddress.city}, ${order.shippingAddress.state}<br/>
                            ${order.shippingAddress.postalCode}
                        </p>
                    </div>

                    ${order.paymentMethod === 'Bank_Transfer' ? `
                        <div class="section">
                            <div class="section-title">Payment Instructions</div>
                            <p>Your order is pending payment verification. Please submit your payment proof through your account dashboard.</p>
                            <p><strong>Bank Details:</strong><br/>
                            Account Holder: Ali Ahmad<br/>
                            Bank: United Bank Limited (UBL)<br/>
                            Account Number: 0321320277986</p>
                        </div>
                    ` : `
                        <div class="section">
                            <p>Your order will be delivered with cash on delivery option. Our team will contact you soon to confirm delivery details.</p>
                        </div>
                    `}

                    <a href="https://fashionstorea.netlify.app/orders?orderId=${order.orderId}" class="cta-button">Track Your Order</a>

                    <div class="footer">
                        <p>Thank you for shopping with TAKANJ Fashion Store!</p>
                        <p>If you have any questions, please contact us at support@takanj.com</p>
                    </div>
                </div>
            </body>
            </html>
        `
    }),

    PAYMENT_VERIFIED: (order, customer) => ({
        subject: `Payment Verified - Order #${order.orderId}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #28a745; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
                    <h1 style="margin: 0;">✓ Payment Verified!</h1>
                </div>
                <p>Hello ${customer.firstName},</p>
                <p>Great news! Your payment for order <strong>#${order.orderId}</strong> has been verified and approved.</p>
                <p>Your order is now confirmed and will be processed for shipment shortly. We'll send you tracking information as soon as your package ships.</p>
                <p style="margin-top: 20px;">
                    <a href="https://fashionstorea.netlify.app/orders?orderId=${order.orderId}" style="background: #1a1a2e; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">Track Your Order</a>
                </p>
                <p style="border-top: 1px solid #eee; padding-top: 20px; font-size: 12px; color: #999;">
                    Thank you for shopping with TAKANJ!<br/>
                    support@takanj.com
                </p>
            </div>
        `
    }),

    PAYMENT_REJECTED: (order, customer, reason) => ({
        subject: `Payment Review Required - Order #${order.orderId}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #ffc107; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <h1 style="margin: 0;">Payment Review Required</h1>
                </div>
                <p>Hello ${customer.firstName},</p>
                <p>We need your attention regarding your order <strong>#${order.orderId}</strong>.</p>
                <p><strong>Reason:</strong> ${reason || 'Payment proof does not match criteria'}</p>
                <p>Please resubmit your payment proof through your account dashboard with clear images of your bank transfer receipt.</p>
                <p style="margin-top: 20px;">
                    <a href="https://fashionstorea.netlify.app/orders?orderId=${order.orderId}" style="background: #1a1a2e; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">Resubmit Payment Proof</a>
                </p>
                <p>If you have any questions, please contact support@takanj.com</p>
            </div>
        `
    }),

    ORDER_SHIPPED: (order, customer, trackingNumber) => ({
        subject: `Your Order is Shipped! - Order #${order.orderId}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #007bff; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
                    <h1 style="margin: 0;">📦 Order Shipped!</h1>
                </div>
                <p>Hello ${customer.firstName},</p>
                <p>Your order <strong>#${order.orderId}</strong> has been shipped!</p>
                <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
                <p>You can track your shipment in real-time through your account dashboard.</p>
                <p style="margin-top: 20px;">
                    <a href="https://fashionstorea.netlify.app/orders?orderId=${order.orderId}" style="background: #1a1a2e; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">Track Shipment</a>
                </p>
                <p style="border-top: 1px solid #eee; padding-top: 20px; font-size: 12px; color: #999;">
                    Expected delivery: 3-5 business days<br/>
                    support@takanj.com
                </p>
            </div>
        `
    }),

    ORDER_DELIVERED: (order, customer) => ({
        subject: `Order Delivered - Order #${order.orderId}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #28a745; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
                    <h1 style="margin: 0;">✓ Order Delivered!</h1>
                </div>
                <p>Hello ${customer.firstName},</p>
                <p>Your order <strong>#${order.orderId}</strong> has been successfully delivered!</p>
                <p>We hope you love your purchase. We'd appreciate your feedback!</p>
                <p style="margin-top: 20px;">
                    <a href="https://fashionstorea.netlify.app/orders?orderId=${order.orderId}" style="background: #1a1a2e; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">Leave Review</a>
                </p>
                <p style="border-top: 1px solid #eee; padding-top: 20px; font-size: 12px; color: #999;">
                    Thank you for shopping with TAKANJ!<br/>
                    support@takanj.com
                </p>
            </div>
        `
    })
};

/**
 * Send email with retry logic
 */
const sendEmail = async (to, templateType, data, attempt = 1) => {
    const MAX_ATTEMPTS = 3;

    try {
        if (!to || !to.includes('@')) {
            throw new Error('Invalid email address');
        }

        const template = EMAIL_TEMPLATES[templateType];
        if (!template) {
            throw new Error(`Unknown email template: ${templateType}`);
        }

        const { subject, html } = template(data.order, data.customer);

        const mailOptions = {
            from: process.env.EMAIL_FROM || 'support@takanj.com',
            to,
            subject,
            html
        };

        const transporter = getTransporter();
        const result = await transporter.sendMail(mailOptions);

        logger.info(`Email sent: ${templateType} to ${to} (Message ID: ${result.messageId})`);

        return {
            success: true,
            messageId: result.messageId,
            to,
            template: templateType
        };

    } catch (error) {
        logger.error(`Email error (Attempt ${attempt}):`, error.message);

        if (attempt < MAX_ATTEMPTS) {
            const delay = 5000 * attempt;
            logger.info(`Retrying email in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return sendEmail(to, templateType, data, attempt + 1);
        }

        throw new Error(`Failed to send email after ${MAX_ATTEMPTS} attempts: ${error.message}`);
    }
};

/**
 * Send order confirmation email
 */
const sendOrderConfirmation = async (order, customer) => {
    try {
        return await sendEmail(customer.email, 'ORDER_CONFIRMATION', { order, customer });
    } catch (error) {
        logger.error('Error sending order confirmation email:', error);
        // Don't throw - notification failure shouldn't block order
        return null;
    }
};

/**
 * Send payment verified email
 */
const sendPaymentVerified = async (order, customer) => {
    try {
        return await sendEmail(customer.email, 'PAYMENT_VERIFIED', { order, customer });
    } catch (error) {
        logger.error('Error sending payment verified email:', error);
        return null;
    }
};

/**
 * Send payment rejected email
 */
const sendPaymentRejected = async (order, customer, reason) => {
    try {
        return await sendEmail(customer.email, 'PAYMENT_REJECTED', { order, customer, reason }, 1);
    } catch (error) {
        logger.error('Error sending payment rejected email:', error);
        return null;
    }
};

/**
 * Send order shipped email
 */
const sendOrderShipped = async (order, customer, trackingNumber) => {
    try {
        return await sendEmail(customer.email, 'ORDER_SHIPPED', { order, customer, trackingNumber });
    } catch (error) {
        logger.error('Error sending order shipped email:', error);
        return null;
    }
};

/**
 * Send order delivered email
 */
const sendOrderDelivered = async (order, customer) => {
    try {
        return await sendEmail(customer.email, 'ORDER_DELIVERED', { order, customer });
    } catch (error) {
        logger.error('Error sending order delivered email:', error);
        return null;
    }
};

module.exports = {
    sendEmail,
    sendOrderConfirmation,
    sendPaymentVerified,
    sendPaymentRejected,
    sendOrderShipped,
    sendOrderDelivered,
    EMAIL_TEMPLATES
};
