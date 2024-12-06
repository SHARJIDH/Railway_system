const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const auth_head = req.headers['authorization'];
  const token = auth_head && auth_head.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

const isAdmin = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
    return res.status(403).json({ message: 'Admin access denied' });
  }
  
  next();
};

module.exports = {
  authenticateToken,
  isAdmin
};
