// index.js
const express = require('express')
const cors = require('cors')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const { WebSocketServer } = require('ws')
const http = require('http')
require('dotenv').config()

const connectDB = require('./DB/db.js')
const codeEditorRoutes = require('./routes/code_editor.routes.js')
const { startConsumer } = require('./rabbitmq/consumer.js')

// Connect to MongoDB
connectDB()

const PORT = process.env.PORT || 8080
const app = express()

// CORS - update with your frontend URL
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use(
  session({
    name: 'editor_service_sid',
    secret: process.env.SESSION_SECRET || 'default-secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
      sameSite: 'lax'
    }
  })
)

// Routes
app.use('/editor', codeEditorRoutes)

// Health endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  })
})

// Create HTTP server
const server = http.createServer(app)

// WebSocket server on same server
const wss = new WebSocketServer({ server })
const clients = new Map()

wss.on('connection', (ws, request) => {
  const url = new URL(request.url, `http://${request.headers.host}`)
  const userId = url.searchParams.get('userId')

  if (!userId) {
    ws.close(1008, 'User ID required')
    return
  }

  clients.set(userId, ws)
  console.log(`✅ User ${userId} connected. Total connections: ${clients.size}`)

  ws.send(JSON.stringify({
    type: 'connected',
    message: 'WebSocket connected successfully',
    userId
  }))

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString())
      console.log(`📨 Message from ${userId}:`, message)
    } catch (err) {
      console.error('❌ Error parsing message:', err)
    }
  })

  ws.on('close', (code, reason) => {
    clients.delete(userId)
    console.log(`❌ User ${userId} disconnected. Remaining: ${clients.size}`)
  })

  ws.on('error', (err) => {
    console.error(`❌ WebSocket error for ${userId}:`, err)
  })
})

// Global function to send messages
global.sendToUser = (userId, data) => {
  const client = clients.get(userId)
  if (client && client.readyState === 1) {
    client.send(JSON.stringify(data))
    return true
  }
  console.log(`⚠️ User ${userId} not connected`)
  return false
}

// Start RabbitMQ Consumer
startConsumer().then(() => {
  console.log('🚀 RabbitMQ Consumer Started')
}).catch(err => {
  console.error('❌ Failed to start RabbitMQ Consumer:', err)
})

// Start server
server.listen(PORT, () => {
  console.log(`🚀 HTTP + WebSocket Server running on port ${PORT}`)
})