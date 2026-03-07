const amqp = require('amqplib')
const axios = require('axios')
const CodeSnippet = require('../models/code_editor.js')
const dotenv = require('dotenv')

dotenv.config()

let channel = null

const RABBIT_URL = process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672'

async function connectRabbitMQ() {
  try {
    const connection = await amqp.connect(RABBIT_URL)
    channel = await connection.createChannel()

    await channel.assertExchange('code_execution_exchange', 'direct', {
      durable: true
    })

    const languages = ['python', 'javascript', 'java', 'cpp', 'c']

    for (const language of languages) {
      const queueName = `${language}_execution_queue`
      const routingKey = `${language}.code`

      await channel.assertQueue(queueName, { durable: true })
      await channel.bindQueue(queueName, 'code_execution_exchange', routingKey)

      console.log(`✅ Queue ${queueName} bound to ${routingKey}`)
    }

    console.log('✅ Consumer connected to RabbitMQ')
    return channel
  } catch (error) {
    console.error('❌ Consumer connection failed:', error.message)
    throw error
  }
}

function getLanguageId(language) {
  const languages = {
    python: 71,
    javascript: 63,
    java: 62,
    cpp: 54,
    c: 50
  }
  return languages[language] || 63
}

async function executeWithJudge0(code, language) {
  try {
    if (!code || code.trim() === '') {
      throw new Error('Code is empty')
    }

    const languageId = getLanguageId(language)

    const requestBody = {
      source_code: Buffer.from(String(code)).toString('base64'),
      language_id: languageId,
      stdin: Buffer.from('').toString('base64')
    }

    const response = await axios.post(
      'https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true&wait=true',
      requestBody,
      {
        headers: {
          'X-RapidAPI-Key': process.env.JUDGE0_API_KEY,
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
          'Content-Type': 'application/json'
        }
      }
    )

    const result = response.data

    if (result.stdout)
      result.stdout = Buffer.from(result.stdout, 'base64').toString('utf8')

    if (result.stderr)
      result.stderr = Buffer.from(result.stderr, 'base64').toString('utf8')

    if (result.compile_output)
      result.compile_output = Buffer.from(result.compile_output, 'base64').toString('utf8')

    return result
  } catch (error) {
    console.error('❌ Judge0 execution failed:', error.message)
    throw error
  }
}

async function startConsumer() {
  try {
    if (!channel) await connectRabbitMQ()

    const languages = ['python', 'javascript', 'java', 'cpp', 'c']

    for (const language of languages) {
      const queueName = `${language}_execution_queue`

      channel.consume(queueName, async msg => {
        let message

        try {
          message = JSON.parse(msg.content.toString())

          const result = await executeWithJudge0(
            message.code,
            message.language
          )

          const output =
            result.stdout ||
            result.stderr ||
            result.compile_output ||
            'No output'

          const status = result.status?.description || 'Unknown'

          if (global.sendToUser) {
            global.sendToUser(message.userId, {
              type: 'code_execution_result',
              output,
              status
            })
          }

          const newSnippet = new CodeSnippet({
            user: message.userId,
            code: message.code,
            language: message.language,
            last_execution_result: {
              output,
              error: result.stderr,
              execution_time: result.time,
              status: status.toLowerCase()
            }
          })

          await newSnippet.save()

          channel.ack(msg)
        } catch (error) {
          console.error('❌ Error processing message:', error.message)

          if (message && global.sendToUser) {
            global.sendToUser(message.userId, {
              type: 'code_execution_error',
              error: error.message
            })
          }

          channel.nack(msg, false, false)
        }
      })
    }
  } catch (error) {
    console.error('❌ Consumer error:', error.message)
  }
}

module.exports = { startConsumer }
