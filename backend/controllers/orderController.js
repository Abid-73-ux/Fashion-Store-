const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const PaymentProof = require('../models/PaymentProof');
const OrderStatusChange = require('../models/OrderStatusChange');
const User = require('../models/User');
const sequelize = require('../database/sequelize');
const validationService = require('../services/validationService');
const fileService = require('../services/fileService');
const emailNotificationService = require('../services/emailNotificationService');
const whatsappService = require('../services/whatsappService');

// ==================== Task 2.1: Create Order ====================

/**
 * POST /api/v1/orders/create
 * Create a new order with customer info, cart items, and payment details
 * Handles both checkout.js format and API format
 */
exports.createOrder = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const userId = req.user.id;
    let customerInfo, paymentMethod, couponCode, paymentProofId, cartItems;

    // Support both old and new data formats
    // Format 1 (checkout.js): { userId, items, subtotal, tax, shipping, discount, total, paymentMethod, paymentStatus, orderStatus, shippingAddress, notes, customerInfo }
    // Format 2 (API): { customerInfo, paymentMethod, couponCode, paymentProofId, cartItems }
    
    if (req.body.customerInfo && req.body.cartItems) {
      // New format from API
      ({ customerInfo, paymentMethod, couponCode, paymentProofId, cartItems } = req.body);
    } else if (req.body.items && req.body.paymentMethod) {
      // Old format from checkout.js - build customer info from body
      const {
        items,
        subtotal: providedSubtotal,
        tax: providedTax,
        shipping: providedShipping,
        discount: providedDiscount,
        total: providedTotal,
        paymentStatus: providedPaymentStatus,
        orderStatus: providedOrderStatus,
        shippingAddress,
        notes,
        firstName,
        lastName,
        email,
        whatsappNumber
      } = req.body;

      customerInfo = {
        firstName: firstName || '',
        lastName: lastName || '',
        email: email || '',
        whatsappNumber: whatsappNumber || '',
        shippingAddress: shippingAddress || {}
      };

      paymentMethod = req.body.paymentMethod;
      couponCode = req.body.couponCode || null;
      paymentProofId = req.body.paymentProofId || null;
      cartItems = items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        size: item.size,
        color: item.color
      }));
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid order data format',
        error: { data: 'Missing required fields' }
      });
    }

    // Validate customer information
    if (!customerInfo.email) {
      return res.status(400).json({
        success: false,
        message: 'Customer email is required',
        error: { email: 'Email is required' }
      });
    }

    if (!customerInfo.shippingAddress || !Object.keys(customerInfo.shippingAddress).length) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required',
        error: { shippingAddress: 'Shipping address is required' }
      });
    }

    // Validate payment method
    if (!['COD', 'Bank_Transfer'].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method',
        error: { paymentMethod: 'Payment method must be COD or Bank_Transfer' }
      });
    }

    // Validate cart items
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart items are required',
        error: { cartItems: 'At least one item is required' }
      });
    }

    // Check inventory and calculate totals with row-level locking
    let subtotal = 0;
    const orderItems = [];

    for (const item of cartItems) {
      // Use row-level locking to prevent race conditions
      const product = await Product.findByPk(item.productId, {
        transaction: t,
        lock: t.LOCK.UPDATE // SELECT FOR UPDATE
      });

      if (!product) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: 'Product not found',
          error: { productId: `Product ${item.productId} not found` }
        });
      }

      if (product.stock < item.quantity) {
        await t.rollback();
        return res.status(409).json({
          success: false,
          message: 'Insufficient inventory',
          error: {
            inventory: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
          }
        });
      }

      const itemPrice = product.salePrice || product.price;
      const lineTotal = itemPrice * item.quantity;
      subtotal += lineTotal;

      orderItems.push({
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: itemPrice,
        size: item.size || null,
        color: item.color || null,
        lineTotal
      });
    }

    // Apply coupon if provided
    let discount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({
        where: { code: couponCode },
        transaction: t
      });

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

          // Increment coupon usage
          await coupon.increment('usedCount', { transaction: t });
        }
      }
    }

    // Calculate tax and shipping (hardcoded for now - can be from StoreSettings)
    const tax = Math.round((subtotal - discount) * 0.17 * 100) / 100; // 17% tax
    const shipping = 250; // Fixed shipping
    const total = subtotal - discount + tax + shipping;

    // Generate order ID
    const orderNumber = Math.floor(Math.random() * 1000000);
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const orderId = `TAK-${dateStr}-${String(orderNumber).padStart(5, '0')}`;

    // Create order record with customer info
    const order = await Order.create(
      {
        orderId,
        userId,
        items: orderItems,
        subtotal: parseFloat(subtotal.toFixed(2)),
        tax: parseFloat(tax.toFixed(2)),
        shipping: parseFloat(shipping.toFixed(2)),
        discount: parseFloat(discount.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
        paymentMethod,
        paymentStatus: 'pending',
        orderStatus: 'pending',
        shippingAddress: customerInfo.shippingAddress,
        couponCode: couponCode || null,
        customerFirstName: customerInfo.firstName,
        customerLastName: customerInfo.lastName,
        customerEmail: customerInfo.email,
        customerWhatsappNumber: customerInfo.whatsappNumber,
        notes: req.body.notes || null
      },
      { transaction: t }
    );

    // Create payment proof record if bank transfer
    if (paymentMethod === 'Bank_Transfer' && paymentProofId) {
      const paymentProof = await PaymentProof.findByPk(paymentProofId, {
        transaction: t
      });

      if (!paymentProof) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: 'Payment proof not found',
          error: { paymentProofId: 'Invalid payment proof ID' }
        });
      }

      // Associate payment proof with order
      await paymentProof.update(
        { orderId: order.id },
        { transaction: t }
      );
    }

    // Reduce inventory for all items
    for (const item of orderItems) {
      await Product.update(
        { stock: sequelize.literal(`stock - ${item.quantity}`) },
        {
          where: { id: item.productId },
          transaction: t
        }
      );
    }

    // Commit transaction
    await t.commit();

    // Trigger background jobs (email, WhatsApp) - non-blocking
    // These can fail without rejecting the order
    setImmediate(async () => {
      try {
        const customer = {
          id: userId,
          firstName: customerInfo.firstName,
          lastName: customerInfo.lastName,
          email: customerInfo.email,
          whatsappNumber: customerInfo.whatsappNumber
        };

        // Send email confirmation
        await emailNotificationService.sendOrderConfirmation(order.toJSON(), customer);

        // Send WhatsApp notification
        await whatsappService.notifyOrderPlaced(order.toJSON(), customer);

        console.log('✅ Background notifications sent for order:', orderId);
      } catch (error) {
        console.error('❌ Error sending background notifications:', error);
      }
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        orderId: order.orderId,
        orderNumber,
        total: order.total,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        createdAt: order.createdAt
      }
    });
  } catch (error) {
    await t.rollback();
    console.error('Order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message
    });
  }
};

