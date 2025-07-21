const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Order = require('./Order');
const Product = require('./Product');

const OrderItem = sequelize.define('OrderItem', {
  quantity: DataTypes.INTEGER,
  price: DataTypes.FLOAT, // price at the time of order
});

Order.hasMany(OrderItem, { foreignKey: 'orderId', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

Product.hasMany(OrderItem, { foreignKey: 'productId', onDelete: 'CASCADE' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });


module.exports = OrderItem;
