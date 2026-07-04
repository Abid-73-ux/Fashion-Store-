const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/sequelize');

const Coupon = sequelize.define('Coupon', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        uppercase: true,
        trim: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    discountType: {
        type: DataTypes.ENUM('percentage', 'fixed'),
        allowNull: false
    },
    discountValue: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: { min: 0 }
    },
    maxDiscount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    minPurchase: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    usageLimit: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    usageCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    usedBy: {
        type: DataTypes.ARRAY(DataTypes.UUID),
        defaultValue: []
    },
    expiryDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    timestamps: true,
    tableName: 'coupons'
});

module.exports = Coupon;