// ==================== Task 2.2: Get Order ====================

/**
 * GET /api/v1/orders/:orderId
 * Retrieve order details with customer authorization
 */
exports.getOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Find order by orderId (not database ID)
    const order = await Order.findOne(
      {
        where: { orderId },
        include: [
          {
            model: User,
            attributes: ['id', 'name', 'email', 'phone']
          },
          {
            model: PaymentProof,
            attributes: ['id', 'fileName', 'filePath', 'uploadedAt', 'verifiedAt', 'rejectionReason'],
            required: false
          },
          {
            model: OrderStatusChange,
            attributes: ['oldStatus', 'newStatus', 'reason', 'createdAt'],
            required: false,
            order: [['createdAt', 'DESC']]
          }
        ]
      }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
        error: { orderId: 'Order not found' }
      });
    }

    // Check authorization
    if (order.userId !== userId && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
        error: { authorization: 'You do not have permission to view this order' }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order retrieved successfully',
      data: {
        orderId: order.orderId,
        items: order.items,
        subtotal: order.subtotal,
        tax: order.tax,
        shipping: order.shipping,
        discount: order.discount,
        total: order.total,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        shippingAddress: order.shippingAddress,
        paymentProof: order.PaymentProof
          ? {
              fileName: order.PaymentProof.fileName,
              fileUrl: fileService.getFileUrl(order.PaymentProof.filePath),
              uploadedAt: order.PaymentProof.uploadedAt,
              verifiedAt: order.PaymentProof.verifiedAt,
              rejectionReason: order.PaymentProof.rejectionReason
            }
          : null,
        statusHistory: order.OrderStatusChanges,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      }
    });
  } catch (error) {
    console.error('Order retrieval error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving order',
      error: error.message
    });
  }
};

