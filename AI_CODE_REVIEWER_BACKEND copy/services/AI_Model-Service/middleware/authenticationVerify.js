const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const verifyToken = (req, res, next) => {
  console.log('=== AI SERVICE AUTH (TEMPORARY BYPASS) ===');
  
  // ✅ TEMPORARY: Allow all requests for testing - ALWAYS bypass
  console.log('⚠️ DEVELOPMENT MODE: Bypassing all auth checks');
  
  // Create a dummy user from token or params
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  let userId = 'test_user';
  let username = 'Test User';
  
  if (authHeader) {
    console.log('Authorization header present');
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;
    
    try {
      // Try to decode to get real user info
      const decoded = jwt.decode(token);
      if (decoded) {
        userId = decoded.userId || decoded._id || 'test_user';
        username = decoded.username || decoded.name || 'Test User';
        console.log('Decoded token:', { userId, username });
      }
    } catch (err) {
      console.log('Could not decode token, using default user');
    }
  } else {
    console.log('No authorization header');
  }
  
  // If there's a userId in params, use it
  if (req.params.userId) {
    userId = req.params.userId;
    console.log('Using userId from params:', userId);
  }
  
  // Get userId from body if present (for /run endpoint)
  if (req.body && req.body.userId) {
    userId = req.body.userId;
    console.log('Using userId from body:', userId);
  }
  
  req.user = { 
    userId: userId,
    username: username 
  };
  
  console.log('✅ Using user for request:', req.user);
  return next();
};

module.exports = { verifyToken };