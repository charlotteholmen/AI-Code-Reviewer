// const amqplib = require('amqplib')
// const { Cerebras_AI_Service } = require('../AI_Service/Cerebreas_AI.service.js')
// const { enhancePreviousAIResponse } = require('../AI_Service/Groq_AI.Service.js')
// const ChatHistory = require('../models/AI_Model_History.js')

// let channel = null

// async function connectRabbitMQ() {
//   try {
//     const connection = await amqplib.connect('amqp://rabbitmq:5672')
//     channel = await connection.createChannel()

//     // CREATE QUEUE
//     await channel.assertQueue('AI_Model_Queue', { durable: true })

//     // CREATE SAME EXCHANGE USED BY PRODUCER
//     await channel.assertExchange('AI_Model_Exchange', 'direct', { durable: true })

//     // BIND QUEUE TO EXCHANGE WITH SAME ROUTING KEY
//     await channel.bindQueue(
//       'AI_Model_Queue',
//       'AI_Model_Exchange',
//       'AI_Model_Routing_Key'
//     )

//     console.log('✅ Connected to RabbitMQ')
//     return channel
//   } catch (error) {
//     console.error('❌ RabbitMQ connection failed:', error)
//     throw error
//   }
// }

// async function startConsumer() {
//   try {
//     if (!channel) {
//       await connectRabbitMQ()
//     }

//     console.log('🔄 Waiting for messages in AI_Model_Queue...')

//     channel.consume('AI_Model_Queue', async msg => {
//       if (msg !== null) {
//         try {

//           const message = JSON.parse(msg.content.toString())
//           console.log('📨 Received AI_Model message:', message)

//           // STEP 1: INITIAL RESPONSE
//           console.log('🔄 Getting initial response from Cerebras AI...')
//           const initialResponse = await Cerebras_AI_Service(
//             message.userName,
//             message.message
//           )
//           console.log('✅ Cerebras AI Response completed')

//           // STEP 2: ENHANCEMENT
//           console.log('🔄 Enhancing response with Groq AI...')
//           const enhancedResponse = await enhancePreviousAIResponse(
//             message.userName,
//             message.message,
//             initialResponse
//           )
//           console.log('🎯 Enhanced Final Response:', enhancedResponse)

//           // ACK MESSAGE
//           channel.ack(msg)
//           console.log('✅ Message acknowledged')

//           // SAVE TO DB
//           await ChatHistory.findOneAndUpdate(
//             { user: message.userId },
//             {
//               $push: {
//                 messages: [
//                   {
//                     sender: "user",
//                     content: message.message
//                   },
//                   {
//                     sender: "AI",
//                     content: enhancedResponse
//                   }
//                 ]
//               }
//             },
//             { upsert: true, new: true }
//           )

//         } catch (error) {
//           console.error('❌ Failed to process AI_Model message:', error)
//           channel.nack(msg)
//         }
//       }
//     })
//   } catch (error) {
//     console.error('❌ Consumer connection failed:', error)
//     throw error
//   }
// }

// module.exports = { connectRabbitMQ, startConsumer }

// NEW

// rabbitMQ/consumer.js - WORKING VERSION
const amqplib = require('amqplib')
const { Cerebras_AI_Service } = require('../AI_Service/Cerebreas_AI.service.js')
const {
  enhancePreviousAIResponse
} = require('../AI_Service/Groq_AI.Service.js')
const ChatHistory = require('../models/AI_Model_History.js')

let channel = null

async function connectRabbitMQ () {
  try {
    const connection = await amqplib.connect('amqp://rabbitmq:5672')
    channel = await connection.createChannel()

    await channel.assertQueue('AI_Model_Queue', { durable: true })
    await channel.assertExchange('AI_Model_Exchange', 'direct', {
      durable: true
    })
    await channel.bindQueue(
      'AI_Model_Queue',
      'AI_Model_Exchange',
      'AI_Model_Routing_Key'
    )

    console.log('✅ Connected to RabbitMQ')
    return channel
  } catch (error) {
    console.error('❌ RabbitMQ connection failed:', error)
    throw error
  }
}

async function startConsumer () {
  try {
    if (!channel) {
      await connectRabbitMQ()
    }

    console.log('🔄 Waiting for messages in AI_Model_Queue...')

    channel.consume('AI_Model_Queue', async msg => {
      if (msg !== null) {
        let message
        try {
          message = JSON.parse(msg.content.toString())
          console.log('\n📨 Received AI request:', {
            user: message.userName,
            userId: message.userId,
            messageLength: message.message?.length || 0
          })

          // ===== HYBRID AI PROCESSING =====
          console.log('🔷 STEP 1: Cerebras AI Analysis...')
          let cerebrasResponse
          try {
            cerebrasResponse = await Cerebras_AI_Service(
              message.userName,
              message.message
            )
            console.log('✅ Cerebras analysis complete')
          } catch (cerebrasError) {
            console.error('❌ Cerebras failed:', cerebrasError.message)
            cerebrasResponse = `Cerebras AI failed: ${cerebrasError.message}`
          }

          console.log('🔷 STEP 2: Groq AI Enhancement...')
          let finalResponse
          try {
            finalResponse = await enhancePreviousAIResponse(
              message.userName,
              message.message,
              cerebrasResponse
            )
            console.log('✅ Groq enhancement complete')
          } catch (groqError) {
            console.error(
              '❌ Groq failed, using Cerebras response:',
              groqError.message
            )
            finalResponse = cerebrasResponse
          }

          // Add AI source tag
          finalResponse += `\n\n---\n*🤖 Powered by Hybrid AI System (Cerebras llama3.1-8b + Groq)*`

          // ===== SEND RESPONSE =====
          if (global.sendToUser) {
            const wsData = {
              type: 'ai_response',
              content: finalResponse,
              userId: message.userId,
              userName: message.userName,
              timestamp: new Date().toISOString(),
              aiSource: 'Hybrid AI (Cerebras + Groq)'
            }

            const sent = global.sendToUser(message.userId, wsData)
            console.log(
              '📤 WebSocket:',
              sent ? 'Response sent' : 'User not connected'
            )
          }

          // ===== SAVE TO DATABASE =====
          try {
            await ChatHistory.findOneAndUpdate(
              { user: message.userId },
              {
                $push: {
                  messages: [
                    {
                      sender: 'user',
                      content: message.message,
                      timestamp: new Date()
                    },
                    {
                      sender: 'AI',
                      content: finalResponse,
                      timestamp: new Date(),
                      metadata: {
                        aiSource: 'hybrid',
                        cerebrasModel: 'llama3.1-8b',
                        groqModel: 'llama-3.1-8b-instant'
                      }
                    }
                  ]
                }
              },
              { upsert: true, new: true }
            )
            console.log('💾 Saved to database')
          } catch (dbError) {
            console.error('❌ Database save failed:', dbError.message)
          }

          // ===== ACKNOWLEDGE MESSAGE =====
          channel.ack(msg)
          console.log('✅ AI processing completed successfully!')
          console.log('='.repeat(50))
        } catch (error) {
          console.error('❌ AI processing failed:', error.message)

          if (message && global.sendToUser) {
            global.sendToUser(message.userId, {
              type: 'ai_response_error',
              error: 'AI processing failed. Please try again.',
              userId: message.userId
            })
          }

          channel.nack(msg, false, false)
        }
      }
    })
  } catch (error) {
    console.error('❌ Consumer error:', error)
  }
}

module.exports = { connectRabbitMQ, startConsumer }
