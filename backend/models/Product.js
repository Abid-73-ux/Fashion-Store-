const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/sequelize');

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        trim: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: { min: 0 }
    },
    originalPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    categoryId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    image: {
        type: DataTypes.STRING,
        allowNull: false
    },
    images: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
    },
    stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: { min: 0 }
    },
    sku: {
        type: DataTypes.STRING,
        unique: true,
        sparse: true
    },
    rating: {
        type: DataTypes.DECIMAL(3, 1),
        defaultValue: 0,
        validate: { min: 0, max: 5 }
    },
    reviews: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    size: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
    },
    color: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
    },
    material: {
        type: DataTypes.STRING
    },
    brand: {
        type: DataTypes.STRING
    },
    featured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
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
    tableName: 'products',
    indexes: [
        { fields: ['categoryId'] },
        { fields: ['price'] },
        { fields: ['featured'] }
    ]
});

module.exports = Product;
