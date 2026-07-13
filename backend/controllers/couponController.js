const Coupon = require('../models/Coupon');
const { Op } = require('sequelize');

// Get all coupons
exports.getCoupons = async (req, res) => {
    try {
        const { isActive } = req.query;
        const where = {};

        if (isActive !== undefined) {
            where.isActive = isActive === 'true';
        }

        const coupons = await Coupon.findAll({
            where,
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            success: true,
            count: coupons.length,
            coupons
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get single coupon
exports.getCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findByPk(req.params.id);

        if (!coupon) {
            return res.status(404).json({ error: 'Coupon not found' });
        }

        res.status(200).json({ success: true, coupon });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get coupon by code
exports.getCouponByCode = async (req, res) => {
    try {
        const coupon = await Coupon.findOne({
            where: { code: req.params.code.toUpperCase() }
        });

        if (!coupon) {
            return res.status(404).json({ error: 'Coupon not found' });
        }

        // Check if coupon is active and not expired
        if (!coupon.isActive) {
            return res.status(400).json({ error: 'Coupon is inactive' });
        }

        const expiryDate = new Date(coupon.expiryDate);
        if (expiryDate < new Date()) {
            return res.status(400).json({ error: 'Coupon has expired' });
        }

        // Check usage limit
        if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
            return res.status(400).json({ error: 'Coupon usage limit reached' });
        }

        res.status(200).json({ success: true, coupon });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create coupon (admin only)
exports.createCoupon = async (req, res) => {
    try {
        const { code, description, discountType, discountValue, expiryDate, maxDiscount, usageLimit } = req.body;

        if (!code || !discountType || !discountValue || !expiryDate) {
            return res.status(400).json({ error: 'Please provide all required fields' });
        }

        // Check if coupon already exists
        const couponExists = await Coupon.findOne({
            where: { code: code.toUpperCase() }
        });
        if (couponExists) {
            return res.status(400).json({ error: 'Coupon code already exists' });
        }

        const coupon = await Coupon.create({
            code: code.toUpperCase(),
            description: description || null,
            discountType,
            discountValue,
            expiryDate,
            maxDiscount: maxDiscount || null,
            usageLimit: usageLimit || null,
            usageCount: 0,
            isActive: true
        });

        res.status(201).json({ success: true, coupon });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update coupon (admin only)
exports.updateCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findByPk(req.params.id);

        if (!coupon) {
            return res.status(404).json({ error: 'Coupon not found' });
        }

        // Check if code is being changed and if new code already exists
        if (req.body.code && req.body.code !== coupon.code) {
            const couponExists = await Coupon.findOne({
                where: { code: req.body.code.toUpperCase() }
            });
            if (couponExists) {
                return res.status(400).json({ error: 'Coupon code already exists' });
            }
            req.body.code = req.body.code.toUpperCase();
        }

        // Update allowed fields
        if (req.body.code) coupon.code = req.body.code;
        if (req.body.description !== undefined) coupon.description = req.body.description;
        if (req.body.discountType) coupon.discountType = req.body.discountType;
        if (req.body.discountValue !== undefined) coupon.discountValue = req.body.discountValue;
        if (req.body.expiryDate) coupon.expiryDate = req.body.expiryDate;
        if (req.body.maxDiscount !== undefined) coupon.maxDiscount = req.body.maxDiscount;
        if (req.body.usageLimit !== undefined) coupon.usageLimit = req.body.usageLimit;
        if (req.body.isActive !== undefined) coupon.isActive = req.body.isActive;

        await coupon.save();

        res.status(200).json({ success: true, coupon });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete coupon (admin only)
exports.deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findByPk(req.params.id);

        if (!coupon) {
            return res.status(404).json({ error: 'Coupon not found' });
        }

        await coupon.destroy();

        res.status(200).json({ success: true, message: 'Coupon deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Use coupon (for checkout)
exports.useCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findByPk(req.params.id);

        if (!coupon) {
            return res.status(404).json({ error: 'Coupon not found' });
        }

        // Increment usage count
        coupon.usageCount += 1;
        await coupon.save();

        res.status(200).json({ success: true, message: 'Coupon used successfully', coupon });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
