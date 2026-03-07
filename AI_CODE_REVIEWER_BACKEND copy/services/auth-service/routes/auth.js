const express = require('express')
const jwt = require('jsonwebtoken')
const User = require('../models/User.js')
const bcrypt = require('bcryptjs')
const router = express.Router()
const passport = require('passport')
require('dotenv').config()

const JWT_SECRET = process.env.JWT_SECRET || 'your_default_secret'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'
const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:5173'
const authenticateToken = require('../middleware/auth.js')

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' })
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    })

    if (existingUser) {
      return res.status(400).json({
        error: 'User already exists'
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = new User({
      username,
      email,
      password: hashedPassword
    })

    await user.save()

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )

    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password)
      return res.status(400).json({ error: 'Email and password required' })

    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' })

    const token = jwt.sign(
      { userId: user._id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )

    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// LOGOUT
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: false,
    sameSite: 'lax'
  })
  res.redirect(`${BASE_URL}/`)
})

// GitHub OAuth
router.get(
  '/github',
  passport.authenticate('github', {
    scope: ['user:email', 'read:user', 'repo']
  })
)

// router.get(
//   '/github/callback',
//   passport.authenticate('github', {
//     failureRedirect: `${BASE_URL}/login`
//   }),
//   async (req, res) => {
//     try {
//       const user = req.user

//       const token = jwt.sign(
//         { userId: user._id, username: user.username },
//         JWT_SECRET,
//         { expiresIn: JWT_EXPIRES_IN }
//       )

//       res.cookie('token', token, {
//         httpOnly: true,
//         secure: false,
//         sameSite: 'lax',
//         maxAge: 7 * 24 * 60 * 60 * 1000
//       })

//       res.redirect(`${BASE_URL}/?token=${token}`)
//     } catch {
//       res.redirect(`${BASE_URL}/error`)
//     }
//   }
// )

// routes/auth.js - Update the GitHub callback
// router.get(
//   '/github/callback',
//   passport.authenticate('github', {
//     failureRedirect: `${BASE_URL}/sign-in?error=github_auth_failed`,
//     session: false // Don't use session, use JWT
//   }),
//   async (req, res) => {
//     try {
//       const user = req.user

//       console.log(
//         '✅ GitHub OAuth successful for:',
//         user.username || user.login
//       )

//       // Create JWT token with ALL user data
//       const token = jwt.sign(
//         {
//           userId: user._id,
//           username: user.username || user.login,
//           login: user.login,
//           email: user.email,
//           avatar_url: user.avatar_url,
//           github_id: user.github_id,
//           oauth_token: user.oauth_token
//         },
//         JWT_SECRET,
//         { expiresIn: JWT_EXPIRES_IN }
//       )

//       // IMPORTANT: Redirect to dedicated callback page with token
//       // This ensures frontend can process the token
//       res.redirect(`${BASE_URL}/auth/callback?token=${token}`)
//     } catch (error) {
//       console.error('❌ GitHub callback error:', error)
//       res.redirect(`${BASE_URL}/sign-in?error=auth_failed`)
//     }
//   }
// )

// auth-service/routes/auth.js - Update GitHub callback
// routes/auth.js - Update GitHub callback
router.get(
  '/github/callback',
  passport.authenticate('github', {
    failureRedirect: `${BASE_URL}/sign-in?error=github_auth_failed`,
    session: false
  }),
  async (req, res) => {
    try {
      const user = req.user

      console.log(
        '✅ GitHub OAuth callback successful for:',
        user.username || user.login
      )
      console.log('🔑 User has access token:', !!user.oauth_token)
      console.log(
        '📦 Token in database:',
        user.oauth_token ? `${user.oauth_token.substring(0, 20)}...` : 'MISSING'
      )

      // Create JWT token with ALL user data including the REAL access token
      const token = jwt.sign(
        {
          userId: user._id,
          username: user.username || user.login,
          login: user.login,
          email: user.email,
          avatar_url: user.avatar_url,
          github_id: user.github_id,
          oauth_token: user.oauth_token, // This is now the REAL access token
          github_token: user.github_token,
          github_access_token: user.github_access_token
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      )

      // Set cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      })

      // Redirect to frontend callback with token
      res.redirect(`${BASE_URL}/auth/callback?token=${token}`)
    } catch (error) {
      console.error('❌ GitHub callback error:', error)
      res.redirect(`${BASE_URL}/sign-in?error=auth_failed`)
    }
  }
)

// In your main index.js or routes - Update profile endpoint


module.exports = router