// ==================== Task 2.3: Upload Payment Proof ====================

/**
 * POST /api/v1/orders/:orderId/payment-proof
 * Upload bank transfer payment proof
 */
exports.uploadPaymentProof = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    // Validate file exists
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
        error: { file: 'Payment proof file is required' }
      });
    }

    // Find order
    const order = await Order.findOne({ where: { orderId } });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
        error: { orderId: 'Order not found' }
      });
    }

    // Check authorization (own order)
    if (order.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
        error: { authorization: 'You do not have permission to upload proof for this order' }
      });
    }

    // Check payment method
    if (order.paymentMethod !== 'Bank_Transfer') {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method',
        error: { paymentMethod: 'This order does not require payment proof' }
      });
    }

    // Validate file
    const fileValidation = fileService.validateFile(req.file);
    if (!fileValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'File validation failed',
        error: { file: fileValidation.error }
      });
    }

    // Save file
    const saveResult = fileService.savePaymentProof(req.file, order.id);
    if (!saveResult.success) {
      return res.status(500).json({
        success: false,
        message: 'File upload failed',
        error: { file: saveResult.error }
      });
    }

    // Create or update payment proof record
    let paymentProof = await PaymentProof.findOne({
      where: { orderId: order.id }
    });

    if (paymentProof) {
      // Delete old file
      fileService.deleteFile(paymentProof.filePath);

      // Update record
      await paymentProof.update({
        filePath: saveResult.filePath,
        fileName: saveResult.fileName,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        uploadedAt: new Date()
      });
    } else {
      // Create new record
      paymentProof = await PaymentProof.create({
        orderId: order.id,
        filePath: saveResult.filePath,
        fileName: saveResult.fileName,
        fileSize: req.file.size,
        mimeType: req.file.mimetype
      });
    }

    // Generate thumbnail
    const thumbnailResult = fileService.generateThumbnail(
      saveResult.filePath,
      order.id
    );

    res.status(201).json({
      success: true,
      message: 'Payment proof uploaded successfully',
      data: {
        paymentProofId: paymentProof.id,
        fileName: paymentProof.fileName,
        fileSize: paymentProof.fileSize,
        fileUrl: fileService.getFileUrl(paymentProof.filePath),
        thumbnailUrl: fileService.getFileUrl(
          thumbnailResult.success
            ? thumbnailResult.thumbnailPath
            : saveResult.filePath
        ),
        uploadedAt: paymentProof.uploadedAt
      }
    });
  } catch (error) {
    console.error('Payment proof upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading payment proof',
      error: error.message
    });
  }
};

// ==================== Task 2.4: Verify Payment (Admin) ====================

/**
 * POST /api/v1/admin/orders/:orderId/verify-payment
 * Admin endpoint to approve/reject bank transfer payments
 */
