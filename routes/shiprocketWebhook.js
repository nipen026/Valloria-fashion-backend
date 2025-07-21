const express = require('express');
const Order = require('../models/Order');
const router = express.Router();

router.post('/status', async (req, res) => {
  try {
    const { awb, current_status } = req.body;

    const order = await Order.findOne({ where: { awbCode: awb } });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.deliveryStatus = current_status;
    await order.save();

    console.log(`📦 Updated delivery status for order #${order.id}: ${current_status}`);
    res.status(200).send('OK');
  } catch (err) {
    console.error('Webhook error:', err.message);
    res.status(500).send('Error');
  }
});

module.exports = router;
