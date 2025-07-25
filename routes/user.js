const express = require('express');
const router = express.Router();

const { verifyToken } = require('../middlewares/authMiddleware');
const { getAccountInfo } = require('../controllers/userController');


router.get('/account', verifyToken(['admin','user']), getAccountInfo);

module.exports = router;
