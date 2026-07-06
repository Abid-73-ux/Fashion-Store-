const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize');

const WhatsAppInteraction = sequelize.define('WhatsAppInteraction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sessionId: {
    type: DataTypes.STRING(100),
    allowNull: false,
    index: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    index: true
  },
  pageUrl: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  pageType: {
    type: DataTypes.ENUM('home', 'product', 'cart', 'checkout', 'default'),
    defaultValue: 'default'
  },
  generatedMessage: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  deviceType: {
    type: DataTypes.ENUM('mobile', 'tablet', 'desktop'),
    defaultValue: 'desktop'
  },
  browserInfo: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  cartTotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  itemCount: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'whatsapp_interactions',
  timestamps: true,
  indexes: [
    { fields: ['sessionId'] },
    { fields: ['userId'] },
    { fields: ['pageType'] },
    { fields: ['deviceType'] },
    { fields: ['timestamp'] }
  ]
});

module.exports = WhatsAppInteraction;
