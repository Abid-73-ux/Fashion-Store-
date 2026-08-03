const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { Op, sequelize } = require('sequelize');

// Get sales data for charts - simplified approach
exports.getSalesData = async (req, res) => {
    try {
        const { period = 'monthly' } = req.query;

        // Get all non-cancelled orders
        const orders = await Order.findAll({
            where: {
                status: { [Op.ne]: 'cancelled' }
            },
            attributes: ['id', 'total', 'createdAt'],
            raw: true
        });

        // Group by month in JavaScript
        const groupedData = {};
        orders.forEach(order => {
            const date = new Date(order.createdAt);
            const monthKey = date.toISOString().substring(0, 7); // YYYY-MM format
            
            if (!groupedData[monthKey]) {
                groupedData[monthKey] = { count: 0, revenue: 0 };
            }
            groupedData[monthKey].count += 1;
            groupedData[monthKey].revenue += parseFloat(order.total || 0);
        });

        // Convert to array and sort
        const salesData = Object.entries(groupedData)
            .map(([date, data]) => ({
                date: new Date(date + '-01'),
                orders: data.count,
                revenue: data.revenue
            }))
            .sort((a, b) => a.date - b.date);

        res.status(200).json({
            success: true,
            data: salesData
        });
    } catch (error) {
        console.error('Analytics getSalesData error:', error.message);
        res.status(500).json({ error: error.message });
    }
};

// Get revenue data - simplified approach
exports.getRevenueData = async (req, res) => {
    try {
        const { period = 'monthly' } = req.query;

        // Get all non-cancelled orders
        const orders = await Order.findAll({
            where: {
                status: { [Op.ne]: 'cancelled' }
            },
            attributes: ['total', 'createdAt'],
            raw: true
        });

        // Group by month in JavaScript
        const groupedData = {};
        orders.forEach(order => {
            const date = new Date(order.createdAt);
            const monthKey = date.toISOString().substring(0, 7); // YYYY-MM format
            
            if (!groupedData[monthKey]) {
                groupedData[monthKey] = 0;
            }
            groupedData[monthKey] += parseFloat(order.total || 0);
        });

        // Convert to array and sort
        const revenueData = Object.entries(groupedData)
            .map(([date, revenue]) => ({
                date: new Date(date + '-01'),
                revenue: revenue
            }))
            .sort((a, b) => a.date - b.date);

        res.status(200).json({
            success: true,
            data: revenueData
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

// Get customer growth data - simplified approach
exports.getCustomerGrowth = async (req, res) => {
    try {
        // Get all users with user role
        const users = await User.findAll({
            where: {
                role: 'user'
            },
            attributes: ['id', 'createdAt'],
            raw: true
        });

        // Group by month in JavaScript
        const groupedData = {};
        users.forEach(user => {
            const date = new Date(user.createdAt);
            const monthKey = date.toISOString().substring(0, 7); // YYYY-MM format
            
            if (!groupedData[monthKey]) {
                groupedData[monthKey] = 0;
            }
            groupedData[monthKey] += 1;
        });

        // Convert to array and sort
        const customerGrowth = Object.entries(groupedData)
            .map(([date, count]) => ({
                date: new Date(date + '-01'),
                newCustomers: count
            }))
            .sort((a, b) => a.date - b.date);

        res.status(200).json({
            success: true,
            data: customerGrowth
        });
    } catch (error) {
        console.error('Analytics getCustomerGrowth error:', error.message);
        res.status(500).json({ error: error.message });
    }
};

// Get dashboard stats - simplified approach
exports.getDashboardStats = async (req, res) => {
    try {
        // Total revenue
        const orders = await Order.findAll({
            where: {
                status: { [Op.ne]: 'cancelled' }
            },
            attributes: ['total'],
            raw: true
        });

        const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0);

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
                totalRevenue,
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

// Get order status breakdown - simplified approach
exports.getOrderStatusBreakdown = async (req, res) => {
    try {
        // Get all orders with their status
        const orders = await Order.findAll({
            attributes: ['status'],
            raw: true
        });

        // Count by status
        const breakdown = {};
        orders.forEach(order => {
            const status = order.status || 'pending';
            if (!breakdown[status]) {
                breakdown[status] = 0;
            }
            breakdown[status] += 1;
        });

        // Convert to array
        const data = Object.entries(breakdown)
            .map(([status, count]) => ({
                status,
                count
            }));

        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Analytics getOrderStatusBreakdown error:', error.message);
        res.status(500).json({ error: error.message });
    }
};
