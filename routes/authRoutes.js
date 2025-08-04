const express = require('express');
const passport = require('passport');
const authController = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');
const User = require('../models/User');
require('../auth/google'); // initialize Google strategy
const jwt = require('jsonwebtoken');
const router = express.Router();

// JWT Auth
router.post('/register', authController.register);
router.post('/login', authController.login);

// Google Auth
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/' }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user.id, email: req.user.email, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    // Send token in frontend-friendly way (redirect or response)
    process.env.NODE_ENV === 'local' ?
    res.redirect(`http://localhost:5173/login/success?token=${token}`) : res.redirect(`https://www.vigobee.com/login/success?token=${token}`);
  }
);

// Role-protected example
router.get('/admin', verifyToken(['admin']), (req, res) => {
  res.send('Hello Admin');
});
router.get('/admin/getAllUsers', verifyToken(['admin']), async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'number', 'createdAt'] // avoid sending passwords
    });
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch users', error: error.message });
  }
});
module.exports = router;
