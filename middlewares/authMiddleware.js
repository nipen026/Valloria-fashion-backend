const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.verifyToken = (roles = []) => {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token' });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ message: 'Invalid token' });

      req.user = decoded;
      if (roles.length && !roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      next();
    });
  };
};
