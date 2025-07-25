const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const Order = sequelize.define('Order', {
    status: {
        type: DataTypes.STRING,
        defaultValue: 'pending', // pending, paid, shipped, delivered
    },
    totalAmount: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    shippingAddress: DataTypes.STRING,
    shipmentId: DataTypes.STRING,
    awbCode: DataTypes.STRING,
    deliveryStatus: DataTypes.STRING,
    paymentStatus: {type:DataTypes.STRING, defaultValue: 'pending'},
    razorpayPaymentId: DataTypes.STRING,
    razorpayOrderId: DataTypes.STRING,
});

User.hasMany(Order, { foreignKey: 'userId', onDelete: 'CASCADE' });
Order.belongsTo(User, { foreignKey: 'userId' });

module.exports = Order;
