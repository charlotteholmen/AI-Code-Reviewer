const amqp = require('amqplib')

let channel = null

const RABBIT_URL = process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672'

async function connectRabbitMQ() {
  try {
    const connection = await amqp.connect(RABBIT_URL)
    channel = await connection.createChannel()

    await channel.assertExchange('code_execution_exchange', 'direct', {
      durable: true
    })

    console.log('✅ Connected to RabbitMQ with Exchange')
    return channel
  } catch (error) {
    console.error('❌ RabbitMQ connection failed:', error)
    throw error
  }
}

async function sendToQueue(code, language, userId, userName) {
  try {
    if (!channel) {
      await connectRabbitMQ()
    }

    console.log(`📤 Preparing to send code to queue:`)
    console.log(`   Language: ${language}`)
    console.log(`   User: ${userName} (${userId})`)
    console.log(`   Code length: ${code?.length || 0} characters`)

    const message = {
      code: code,
      language: language,
      userId: userId,
      userName: userName,
      timestamp: new Date()
    }

    const routingKey = `${language}.code`

    channel.publish(
      'code_execution_exchange',
      routingKey,
      Buffer.from(JSON.stringify(message)),
      { persistent: true }
    )

    console.log(`📨 Code sent to ${routingKey} for user: ${userId}`)
  } catch (error) {
    console.error('❌ Failed to send to queue:', error)
    throw error
  }
}

module.exports = { sendToQueue }