exports.verifyPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const adminId = req.user.id;
    const { decision, reason } = req.body;

    // Validate decision
    if (!['approve', 'reject'].includes(decision)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid decision',
        error: { decision: 'Decision must be approve or reject' }
      });
    }

    // Validate reason for rejection
    if (decision === 'reject' && !reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason required',
        error: { reason: 'Please provide a reason for rejection' }
      });
    }

    // Find order
    const order = await Order.findOne({
      where: { orderId },
      include: [
        { model: PaymentProof, required: false }
      ]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
        error: { orderId: 'Order not found' }
      });
    }

    // Check order has bank transfer payment method
    if (order.paymentMethod !== 'Bank_Transfer') {
      return res.status(400).json({
        success: false,
        message: 'Invalid order',
        error: {
          paymentMethod: 'This order does not require payment verification'
        }
      });
    }

    // Check order is pending verification
    if (order.paymentStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Invalid status transition',
        error: {
          paymentStatus: `Order payment is already ${order.paymentStatus}`
        }
      });
    }

    // Update order status
    if (decision === 'approve') {
      order.paymentStatus = 'verified';
      order.orderStatus = 'confirmed';
      order.verifiedAt = new Date();

      if (order.PaymentProof) {
        order.PaymentProof.verifiedAt = new Date();
        order.PaymentProof.verifiedBy = adminId;
        await order.PaymentProof.save();
      }
    } else {
      // reject
      order.paymentStatus = 'failed';

      if (order.PaymentProof) {
        order.PaymentProof.rejectionReason = reason;
        await order.PaymentProof.save();
      }
    }

    await order.save();

    // Trigger background jobs (email, WhatsApp notification)
    setImmediate(async () => {
      try {
        const user = await User.findByPk(order.userId);
        if (!user) return;

        const customer = {
          id: user.id,
          firstName: order.customerFirstName || user.name.split(' ')[0],
          lastName: order.customerLastName || user.name.split(' ')[1] || '',
          email: order.customerEmail || user.email,
          whatsappNumber: order.customerWhatsappNumber
        };

        if (decision === 'approve') {
          // Send payment verified emails and WhatsApp
          await emailNotificationService.sendPaymentVerified(order.toJSON(), customer);
          await whatsappService.notifyPaymentVerified(order.toJSON(), customer);
        } else {
          // Send payment rejected notification
          await emailNotificationService.sendPaymentRejected(order.toJSON(), customer, reason);
          await whatsappService.notifyPaymentRejected(order.toJSON(), customer, reason);
        }

        console.log('✅ Background notifications sent for payment', decision);
      } catch (error) {
        console.error('❌ Error sending background notifications:', error);
      }
    });

    res.status(200).json({
      success: true,
      message: `Payment ${decision}ed successfully`,
      data: {
        orderId: order.orderId,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        decision,
        verifiedAt: order.verifiedAt
      }
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying payment',
      error: error.message
    });
  }
};

// ==================== Task 2.5: Update Order Status (Admin) ====================

/**
 * PUT /api/v1/admin/orders/:orderId/status
 * Admin endpoint to update order status
 */
exports.updateOrderStatus = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { orderId } = req.params;
    const adminId = req.user.id;
    const { orderStatus, trackingNumber, reason } = req.body;

    // Validate status
    const validStatuses = [
      'pending',
      'confirmed',
      'processing',
      'shipped',
      'delivered',
      'cancelled'
    ];
    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status',
        error: { orderStatus: `Status must be one of: ${validStatuses.join(', ')}` }
      });
    }

    // Find order
    const order = await Order.findOne(
      {
        where: { orderId },
        transaction: t,
        lock: t.LOCK.UPDATE
      }
    );

    if (!order) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Order not found',
        error: { orderId: 'Order not found' }
      });
    }

    // Validate status transition
    const validTransitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered'],
      delivered: [],
      cancelled: []
    };

    if (!validTransitions[order.orderStatus].includes(orderStatus)) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Invalid status transition',
        error: {
          statusTransition: `Cannot transition from ${order.orderStatus} to ${orderStatus}`
        }
      });
    }

    // Require tracking number for shipped status
    if (orderStatus === 'shipped' && !trackingNumber) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Tracking number required',
        error: { trackingNumber: 'Tracking number is required when marking order as shipped' }
      });
    }

    // Store tracking number if provided
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    // Handle cancelled status - restore inventory
    if (orderStatus === 'cancelled') {
      for (const item of order.items) {
        await Product.update(
          { stock: sequelize.literal(`stock + ${item.quantity}`) },
          {
            where: { id: item.productId },
            transaction: t
          }
        );
      }
    }

    // Record status change
    const oldStatus = order.orderStatus;
    order.orderStatus = orderStatus;

    await order.save({ transaction: t });

    // Create audit trail entry
    await OrderStatusChange.create(
      {
        orderId: order.id,
        oldStatus,
        newStatus: orderStatus,
        changedBy: adminId,
        reason: reason || null
      },
      { transaction: t }
    );

    await t.commit();

    // Trigger background jobs (WhatsApp notification)
    setImmediate(async () => {
      try {
        const fullOrder = await Order.findOne({ where: { orderId } });
        const user = await User.findByPk(fullOrder.userId);
        
        if (!user) return;

        const customer = {
          id: user.id,
          firstName: fullOrder.customerFirstName || user.name.split(' ')[0],
          lastName: fullOrder.customerLastName || user.name.split(' ')[1] || '',
          email: fullOrder.customerEmail || user.email,
          whatsappNumber: fullOrder.customerWhatsappNumber
        };

        // Send order status notification
        await whatsappService.notifyOrderStatusChange(fullOrder.toJSON(), customer, orderStatus, trackingNumber);

        console.log('✅ WhatsApp notification sent for status update:', orderId);
      } catch (error) {
        console.error('❌ Error sending status notification:', error);
      }
    });

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: {
        orderId: order.orderId,
        oldStatus,
        newStatus: order.orderStatus,
        trackingNumber: order.trackingNumber,
        updatedAt: order.updatedAt
      }
    });
  } catch (error) {
    await t.rollback();
    console.error('Order status update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order status',
      error: error.message
    });

  }
};

