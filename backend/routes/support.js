const express = require('express');
const router = express.Router();
const SupportEmail = require('../models/SupportEmail');
const { Op } = require('sequelize');
// Note: Email sending disabled - now using mailto: protocol instead
// const { sendConfirmationEmail, sendAdminNotification } = require('../services/emailService');

/**
 * POST /api/support/email
 * Submit support email inquiry
 */
router.post('/email', async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      subject,
      message,
      orderNumber,
      sessionId,
      userId,
      pageUrl,
      supportEmail
    } = req.body;

    // Validate required fields
    if (!fullName || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: fullName, email, subject, message'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Validate message length
    if (message.length < 10 || message.length > 5000) {
      return res.status(400).json({
        success: false,
        message: 'Message must be between 10 and 5000 characters'
      });
    }

    // Handle file upload if present
    let attachmentData = null;
    if (req.file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid file type. Only JPG, PNG, PDF allowed.'
        });
      }

      // Validate file size (5MB)
      if (req.file.size > 5 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: 'File too large. Maximum 5MB allowed.'
        });
      }

      attachmentData = {
        filename: req.file.originalname,
        size: req.file.size,
        type: req.file.mimetype,
        path: req.file.path
      };
    }

    // Create support email record
    const supportRequest = await SupportEmail.create({
      customer_id: userId || null,
      full_name: fullName,
      email: email,
      phone: phone || null,
      subject: subject,
      message: message,
      order_number: orderNumber || null,
      attachment: attachmentData,
      status: 'new',
      priority: 'medium',
      page_url: pageUrl,
      session_id: sessionId,
      browser_info: req.headers['user-agent']
    });

    // Generate reference number
    const referenceNumber = `TKJ-${String(supportRequest.id).substring(0, 6).toUpperCase()}`;

    // Send confirmation email to customer (non-blocking)
    sendConfirmationEmail(email, fullName, referenceNumber)
      .catch(error => {
        console.error('⚠️ Failed to send confirmation email (continuing anyway):', error.message);
      });

    // Send notification to admin (non-blocking)
    sendAdminNotification(supportRequest)
      .catch(error => {
        console.error('⚠️ Failed to send admin notification (continuing anyway):', error.message);
      });

    res.status(201).json({
      success: true,
      message: 'Your support request has been submitted successfully!',
      data: {
        id: supportRequest.id,
        referenceNumber: `TKJ-${String(supportRequest.id).substring(0, 6).toUpperCase()}`,
        status: supportRequest.status,
        createdAt: supportRequest.created_at
      }
    });

  } catch (error) {
    console.error('Support email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit support request',
      error: error.message
    });
  }
});

/**
 * GET /api/support/email/:id
 * Get support email details (Admin only)
 */
router.get('/email/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const supportEmail = await SupportEmail.findByPk(id);

    if (!supportEmail) {
      return res.status(404).json({
        success: false,
        message: 'Support email not found'
      });
    }

    // Update status to read
    if (supportEmail.status === 'new') {
      await supportEmail.update({ status: 'read' });
    }

    res.json({
      success: true,
      data: supportEmail
    });

  } catch (error) {
    console.error('Get support email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch support email',
      error: error.message
    });
  }
});

/**
 * GET /api/support/emails
 * Get all support emails with filters (Admin only)
 */
router.get('/emails', async (req, res) => {
  try {
    const {
      status = 'all',
      priority = 'all',
      search = '',
      page = 1,
      limit = 10
    } = req.query;

    const where = {};

    // Filter by status
    if (status !== 'all') {
      where.status = status;
    }

    // Filter by priority
    if (priority !== 'all') {
      where.priority = priority;
    }

    // Search
    if (search) {
      where[Op.or] = [
        { full_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { subject: { [Op.like]: `%${search}%` } },
        { message: { [Op.like]: `%${search}%` } },
        { order_number: { [Op.like]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await SupportEmail.findAndCountAll({
      where,
      offset,
      limit,
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('Get support emails error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch support emails',
      error: error.message
    });
  }
});

/**
 * PATCH /api/support/email/:id
 * Update support email (Admin only)
 */
router.patch('/email/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority, adminNotes } = req.body;

    const supportEmail = await SupportEmail.findByPk(id);

    if (!supportEmail) {
      return res.status(404).json({
        success: false,
        message: 'Support email not found'
      });
    }

    // Update allowed fields
    if (status) {
      supportEmail.status = status;
    }
    if (priority) {
      supportEmail.priority = priority;
    }
    if (adminNotes) {
      supportEmail.admin_notes = adminNotes;
    }

    await supportEmail.save();

    res.json({
      success: true,
      message: 'Support email updated successfully',
      data: supportEmail
    });

  } catch (error) {
    console.error('Update support email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update support email',
      error: error.message
    });
  }
});

/**
 * POST /api/support/email/:id/reply
 * Reply to support email (Admin only)
 */
router.post('/email/:id/reply', async (req, res) => {
  try {
    const { id } = req.params;
    const { responseEmail, adminId } = req.body;

    const supportEmail = await SupportEmail.findByPk(id);

    if (!supportEmail) {
      return res.status(404).json({
        success: false,
        message: 'Support email not found'
      });
    }

    // Update with response
    supportEmail.response_email = responseEmail;
    supportEmail.status = 'replied';
    supportEmail.responded_at = new Date();
    supportEmail.responded_by = adminId;

    await supportEmail.save();

    // TODO: Send response email to customer
    // await sendResponseEmail(supportEmail.email, responseEmail);

    res.json({
      success: true,
      message: 'Reply sent successfully',
      data: supportEmail
    });

  } catch (error) {
    console.error('Reply error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send reply',
      error: error.message
    });
  }
});

/**
 * GET /api/support/stats
 * Get support stats dashboard (Admin only)
 */
router.get('/stats', async (req, res) => {
  try {
    const totalEmails = await SupportEmail.count();
    const unreadEmails = await SupportEmail.count({
      where: { status: 'new' }
    });
    const todayEmails = await SupportEmail.count({
      where: {
        created_at: {
          [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    });

    const statusBreakdown = await SupportEmail.findAll({
      attributes: [
        'status',
        [SupportEmail.sequelize.fn('COUNT', SupportEmail.sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    const priorityBreakdown = await SupportEmail.findAll({
      attributes: [
        'priority',
        [SupportEmail.sequelize.fn('COUNT', SupportEmail.sequelize.col('id')), 'count']
      ],
      group: ['priority'],
      raw: true
    });

    res.json({
      success: true,
      stats: {
        totalEmails,
        unreadEmails,
        todayEmails,
        statusBreakdown,
        priorityBreakdown
      }
    });

  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stats',
      error: error.message
    });
  }
});

module.exports = router;
