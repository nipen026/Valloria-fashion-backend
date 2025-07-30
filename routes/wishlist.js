const express = require('express');
const router = express.Router();
const { addToWishlist, removeFromWishlist, getWishlist } = require('../controllers/wishlistController');
const { verifyToken } = require('../middlewares/authMiddleware');
router.use(verifyToken()); // protect all routes
router.post('/add', addToWishlist);
router.delete('/remove/:id', removeFromWishlist);
router.get('/', getWishlist);

module.exports = router;
