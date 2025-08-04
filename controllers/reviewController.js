const { Product } = require('../models');
const Review = require('../models/Review');
const User = require('../models/User');
const uploadToCloudinary = require('../utils/uploadToCloudinary');
const path = require('path')
const fs = require('fs')


exports.createReview = async (req, res, next) => {
  try {
    const { productId, rating, comment } = req.body;
    let imageUrls = [];

    if (req.files && req.files.length > 0) {
       const images = await Promise.all(
        req.files.map(f => uploadToCloudinary(f.path, 'review'))
      );
      imageUrls = await Promise.all(images);
    }

    const review = await Review.create({
      productId,
      rating,
      comment,
      images: imageUrls,
      userId: req.user.id,
    });

    res.status(201).json({ success: true, review });
  } catch (err) {
    console.error('Create review failed:', err);
    next(err);
  }
};

// exports.getProductReviews = async (req, res, next) => {
//   try {
//     const { productId } = req.params;

//     const reviews = await Review.findAll({
//       where: { productId },
//       include: [{ model: require('../models/User'), attributes: ['id', 'name'] }],
//       order: [['createdAt', 'DESC']]
//     });

//     res.json({ success: true, reviews });
//   } catch (err) {
//     next(err);
//   }
// };

exports.getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.findAll({
      where: { productId },
      include: [{ model: User, attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, reviews });
  } catch (err) {
    console.error('Error in getProductReviews:', err);
    next(err);
  }
};

// exports.getAllReviewsForAdmin = async (req, res, next) => {
//   try {
//     const reviews = await Review.findAll({
//       include: [
//         { model: User, attributes: ['id', 'name', 'email'] },
//         { model: Product, attributes: ['id', 'productName'] }
//       ],
//       order: [['createdAt', 'DESC']]
//     });

//     res.json({ success: true, reviews });
//   } catch (err) {
//     console.error('Error fetching all reviews:', err);
//     res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
//   }
// };

exports.getAllReviewsForAdmin = async (req, res, next) => {
  try {
    const reviews = await Review.findAll({
      include: [
        { model: User, attributes: ['id', 'name', 'email'] },
        { model: Product, attributes: ['id', 'productName'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, reviews });
  } catch (err) {
    console.error('Error fetching all reviews:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
  }
};
