const express = require('express')
const cors = require('cors')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const { WebSocketServer } = require('ws')
const http = require('http')
require('dotenv').config()

const connectDB = require('./DB/db.js')
const AIRoutes = require('./routes/AI_Model.routes.js')
const { startConsumer } = require('./rabbitMQ/consumer.js')

connectDB()

const PORT = process.env.PORT || 3003
const WS_PORT = process.env.WS_PORT || 8080

const app = express()

// ✅ Create HTTP server
const server = http.createServer(app)

// ✅ Create WebSocket server on the SAME server
const wss = new WebSocketServer({ 
  server, // Use the same server
  path: '/ws'
})

const clients = new Map()

wss.on('connection', (ws, request) => {
  console.log('🔗 WebSocket connection attempt')
  
  // Extract userId from query parameters
  const url = new URL(request.url, `ws://${request.headers.host}`)
  const userId = url.searchParams.get('userId')
  
  console.log('User ID from query:', userId)

  if (!userId) {
    console.log('❌ No userId provided, closing connection')
    ws.close(4001, 'User ID required')
    return
  }

  // Store the connection
  clients.set(userId, ws)
  console.log(`✅ WebSocket connected for user: ${userId}. Total clients: ${clients.size}`)
  
  // Send immediate confirmation
  ws.send(JSON.stringify({
    type: 'connected',
    message: 'WebSocket connection established',
    userId: userId,
    timestamp: new Date().toISOString()
  }))

  ws.on('close', (code, reason) => {
    console.log(`❌ WebSocket disconnected for user: ${userId}, code: ${code}, reason: ${reason}`)
    clients.delete(userId)
    console.log(`📊 Remaining clients: ${clients.size}`)
  })
  
  ws.on('error', (error) => {
    console.error(`❌ WebSocket error for user ${userId}:`, error)
  })
})

// Global function to send messages
global.sendToUser = (userId, data) => {
  const client = clients.get(userId)
  if (client && client.readyState === 1) { // 1 = OPEN
    client.send(JSON.stringify(data))
    console.log(`✅ WebSocket message sent to user: ${userId}`)
    return true
  }
  console.log(`⚠️ User ${userId} not connected via WebSocket`)
  return false
}

// Middleware
app.use(cors({ 
  origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : 'http://localhost:5173', 
  credentials: true 
}))
app.use(express.json())
app.use(cookieParser())

app.use('/api/ai', AIRoutes)

app.get('/health', (req, res) => res.json({ 
  status: 'OK',
  service: 'AI Service',
  websocket: `ws://localhost:${WS_PORT}/ws`
}))

app.get('/ws-test', (req, res) => {
  res.json({
    websocket_url: `ws://localhost:${WS_PORT}/ws`,
    status: 'WebSocket server running',
    connected_clients: clients.size
  })
})

// Start server
startConsumer()

server.listen(PORT, () => {
  console.log(`🚀 AI Service HTTP running on port ${PORT}`)
  console.log(`🔗 WebSocket available at ws://localhost:${WS_PORT}/ws`)
})