const Coupon = require('../models/Coupon');

// Get all coupons
exports.getCoupons = async (req, res) => {
    try {
        const { active } = req.query;
        let query = {};

        if (active !== undefined) {
            query.active = active === 'true';
        }

        const coupons = await Coupon.find(query).sort({ createdAt: -1 });

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
        const coupon = await Coupon.findById(req.params.id);

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
        const coupon = await Coupon.findOne({ code: req.params.code.toUpperCase() });

        if (!coupon) {
            return res.status(404).json({ error: 'Coupon not found' });
        }

        // Check if coupon is active and not expired
        if (!coupon.active) {
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
        const { code, description, discountType, discountValue, expiryDate } = req.body;

        if (!code || !discountType || !discountValue || !expiryDate) {
            return res.status(400).json({ error: 'Please provide all required fields' });
        }

        // Check if coupon already exists
        const couponExists = await Coupon.findOne({ code: code.toUpperCase() });
        if (couponExists) {
            return res.status(400).json({ error: 'Coupon code already exists' });
        }

        const coupon = await Coupon.create({
            code: code.toUpperCase(),
            description: description || null,
            discountType,
            discountValue,
            expiryDate,
            ...req.body
        });

        res.status(201).json({ success: true, coupon });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update coupon (admin only)
exports.updateCoupon = async (req, res) => {
    try {
        let coupon = await Coupon.findById(req.params.id);

        if (!coupon) {
            return res.status(404).json({ error: 'Coupon not found' });
        }

        // Check if code is being changed and if new code already exists
        if (req.body.code && req.body.code !== coupon.code) {
            const couponExists = await Coupon.findOne({ code: req.body.code.toUpperCase() });
            if (couponExists) {
                return res.status(400).json({ error: 'Coupon code already exists' });
            }
            req.body.code = req.body.code.toUpperCase();
        }

        coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, coupon });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete coupon (admin only)
exports.deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);

        if (!coupon) {
            return res.status(404).json({ error: 'Coupon not found' });
        }

        await Coupon.findByIdAndDelete(req.params.id);

        res.status(200).json({ success: true, message: 'Coupon deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Use coupon (for checkout)
exports.useCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);

        if (!coupon) {
            return res.status(404).json({ error: 'Coupon not found' });
        }

        // Check if user already used this coupon
        if (coupon.usedBy.includes(req.user.id)) {
            return res.status(400).json({ error: 'You have already used this coupon' });
        }

        // Add user to usedBy array
        coupon.usedBy.push(req.user.id);
        coupon.usageCount += 1;
        await coupon.save();

        res.status(200).json({ success: true, message: 'Coupon used successfully', coupon });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
