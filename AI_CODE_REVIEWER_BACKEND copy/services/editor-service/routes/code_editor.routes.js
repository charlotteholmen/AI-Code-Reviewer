const express = require('express')
const { sendToQueue } = require('../rabbitmq/producer.js')
const { verifyToken } = require('../middleware/verification_user.js')
const router = express.Router()

const CodeSnippet = require('../models/code_editor.js')

router.post('/run', verifyToken, async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: 'Authentication failed' })
    }

    const { code, language } = req.body

    if (!code || !language) {
      return res.status(400).json({ error: 'Code and language required' })
    }

    const userId = req.user.userId
    const userName = req.user.username || req.user.name || 'Unknown'

    await sendToQueue(code, language, userId, userName)

    res.status(200).json({
      message: 'Code submitted successfully',
      status: 'queued'
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to queue code' })
  }
})

router.get('/result', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId

    const latestSnippet = await CodeSnippet.findOne({ user: userId })
      .sort({ createdAt: -1 })

    if (!latestSnippet) {
      return res.status(404).json({ message: "No execution found" })
    }

    res.status(200).json({
      output: latestSnippet.last_execution_result.output,
      error: latestSnippet.last_execution_result.error,
      status: latestSnippet.last_execution_result.status,
      time: latestSnippet.last_execution_result.execution_time
    })

  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to fetch result" })
  }
})

module.exports = router
