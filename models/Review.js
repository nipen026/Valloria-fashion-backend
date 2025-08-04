const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');
const Product = require('./Product');

const Review = sequelize.define('Review', {
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 5 }
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  images: {
    type: DataTypes.ARRAY(DataTypes.STRING), // URLs from Cloudinary
    defaultValue: []
  }
});

// User.hasMany(Review, { foreignKey: 'userId', onDelete: 'CASCADE' });
// Review.belongsTo(User, { foreignKey: 'userId' });

// Product.hasMany(Review, { foreignKey: 'productId', onDelete: 'CASCADE' });
// Review.belongsTo(Product, { foreignKey: 'productId' });

module.exports = Review;
