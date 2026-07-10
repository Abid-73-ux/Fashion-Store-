const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize');
const Category = require('./Category');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  salePrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  sku: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false
  },
  image: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  images: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  size: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  color: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  material: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0
  },
  reviews: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  inStock: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isNew: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isBestseller: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isSale: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'products',
  timestamps: true
});

// Association with Category
Product.belongsTo(Category, { foreignKey: 'categoryId', allowNull: true });

module.exports = Product;
