/**
 * Store Settings Model
 * Manages configurable store-wide settings for currency, tax, shipping
 * Only one active settings record should exist
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize');

const StoreSettings = sequelize.define('StoreSettings', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  // Currency Settings
  currency: {
    type: DataTypes.STRING(10),
    defaultValue: 'PKR',
    allowNull: false,
    comment: 'Currency code (e.g., PKR, USD, EUR)'
  },
  
  currencySymbol: {
    type: DataTypes.STRING(5),
    defaultValue: 'Rs',
    allowNull: false,
    comment: 'Currency symbol to display (e.g., Rs, $, €)'
  },
  
  // Tax Settings
  taxPercentage: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
    allowNull: false,
    validate: {
      min: 0,
      max: 100
    },
    comment: 'Tax percentage (0-100). Set to 0 to disable tax'
  },
  
  // Shipping Settings
  shippingCost: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    allowNull: false,
    validate: {
      min: 0
    },
    comment: 'Shipping charge for orders below threshold'
  },
  
  freeShippingThreshold: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 5000,
    allowNull: false,
    validate: {
      min: 0
    },
    comment: 'Order amount above which shipping is free'
  },
  
  // Store Information
  storeName: {
    type: DataTypes.STRING(100),
    defaultValue: 'TAKANJ',
    comment: 'Store name'
  },
  
  storePhone: {
    type: DataTypes.STRING(20),
    comment: 'Store contact phone'
  },
  
  storeEmail: {
    type: DataTypes.STRING(100),
    comment: 'Store contact email'
  },
  
  // Timestamps
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    onUpdate: DataTypes.NOW
  }
}, {
  tableName: 'store_settings',
  timestamps: true,
  comment: 'Global store configuration settings'
});

module.exports = StoreSettings;
