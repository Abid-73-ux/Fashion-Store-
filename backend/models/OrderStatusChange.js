const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize');

const OrderStatusChange = sequelize.define('OrderStatusChange', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'orders',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  oldStatus: {
    type: DataTypes.STRING(30),
    allowNull: true
  },
  newStatus: {
    type: DataTypes.STRING(30),
    allowNull: false
  },
  changedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'orderstatuschanges',
  timestamps: false // Only createdAt, no updatedAt for audit records
});

module.exports = OrderStatusChange;
