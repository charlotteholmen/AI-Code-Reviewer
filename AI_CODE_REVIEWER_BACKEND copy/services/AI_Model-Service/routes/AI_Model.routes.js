// // const express = require('express')

// // const { sendToQueue } = require('../rabbitMQ/producer.js')
// // const { verifyToken } = require('../middleware/authenticationVerify.js') // FIXED

// // const router = express.Router()

// // router.post('/run', verifyToken, async (req, res) => {
// //   try {
// //     const { message } = req.body
// //     const userID = req.user.userId
// //     const userName = req.user.username
// //     await sendToQueue(message, userID, userName)

// //     res
// //       .status(200)
// //       .json({ message: 'Message Submitted To Queue For Processing' })
// //   } catch (err) {
// //     console.log(err)
// //     res.status(500).json({ error: 'Failed to process message' })
// //   }
// // })

// // module.exports = router

// // New one

// const express = require('express')
// const { sendToQueue } = require('../rabbitMQ/producer.js')
// const { verifyToken } = require('../middleware/authenticationVerify.js')
// const ChatHistory = require('../models/AI_Model_History.js') // ADD THIS

// const router = express.Router()

// router.post('/run', verifyToken, async (req, res) => {
//   try {
//     const { message } = req.body
//     const userID = req.user.userId
//     const userName = req.user.username
//     await sendToQueue(message, userID, userName)

//     res
//       .status(200)
//       .json({ message: 'Message Submitted To Queue For Processing' })
//   } catch (err) {
//     console.log(err)
//     res.status(500).json({ error: 'Failed to process message' })
//   }
// })

// router.get('/health', (req, res) => {
//   res.json({
//     status: 'healthy',
//     service: 'AI Model Service',
//     timestamp: new Date().toISOString()
//   })
// })

// // Chat history endpoint
// router.get('/history/:userId', verifyToken, async (req, res) => {
//   try {
//     const { userId } = req.params

//     // Try to find chat history
//     const history = await ChatHistory.findOne({ user: userId })

//     if (!history) {
//       return res.status(200).json({
//         success: true,
//         messages: [],
//         message: 'No chat history found'
//       })
//     }

//     res.json({
//       success: true,
//       messages: history.messages || [],
//       total: history.messages?.length || 0,
//       lastUpdated: history.updatedAt
//     })
//   } catch (error) {
//     console.error('Error fetching chat history:', error)
//     res.status(500).json({
//       error: 'Failed to fetch chat history',
//       details: error.message
//     })
//   }
// })

// module.exports = router



// new deepseek

// const express = require('express')
// const { sendToQueue } = require('../rabbitMQ/producer.js')
// const { verifyToken } = require('../middleware/authenticationVerify.js')
// const ChatHistory = require('../models/AI_Model_History.js')

// const router = express.Router()

// // Development mode auth bypass
// const devModeAuth = (req, res, next) => {
//   // For development, bypass auth if no token
//   const authHeader = req.headers.authorization
//   if (!authHeader) {
//     console.log('=== AI SERVICE AUTH (TEMPORARY BYPASS) ===')
//     console.log('⚠️ DEVELOPMENT MODE: Bypassing all auth checks')
//     console.log('No authorization header')
    
//     // Use test user for development
//     req.user = {
//       userId: '698b0a6b3f21fba10b449a5a',
//       username: 'Test User'
//     }
//     console.log('✅ Using user for request:', req.user)
//     return next()
//   }
  
//   // Otherwise use normal auth
//   verifyToken(req, res, next)
// }

// router.post('/run', devModeAuth, async (req, res) => {
//   try {
//     const { message } = req.body
//     const userID = req.user.userId
//     const userName = req.user.username
    
//     if (!message) {
//       return res.status(400).json({ error: 'Message is required' })
//     }
    
//     console.log('📨 AI request received:', {
//       userId: userID,
//       userName: userName,
//       messageLength: message.length
//     })
    
//     await sendToQueue(message, userID, userName)

//     res.status(200).json({ 
//       message: 'Message Submitted To Queue For Processing',
//       userId: userID
//     })
//   } catch (err) {
//     console.error('Error in AI run:', err)
//     res.status(500).json({ error: 'Failed to process message' })
//   }
// })

