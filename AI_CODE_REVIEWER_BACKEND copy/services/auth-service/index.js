const express = require('express')
const cors = require('cors')
const passport = require('passport')
const session = require('express-session')
const cookieParser = require('cookie-parser')

const User = require('./models/User.js')

require('dotenv').config()

const connectDB = require('./DB/db.js')
const authRoutes = require('./routes/auth.js')
const { authenticateToken } = require('./middleware/auth.js')

require('./oAuth_Service/github_service.js')

// Connect to MongoDB
connectDB()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : ['http://localhost:5173', 'http://localhost'],
    credentials: true
  })
)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'default_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000
    }
  })
)

// Passport
app.use(passport.initialize())
app.use(passport.session())

// Routes
app.use('/api/auth', authRoutes)

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Auth Service is running',
    timestamp: new Date().toISOString(),
    service: 'auth-service'
  })
})

// Protected route - Get user profile
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password')

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Make sure to include the access token in the response
    res.json({
      message: 'Profile fetched successfully',
      user: {
        ...user.toObject(),
        // Ensure token is included
        oauth_token: user.oauth_token,
        github_token: user.github_token,
        github_access_token: user.github_access_token
      }
    })
  } catch (err) {
    console.error('Profile fetch error:', err)
    res.status(500).json({ error: 'Profile fetch failed' })
  }
})



app.listen(PORT, () => {
  console.log(`✅ Auth service running on port ${PORT}`)
})
