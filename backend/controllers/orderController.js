const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const User = require('../models/User');

// Get all orders (admin)
exports.getOrders = async (req, res) => {
    try {
        const { status, sortBy, limit = 10, offset = 0 } = req.query;
        const where = {};

        if (status) {
            where.status = status;
        }

        let order = [['createdAt', 'DESC']];
        if (sortBy === 'amount-asc') order = [['total', 'ASC']];
        if (sortBy === 'amount-desc') order = [['total', 'DESC']];

        const { count, rows: orders } = await Order.findAndCountAll({
            where,
            order,
            limit: parseInt(limit),
            offset: parseInt(offset),
            include: [
                { model: User, attributes: ['id', 'name', 'email', 'phone'] }
            ]
        });

        res.status(200).json({
            success: true,
            total: count,
            count: orders.length,
            orders
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get user orders
exports.getUserOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']],
            include: [
                { model: User, attributes: ['id', 'name', 'email'] }
            ]
        });

        res.status(200).json({
            success: true,
            count: orders.length,
            orders
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get single order
exports.getOrder = async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id, {
            include: [
                { model: User, attributes: ['id', 'name', 'email', 'phone', 'address'] }
            ]
        });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Check if user is owner or admin
        if (order.userId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized to view this order' });
        }

        res.status(200).json({ success: true, order });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create order
exports.createOrder = async (req, res) => {
    try {
        const { items, shippingAddress, billingAddress, paymentMethod, couponCode } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'Order must contain at least one item' });
        }

        if (!shippingAddress || !paymentMethod) {
            return res.status(400).json({ error: 'Shipping address and payment method are required' });
        }

        // Calculate totals
        let subtotal = 0;
        let discount = 0;
        let tax = 0;
        let shipping = 0;

        // Validate and calculate items
        for (const item of items) {
            const product = await Product.findByPk(item.product);
            if (!product) {
                return res.status(400).json({ error: `Product ${item.product} not found` });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
            }

            subtotal += (product.price * item.quantity);
        }

        // Apply coupon if provided
        if (couponCode) {
            const coupon = await Coupon.findOne({ where: { code: couponCode } });
            if (coupon && coupon.isActive) {
                const expiryDate = new Date(coupon.expiryDate);
                if (expiryDate > new Date()) {
                    if (coupon.type === 'percentage') {
                        discount = (subtotal * coupon.value) / 100;
                        if (coupon.maxDiscount) {
                            discount = Math.min(discount, coupon.maxDiscount);
                        }
                    } else if (coupon.type === 'fixed') {
                        discount = coupon.value;
                    }
                }
            }
        }

        // Get store settings for tax and shipping
        // (Using hardcoded defaults for now - can be enhanced with StoreSettings)
        tax = (subtotal - discount) * 0.17; // 17% tax (Pakistan)
        shipping = 250; // Fixed shipping

        const total = subtotal - discount + tax + shipping;

        const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        const order = await Order.create({
            orderId,
            userId: req.user.id,
            items,
            subtotal,
            tax,
            shipping,
            discount,
            total,
            status: 'pending',
            paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
            paymentMethod,
            shippingAddress,
            billingAddress: billingAddress || shippingAddress,
            couponCode: couponCode || null
        });

        res.status(201).json({ success: true, order });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update order status (admin only)
exports.updateOrder = async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id);

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const { status, paymentStatus } = req.body;

        if (status) {
            order.status = status;
        }

        if (paymentStatus) {
            order.paymentStatus = paymentStatus;
        }

        await order.save();

        res.status(200).json({ success: true, order });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id);

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        if (order.userId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized to cancel this order' });
        }

        if (['delivered', 'cancelled'].includes(order.status)) {
            return res.status(400).json({ error: `Cannot cancel ${order.status} order` });
        }

        order.status = 'cancelled';
        await order.save();

        res.status(200).json({ success: true, message: 'Order cancelled successfully', order });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
