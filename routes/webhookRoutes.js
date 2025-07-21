const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Order = require('../models/Order');

router.post('/razorpay', express.json({ type: 'application/json' }), async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'];

  const payload = JSON.stringify(req.body);
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  if (signature !== expectedSignature) {
    return res.status(400).json({ message: 'Invalid webhook signature' });
  }

  const event = req.body.event;
  const data = req.body.payload;

  try {
    if (event === 'payment.failed') {
      const razorpayOrderId = data.payment.entity.order_id;

      // Optionally log or store failed attempt
      console.log(`Payment failed for order ${razorpayOrderId}`);
    }

    if (event === 'refund.processed') {
      const paymentId = data.refund.entity.payment_id;

      console.log(`Refund issued for payment: ${paymentId}`);
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ error: 'Webhook handler error' });
  }
});

module.exports = router;
