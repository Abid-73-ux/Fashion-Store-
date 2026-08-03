const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { Op, sequelize } = require('sequelize');

// Get sales data for charts
exports.getSalesData = async (req, res) => {
    try {
        const { period = 'monthly' } = req.query;

        const salesData = await Order.findAll({
            attributes: [
                [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt')), 'date'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'orders'],
                [sequelize.fn('SUM', sequelize.col('total')), 'totalRevenue']
            ],
            where: {
                status: { [Op.ne]: 'cancelled' }
            },
            group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt'))],
            order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt')), 'ASC']],
            raw: true,
            subQuery: false
        });

        res.status(200).json({
            success: true,
            data: salesData.map(item => ({
                date: item.date,
                orders: parseInt(item.orders) || 0,
                revenue: parseFloat(item.totalRevenue || 0)
            }))
        });
    } catch (error) {
        console.error('Analytics getSalesData error:', error.message);
        res.status(500).json({ error: error.message });
    }
};

// Get revenue data
exports.getRevenueData = async (req, res) => {
    try {
        const { period = 'monthly' } = req.query;

        const revenueData = await Order.findAll({
            attributes: [
                [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt')), 'date'],
                [sequelize.fn('SUM', sequelize.col('total')), 'revenue']
            ],
            where: {
                status: { [Op.ne]: 'cancelled' }
            },
            group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt'))],
            order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt')), 'ASC']],
            raw: true,
            subQuery: false
        });

        res.status(200).json({
            success: true,
            data: revenueData.map(item => ({
                date: item.date,
                revenue: parseFloat(item.revenue || 0)
            }))
        });
    } catch (error) {
        console.error('Analytics getRevenueData error:', error.message);
        res.status(500).json({ error: error.message });
    }
};

// Get top products
exports.getTopProducts = async (req, res) => {
    try {
        const { limit = 5 } = req.query;

        // Get top products by rating and featured status
        const topProducts = await Product.findAll({
            attributes: ['id', 'name', 'price', 'rating', 'reviews'],
            where: {
                isBestseller: true
            },
            order: [['rating', 'DESC'], ['reviews', 'DESC']],
            limit: parseInt(limit),
            raw: true
        });

        res.status(200).json({
            success: true,
            data: topProducts
        });
    } catch (error) {
        console.error('Analytics getTopProducts error:', error.message);
        res.status(500).json({ error: error.message });
    }
};

// Get customer growth data
exports.getCustomerGrowth = async (req, res) => {
    try {
        const customerGrowth = await User.findAll({
            attributes: [
                [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt')), 'date'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'newCustomers']
            ],
            where: {
                role: 'user'
            },
            group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt'))],
            order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt')), 'ASC']],
            raw: true,
            subQuery: false
        });

        res.status(200).json({
            success: true,
            data: customerGrowth.map(item => ({
                date: item.date,
                newCustomers: parseInt(item.newCustomers) || 0
            }))
        });
    } catch (error) {
        console.error('Analytics getCustomerGrowth error:', error.message);
        res.status(500).json({ error: error.message });
    }
};

// Get dashboard stats
exports.getDashboardStats = async (req, res) => {
    try {
        // Total revenue
        const revenueResult = await Order.findOne({
            attributes: [
                [sequelize.fn('SUM', sequelize.col('total')), 'totalRevenue']
            ],
            where: {
                status: { [Op.ne]: 'cancelled' }
            },
            raw: true
        });

        // Total orders
        const totalOrders = await Order.count();

        // Total customers
        const totalCustomers = await User.count({
            where: { role: 'user' }
        });

        // Total products
        const totalProducts = await Product.count();

        res.status(200).json({
            success: true,
            stats: {
                totalRevenue: parseFloat(revenueResult?.totalRevenue || 0),
                totalOrders,
                totalCustomers,
                totalProducts
            }
        });
    } catch (error) {
        console.error('Analytics getDashboardStats error:', error.message);
        res.status(500).json({ error: error.message });
    }
};

// Get order status breakdown
exports.getOrderStatusBreakdown = async (req, res) => {
    try {
        const breakdown = await Order.findAll({
            attributes: [
                'status',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['status'],
            raw: true
        });

        res.status(200).json({
            success: true,
            data: breakdown.map(item => ({
                status: item.status,
                count: parseInt(item.count) || 0
            }))
        });
    } catch (error) {
        console.error('Analytics getOrderStatusBreakdown error:', error.message);
        res.status(500).json({ error: error.message });
    }
};
