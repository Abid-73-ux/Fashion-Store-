const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize');

const PaymentProof = sequelize.define('PaymentProof', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'orders',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  filePath: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  fileName: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  fileSize: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  mimeType: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  uploadedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  verifiedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  verifiedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'paymentproofs',
  timestamps: true
});

module.exports = PaymentProof;
