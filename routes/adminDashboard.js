const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const { getAdminDashboard } = require('../controllers/adminDashboardController');

router.get('/getAllDashboardData', verifyToken(['admin']), getAdminDashboard);

module.exports = router;