// router.get('/health', (req, res) => {
//   res.json({
//     status: 'healthy',
//     service: 'AI Model Service',
//     timestamp: new Date().toISOString(),
//     websocket: 'ws://localhost:8080/ws'
//   })
// })

// router.get('/history/:userId', async (req, res) => {
//   try {
//     const { userId } = req.params
//     console.log('Fetching history for user:', userId)

//     const history = await ChatHistory.findOne({ user: userId })

//     if (!history) {
//       return res.status(200).json({
//         success: true,
//         messages: [],
//         message: 'No chat history found'
//       })
//     }

//     res.json({
//       success: true,
//       messages: history.messages || [],
//       total: history.messages?.length || 0,
//       lastUpdated: history.updatedAt
//     })
//   } catch (error) {
//     console.error('Error fetching chat history:', error)
//     res.status(500).json({
//       success: false,
//       error: 'Failed to fetch chat history',
//       details: error.message
//     })
//   }
// })


// // Add this route to get latest AI responses
// router.get('/latest/:userId', async (req, res) => {
//   try {
//     const { userId } = req.params
    
//     const history = await ChatHistory.findOne({ user: userId })
    
//     if (!history || !history.messages || history.messages.length === 0) {
//       return res.json({ 
//         success: false, 
//         message: 'No messages found' 
//       })
//     }
    
//     // Get the latest AI message
//     const aiMessages = history.messages
//       .filter(msg => msg.sender === 'AI' || msg.sender === 'ai')
//       .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    
//     if (aiMessages.length > 0) {
//       res.json({
//         success: true,
//         content: aiMessages[0].content,
//         timestamp: aiMessages[0].timestamp,
//         totalMessages: history.messages.length
//       })
//     } else {
//       res.json({ 
//         success: false, 
//         message: 'No AI messages found' 
//       })
//     }
//   } catch (error) {
//     console.error('Error fetching latest AI response:', error)
//     res.status(500).json({ error: 'Failed to fetch latest response' })
//   }
// })

// module.exports = router





//  deep seek new one




const express = require('express')
const { sendToQueue } = require('../rabbitMQ/producer.js')
const { verifyToken } = require('../middleware/authenticationVerify.js')
const ChatHistory = require('../models/AI_Model_History.js')

const router = express.Router()

// Development mode auth bypass - FIXED to use actual userId
const devModeAuth = (req, res, next) => {
  const authHeader = req.headers.authorization
  
  // Check if userId is provided in the request body
  const { userId } = req.body
  
  if (userId) {
    console.log('✅ Using userId from request body:', userId)
    req.user = {
      userId: userId,
      username: req.body.username || 'User'
    }
    return next()
  }
  
  // Fallback to test user only if no userId provided
  console.log('⚠️ No userId provided, using test user')
  req.user = {
    userId: '698b0a6b3f21fba10b449a5a',
    username: 'Test User'
  }
  return next()
}

router.post('/run', devModeAuth, async (req, res) => {
  try {
    const { message } = req.body
    const userID = req.user.userId
    const userName = req.user.username
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' })
    }
    
    console.log('📨 AI request received:', {
      userId: userID,
      userName: userName,
      messageLength: message.length
    })
    
    await sendToQueue(message, userID, userName)

    res.status(200).json({ 
      message: 'Message Submitted To Queue For Processing',
      userId: userID  // Return the actual userId used
    })
  } catch (err) {
    console.error('Error in AI run:', err)
    res.status(500).json({ error: 'Failed to process message' })
  }
})

router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'AI Model Service',
    timestamp: new Date().toISOString()
  })
})

router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    console.log('Fetching history for user:', userId)

    const history = await ChatHistory.findOne({ user: userId })

    if (!history) {
      return res.status(200).json({
        success: true,
        messages: [],
        message: 'No chat history found'
      })
    }

    res.json({
      success: true,
      messages: history.messages || [],
      total: history.messages?.length || 0,
      lastUpdated: history.updatedAt
    })
  } catch (error) {
    console.error('Error fetching chat history:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch chat history'
    })
  }
})

module.exports = router