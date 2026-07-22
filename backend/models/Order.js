const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize');
const User = require('./User');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  orderId: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  items: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  tax: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  shipping: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  discount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'),
    defaultValue: 'pending',
    allowNull: true // Keep for backward compatibility
  },
  orderStatus: {
    type: DataTypes.ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'),
    defaultValue: 'pending'
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'verified', 'failed'),
    defaultValue: 'pending'
  },
  paymentMethod: {
    type: DataTypes.ENUM('COD', 'Bank_Transfer'),
    defaultValue: 'COD'
  },
  verifiedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  shippingAddress: {
    type: DataTypes.JSON,
    allowNull: true
  },
  billingAddress: {
    type: DataTypes.JSON,
    allowNull: true
  },
  trackingNumber: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  couponCode: {
    type: DataTypes.STRING(50),
    allowNull: true
  }
}, {
  tableName: 'orders',
  timestamps: true
});

// Association with User
Order.belongsTo(User, { foreignKey: 'userId', allowNull: false });

// Associations for payment verification (loaded after model definition to avoid circular dependencies)
Order.associate = function(models) {
  Order.hasOne(models.PaymentProof, { 
    foreignKey: 'orderId',
    onDelete: 'CASCADE'
  });
  Order.hasMany(models.OrderStatusChange, { 
    foreignKey: 'orderId',
    onDelete: 'CASCADE'
  });
};

module.exports = Order;
