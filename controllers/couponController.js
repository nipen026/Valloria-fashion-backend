const Coupon = require('../models/Coupon');

exports.createCoupon = async (req, res, next) => {
  try {
    const { code, discountType, discountValue, minOrderAmount, expiresAt,label } = req.body;

    const newCoupon = await Coupon.create({
      code,
      discountType,
      discountValue,
      minOrderAmount,
      expiresAt,
      label
    });

    res.status(201).json({ success: true, coupon: newCoupon });
  } catch (err) {
    next(err);
  }
};

exports.validateCoupon = async (req, res, next) => {
  try {
    const { code, orderAmount } = req.body;

    const coupon = await Coupon.findOne({ where: { code, isActive: true } });

    if (!coupon) {
      return res.status(400).json({ success: false, message: 'Invalid coupon code' });
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return res.status(400).json({ success: false, message: 'Coupon expired' });
    }

    if (orderAmount < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount is ${coupon.minOrderAmount}`,
      });
    }

    let discountAmount = 0;

    if (coupon.discountType === 'percentage') {
      discountAmount = (coupon.discountValue / 100) * orderAmount;
    } else {
      discountAmount = coupon.discountValue;
    }

    res.json({
      success: true,
      coupon: coupon.code,
      discountAmount,
    });
  } catch (err) {
    next(err);
  }
};
exports.getAllCouponsForAdmin = async (req, res, next) => {
  try {
    const coupons = await Coupon.findAll({
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, coupons });
  } catch (err) {
    console.error('Error fetching coupons:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch coupons' });
  }
};