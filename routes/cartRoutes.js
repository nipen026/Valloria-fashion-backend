const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.use(verifyToken()); // protect all routes

router.post('/addCart', cartController.addToCart);
router.get('/getAllCart', cartController.getUserCart);
router.put('/updateCart/:id', cartController.updateCartItem);
router.delete('/DeleteCartById/:id', cartController.removeCartItem);

module.exports = router;
