const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');
const Product = require('./Product');

const Cart = sequelize.define('Cart', {
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  total: {
    type: DataTypes.FLOAT,
    allowNull: false,
  }
});

// Associations
User.hasMany(Cart, { foreignKey: 'userId', onDelete: 'CASCADE' });
Cart.belongsTo(User, { foreignKey: 'userId' });

Product.hasMany(Cart, { foreignKey: 'productId', onDelete: 'CASCADE' });
Cart.belongsTo(Product, { foreignKey: 'productId' });

module.exports = Cart;
