const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { verifyToken } = require('../middlewares/authMiddleware');

const Product  = require('../models/Product');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 🟢 CREATE ORDER
router.post('/create-order', verifyToken(), async (req, res) => {
  const { amount, shippingAddress } = req.body;
  const userId = req.user.id;

  try {
    const cartItems = await Cart.findAll({
      where: { userId },
      include: Product,
    });

    if (!cartItems.length) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // 1. Create order in Razorpay
    const razorpayOrder = await razorpay.orders.create({
      amount: amount * 100, // paise
      currency: 'INR',
      receipt: 'order_rcptid_' + Date.now(),
    });

    // 2. Save order in DB
    const newOrder = await Order.create({
      userId,
      totalAmount: amount,
      shippingAddress,
      razorpayOrderId: razorpayOrder.id,
      status: 'pending',
    });

    // 3. Save order items
    const orderItems = cartItems.map((item) => ({
      orderId: newOrder.id,
      productId: item.productId,
      quantity: item.quantity,
      price: amount,
    }));

    await OrderItem.bulkCreate(orderItems);

    // 4. Clear user cart
    await Cart.destroy({ where: { userId } });

    // 5. Respond
    res.status(201).json({
      success: true,
      order: razorpayOrder,
      orderId: newOrder.id,
      message: 'Order created and cart items added',
    });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 🟢 VERIFY PAYMENT
router.post('/verify', verifyToken(), async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body;

  try {
    const hmac = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (hmac !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    const order = await Order.findOne({ where: { razorpayOrderId: razorpay_order_id } });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.paymentStatus = 'paid';
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    res.json({
      success: true,
      message: 'Payment verified and order updated successfully',
      orderId: order.id,
    });
  } catch (err) {
    console.error('Payment verification error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
