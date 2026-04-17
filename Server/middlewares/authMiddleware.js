const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'oiuytrewjhgfdsiuytremnbvcxuytrebvcxfdspoiuytrewlkjhgfdsaiuytrew');

      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({ success: false, message: 'User deleted or not found. Please log in again.' });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('[AUTH ERROR]', error.message);
      res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

// Middleware tùy chọn: nếu có token thì xác thực, không có thì vẫn cho qua
const optionalProtect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'oiuytrewjhgfdsiuytremnbvcxuytrebvcxfdspoiuytrewlkjhgfdsaiuytrew');
      req.user = await User.findById(decoded.id).select('-password');
    } catch {
      req.user = null;
    }
  } else {
    req.user = null;
  }
  next();
};

module.exports = { protect, optionalProtect };