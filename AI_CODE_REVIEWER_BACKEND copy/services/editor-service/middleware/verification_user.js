const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
dotenv.config()

const verifyToken = (req, res, next) => {
  console.log('=== MIDDLEWARE ENTERED ===')
  console.log('URL:', req.url)
  console.log('Method:', req.method)

  const authHeader =
    req.headers['authorization'] || req.headers['Authorization']

  const cookieToken = req.cookies?.token

  const token = authHeader?.split(' ')[1] || cookieToken

  console.log('token:', token)

  if (!token) {
    return res.status(401).json({ message: 'Token not provided' })
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your_default_secret'
    )

    console.log('✅ JWT DECODED SUCCESSFULLY:', decoded)

    req.user = decoded
    next()
  } catch (error) {
    console.error('❌ JWT VERIFICATION FAILED:', error)
    return res.status(403).json({ message: 'Invalid or expired token' })
  }
}

module.exports = { verifyToken }
