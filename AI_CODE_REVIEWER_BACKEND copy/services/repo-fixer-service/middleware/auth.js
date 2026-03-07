// middleware/auth.js
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
    req.user = decoded;
    console.log('✅ JWT verified for user:', decoded.username || decoded.userId);
    next();
  } catch (error) {
    console.error('❌ Invalid JWT:', error.message);
    return res.status(403).json({ error: 'Invalid token' });
  }
};

module.exports = { verifyToken };