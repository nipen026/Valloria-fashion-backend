const express = require('express');
const crypto = require('crypto');
const razorpay = require('../config/razorpay');
const Order = require('../models/Order');
const { verifyToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/create-order', verifyToken(), async (req, res) => {
  const { amount } = req.body;

  const options = {
    amount: amount * 100, // amount in paise
    currency: 'INR',
    receipt: 'order_rcptid_' + Date.now(),
  };

  try {
    const order = await razorpay.orders.create(options);
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/verify', verifyToken(), async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderId,
  } = req.body;

  const hmac = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id + '|' + razorpay_payment_id)
    .digest('hex');

  if (hmac !== razorpay_signature) {
    return res.status(400).json({ success: false, message: 'Invalid signature' });
  }

  const order = await Order.findByPk(orderId);
  if (!order) return res.status(404).json({ message: 'Order not found' });

  order.status = 'paid';
  await order.save();

  res.json({ success: true, message: 'Payment verified and order updated' });
});

module.exports = router;
