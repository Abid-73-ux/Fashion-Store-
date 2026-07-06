const express = require('express');
const router = express.Router();
const WhatsAppInteraction = require('../models/WhatsAppInteraction');
const { sequelize } = require('sequelize');

/**
 * POST /api/whatsapp/track
 * Track WhatsApp widget interactions
 */
router.post('/track', async (req, res) => {
  try {
    const {
      sessionId,
      userId,
      pageUrl,
      pageType,
      generatedMessage,
      productId,
      deviceType,
      browserInfo,
      cartTotal,
      itemCount
    } = req.body;

    // Validate required fields
    if (!sessionId || !pageUrl) {
      return res.status(400).json({
        error: 'Missing required fields: sessionId, pageUrl'
      });
    }

    // Create interaction record
    const interaction = await WhatsAppInteraction.create({
      sessionId,
      userId: userId || null,
      pageUrl,
      pageType: pageType || 'default',
      generatedMessage,
      productId: productId || null,
      deviceType: deviceType || 'desktop',
      browserInfo,
      cartTotal: cartTotal || null,
      itemCount: itemCount || null
    });

    res.status(201).json({
      success: true,
      message: 'WhatsApp interaction tracked',
      data: {
        id: interaction.id,
        sessionId: interaction.sessionId,
        timestamp: interaction.createdAt
      }
    });
  } catch (error) {
    console.error('WhatsApp tracking error:', error);
    res.status(500).json({
      error: 'Failed to track WhatsApp interaction',
      message: error.message
    });
  }
});

/**
 * GET /api/whatsapp/analytics
 * Get WhatsApp analytics data (Admin only)
 */
router.get('/analytics', async (req, res) => {
  try {
    const { period = 'daily' } = req.query;

    // Get today's clicks
    const todayClicks = await WhatsAppInteraction.count({
      where: sequelize.where(
        sequelize.fn('DATE', sequelize.col('timestamp')),
        '=',
        sequelize.fn('DATE', sequelize.literal('NOW()'))
      )
    });

    // Get weekly clicks
    const weeklyClicks = await WhatsAppInteraction.count({
      where: sequelize.where(
        sequelize.col('timestamp'),
        '>=',
        sequelize.literal("DATE_SUB(NOW(), INTERVAL 7 DAY)")
      )
    });

    // Get monthly clicks
    const monthlyClicks = await WhatsAppInteraction.count({
      where: sequelize.where(
        sequelize.col('timestamp'),
        '>=',
        sequelize.literal("DATE_SUB(NOW(), INTERVAL 30 DAY)")
      )
    });

    // Get device distribution
    const deviceDistribution = await WhatsAppInteraction.findAll({
      attributes: [
        'deviceType',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['deviceType'],
      raw: true
    });

    // Get page type distribution
    const pageDistribution = await WhatsAppInteraction.findAll({
      attributes: [
        'pageType',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['pageType'],
      raw: true
    });

    // Get top products
    const topProducts = await WhatsAppInteraction.findAll({
      attributes: [
        'productId',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        productId: { [sequelize.Op.not]: null }
      },
      group: ['productId'],
      order: [[sequelize.literal('count'), 'DESC']],
      limit: 10,
      raw: true
    });

    // Get hourly distribution
    const hourlyDistribution = await WhatsAppInteraction.findAll({
      attributes: [
        [sequelize.fn('HOUR', sequelize.col('timestamp')), 'hour'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: [sequelize.fn('HOUR', sequelize.col('timestamp'))],
      order: [[sequelize.fn('HOUR', sequelize.col('timestamp')), 'ASC']],
      raw: true
    });

    res.json({
      success: true,
      analytics: {
        today: todayClicks,
        weekly: weeklyClicks,
        monthly: monthlyClicks,
        deviceDistribution,
        pageDistribution,
        topProducts,
        hourlyDistribution
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      error: 'Failed to fetch analytics',
      message: error.message
    });
  }
});

/**
 * GET /api/whatsapp/stats
 * Get quick stats
 */
router.get('/stats', async (req, res) => {
  try {
    const totalInteractions = await WhatsAppInteraction.count();
    const uniqueSessions = await WhatsAppInteraction.count({
      distinct: true,
      col: 'sessionId'
    });
    const uniqueUsers = await WhatsAppInteraction.count({
      distinct: true,
      col: 'userId',
      where: {
        userId: { [sequelize.Op.not]: null }
      }
    });

    res.json({
      success: true,
      stats: {
        totalInteractions,
        uniqueSessions,
        uniqueUsers,
        conversionRate: ((uniqueUsers / uniqueSessions) * 100).toFixed(2) + '%'
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      error: 'Failed to fetch stats',
      message: error.message
    });
  }
});

module.exports = router;
