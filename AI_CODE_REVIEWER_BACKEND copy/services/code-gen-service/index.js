const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const dotenv = require('dotenv')

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3005

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : ['http://localhost:5173', 'http://localhost'],
    credentials: true
  })
)
app.use(express.json({ limit: '10mb' }))

// MongoDB Connection
const mongoUri = process.env.MONGODB_URI
mongoose
  .connect(mongoUri)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err))

// Routes
app.use('/api/generate', require('./routes/generate.routes'))
// index.js - Add this line
app.use('/api/chat', require('./routes/chat.routes'));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'code-gen-service',
    timestamp: new Date().toISOString(),
    port: PORT
  })
})

app.listen(PORT, () => {
  console.log(`🚀 Code Generation Service running on port ${PORT}`)
})
