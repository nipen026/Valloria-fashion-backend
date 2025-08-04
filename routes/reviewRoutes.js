const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const upload = require('../middlewares/uploadMedia');
const { verifyToken } = require('../middlewares/authMiddleware');

router.post(
  '/create',
  verifyToken(['admin','user']),
  upload.array('images', 5), // allow up to 5 images
  reviewController.createReview
);

router.get('/getAllreview', reviewController.getAllReviewsForAdmin);
router.get('/:productId', reviewController.getProductReviews);

module.exports = router;
