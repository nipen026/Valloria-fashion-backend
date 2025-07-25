// controllers/userController.js
const User = require('../models/User');
const Address = require('../models/Address');
const Order = require('../models/Order');

exports.getAccountInfo = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get user basic info
    const user = await User.findByPk(userId, {
      attributes: ['name', 'email', 'number']
    });

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Get addresses
    const addresses = await Address.findAll({
      where: { userId },
      attributes: ['id', 'addressLine', 'city', 'state', 'pincode', 'isDefault']
    });

    // Get orders (limited + formatted)
    const orders = await Order.findAll({
      where: { userId },
      attributes: ['id', 'createdAt', 'totalAmount', 'deliveryStatus'],
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    // Format response
    const response = {
      name: user.name,
      email: user.email,
      number: user.number,
      addresses: addresses.map(addr => ({
        id: addr.id,
        type: addr.isDefault ? 'Home' : 'Other',
        address: `${addr.addressLine}, ${addr.city}, ${addr.state}, ${addr.pincode}`
      })),
      orders: orders.map(order => ({
        id: `ORD${order.id}`,
        date: order.createdAt.toISOString().split('T')[0],
        total: order.totalAmount,
        status: order.deliveryStatus || 'Pending'
      }))
    };

    res.json({ success: true, user: response });
  } catch (err) {
    console.error(err);
    next(err);
  }
};
