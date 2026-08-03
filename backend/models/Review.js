const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize');

const Review = sequelize.define('Review', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5
        }
    },
    title: {
        type: DataTypes.STRING,
        allowNull: true
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    isApproved: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'Reviews',
    timestamps: true
});

// Association with Product
Review.belongsTo(require('./Product'), { foreignKey: 'productId', allowNull: false });

// Association with User
Review.belongsTo(require('./User'), { foreignKey: 'userId', allowNull: false });

module.exports = Review;