// ==================== Task 2.6: Get Pending Verification Orders (Admin) ====================

/**
 * GET /api/v1/admin/orders/pending-verification
 * Admin endpoint to list orders pending payment verification
 */
exports.getPendingVerificationOrders = async (req, res) => {
  try {
    const {
      status,
      paymentMethod = 'Bank_Transfer',
      startDate,
      endDate,
      customerName,
      page = 1,
      limit = 20
    } = req.query;

    // Build where clause
    const where = { paymentMethod };

    if (status) {
      where.paymentStatus = status;
    }

    // Date range filter
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt[sequelize.Op.gte] = new Date(startDate);
      }
      if (endDate) {
        where.createdAt[sequelize.Op.lte] = new Date(endDate);
      }
    }

    // Calculate offset
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Query orders with related data
    const { count, rows: orders } = await Order.findAndCountAll({
      where,
      include: [
        {
          model: User,
          attributes: ['name', 'email', 'phone'],
          required: true
        },
        {
          model: PaymentProof,
          attributes: ['id', 'fileName', 'filePath', 'uploadedAt'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
      subQuery: false
    });

    // Filter by customer name if provided
    let filtered = orders;
    if (customerName) {
      const searchTerm = customerName.toLowerCase();
      filtered = orders.filter(
        (order) =>
          order.User.name.toLowerCase().includes(searchTerm) ||
          order.User.email.toLowerCase().includes(searchTerm)
      );
    }

    res.status(200).json({
      success: true,
      message: 'Pending verification orders retrieved successfully',
      data: {
        orders: filtered.map((order) => ({
          orderId: order.orderId,
          customerName: order.User.name,
          customerEmail: order.User.email,
          customerPhone: order.User.phone,
          total: order.total,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          orderStatus: order.orderStatus,
          paymentProof: order.PaymentProof
            ? {
                fileName: order.PaymentProof.fileName,
                fileUrl: fileService.getFileUrl(
                  order.PaymentProof.filePath
                ),
                thumbnailUrl: fileService.getFileUrl(
                  order.PaymentProof.filePath
                ),
                uploadedAt: order.PaymentProof.uploadedAt
              }
            : null,
          createdAt: order.createdAt
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Pending verification orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving pending verification orders',
      error: error.message
    });
  }
};

// ==================== Legacy Endpoints ====================

// Get all orders (admin)
exports.getOrders = async (req, res) => {
  try {
    const { status, sortBy, limit = 10, offset = 0 } = req.query;
    const where = {};

    if (status) {
      where.orderStatus = status;
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
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
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
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update order status (admin only)
exports.updateOrder = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    const { orderStatus, paymentStatus } = req.body;

    if (orderStatus) {
      order.orderStatus = orderStatus;
    }

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    if (order.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to cancel this order'
      });
    }

    if (
      ['delivered', 'cancelled'].includes(order.orderStatus)
    ) {
      return res.status(400).json({
        success: false,
        error: `Cannot cancel ${order.orderStatus} order`
      });
    }

    order.orderStatus = 'cancelled';
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
