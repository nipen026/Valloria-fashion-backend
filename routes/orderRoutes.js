const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { trackOrder } = require('../services/shiprocketService');

router.use(verifyToken()); // Protect all routes

router.post('/addOrder', orderController.placeOrder); // user checkout
router.get('/getAllOrder', orderController.getUserOrders); // user order list  
router.get('/track/:awb', verifyToken(), async (req, res) => {
  try {
    const tracking = await trackOrder(req.params.awb);
    res.json(tracking);
  } catch (err) {
    res.status(500).json({ error: 'Tracking failed' });
  }
});
router.get('/admin/all', verifyToken(['admin']), orderController.getAllOrders); // admin only
router.put('/updateOrder/:id/status', verifyToken(['admin']), orderController.updateOrderStatus); // admin
router.get('/getOrderSummary', verifyToken(['admin']), orderController.getOrderSummary); // admin
router.get('/getRecentAndPastOrders',  orderController.getRecentAndPastOrders); 
module.exports = router;