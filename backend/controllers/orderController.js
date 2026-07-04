const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

// Get all orders (admin)
exports.getOrders = async (req, res) => {
    try {
        const { status, sortBy, limit = 10, skip = 0 } = req.query;
        let query = {};

        if (status) {
            query.orderStatus = status;
        }

        let sort = { createdAt: -1 };
        if (sortBy === 'amount-asc') sort = { totalAmount: 1 };
        if (sortBy === 'amount-desc') sort = { totalAmount: -1 };

        const orders = await Order.find(query)
            .sort(sort)
            .limit(parseInt(limit))
            .skip(parseInt(skip))
            .populate('user', 'name email phone')
            .populate('items.product', 'name price image');

        const total = await Order.countDocuments(query);

        res.status(200).json({
            success: true,
            total,
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
        const orders = await Order.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .populate('items.product', 'name price image');

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
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email phone address')
            .populate('items.product', 'name price image')
            .populate('coupon', 'code discountValue discountType');

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Check if user is owner or admin
        if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
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
        const { items, shippingAddress, paymentMethod, coupon } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'Order must contain at least one item' });
        }

        if (!shippingAddress || !paymentMethod) {
            return res.status(400).json({ error: 'Shipping address and payment method are required' });
        }

        // Calculate total
        let totalAmount = 0;
        let discountAmount = 0;

        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(400).json({ error: `Product ${item.product} not found` });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
            }

            totalAmount += product.price * item.quantity;
        }

        // Apply coupon if provided
        if (coupon) {
            const couponData = await Coupon.findById(coupon);
            if (couponData && couponData.active) {
                const expiryDate = new Date(couponData.expiryDate);
                if (expiryDate > new Date()) {
                    if (couponData.discountType === 'percentage') {
                        discountAmount = (totalAmount * couponData.discountValue) / 100;
                        if (couponData.maxDiscount) {
                            discountAmount = Math.min(discountAmount, couponData.maxDiscount);
                        }
                    } else if (couponData.discountType === 'fixed') {
                        discountAmount = couponData.discountValue;
                    }
                }
            }
        }

        const finalAmount = Math.max(0, totalAmount - discountAmount);

        const order = await Order.create({
            user: req.user.id,
            items,
            totalAmount: finalAmount,
            discountAmount,
            coupon: coupon || null,
            shippingAddress,
            paymentMethod,
            orderStatus: 'pending',
            paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending'
        });

        await order.populate('items.product', 'name price image');

        res.status(201).json({ success: true, order });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update order status (admin only)
exports.updateOrder = async (req, res) => {
    try {
        let order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const { orderStatus, paymentStatus } = req.body;

        if (orderStatus) {
            order.orderStatus = orderStatus;
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
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized to cancel this order' });
        }

        if (['delivered', 'cancelled'].includes(order.orderStatus)) {
            return res.status(400).json({ error: `Cannot cancel ${order.orderStatus} order` });
        }

        order.orderStatus = 'cancelled';
        await order.save();

        res.status(200).json({ success: true, message: 'Order cancelled successfully', order });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
