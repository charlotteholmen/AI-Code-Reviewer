const jwt = require('jsonwebtoken')
require('dotenv').config()

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization
  const cookieToken = req.cookies.token

  const token = authHeader?.split(' ')[1] || cookieToken

  if (!token) return res.status(401).json({ message: 'No token provided' })

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your_default_secret'
    )
    req.user = decoded
    next()
  } catch {
    return res.status(403).json({ message: 'Invalid token' })
  }
}

module.exports = { authenticateToken }
