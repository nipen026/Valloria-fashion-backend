const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.post('/create', verifyToken(['admin']),couponController.createCoupon); // Admin
router.post('/validate',verifyToken(['admin','user']), couponController.validateCoupon); // User applies coupon
router.get('/getAllCoupon', couponController.getAllCouponsForAdmin); // User applies coupon

module.exports = router;
