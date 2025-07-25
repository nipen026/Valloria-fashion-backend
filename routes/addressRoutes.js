// routes/addressRoutes.js
const express = require('express');
const { verifyToken } = require('../middlewares/authMiddleware');
const addressController = require('../controllers/addressController');

const router = express.Router();

router.post('/add', verifyToken(), addressController.addAddress);
router.get('/', verifyToken(), addressController.getUserAddresses);
router.put('/update/:id', verifyToken(), addressController.updateAddress);
router.delete('/delete/:id', verifyToken(), addressController.deleteAddress);

module.exports = router;
