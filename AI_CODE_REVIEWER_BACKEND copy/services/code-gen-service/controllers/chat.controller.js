const { Cerebras_AI_Service } = require('../services/cerebrasAI.service');
const Conversation = require('../models/conversation.model');
const mongoose = require('mongoose');

// Create new conversation
exports.createConversation = async (req, res) => {
  try {
    const { title = 'New Conversation' } = req.body;
    const userId = req.user.userId;

    // Check if title is a string
    if (typeof title !== 'string') {
      return res.status(400).json({ error: 'Title must be a string' });
    }

    // Check if userId is a string
    if (typeof userId !== 'string') {
      return res.status(400).json({ error: 'User ID must be a string' });
    }

    // Check DB connection
    if (!mongoose.connection || mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        error: 'Database not connected',
        success: false 
      });
    }

    const conversation = new Conversation({
      userId,
      title,
      messages: [],
      lastActivity: Date.now()
    });

    await conversation.save();

    res.json({
      success: true,
      conversation: {
        id: conversation._id,
        title: conversation.title,
        createdAt: conversation.createdAt,
        messageCount: 0
      }
    });
  } catch (error) {
    console.error('❌ Error creating conversation:', error);
    res.status(500).json({ error: error.message });
  }
};

// Send message in conversation - CONNECTED TO AI
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, message } = req.body;
    const userId = req.user.userId;
    const userName = req.user.username || 'Developer';

    // Check if message is a string
    if (typeof message !== 'string') {
      return res.status(400).json({ error: 'Message must be a string' });
    }

    // Check DB connection
    if (!mongoose.connection || mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        error: 'Database not connected',
        success: false 
      });
    }

    // Find conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId: userId
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Add user message to conversation
    conversation.messages.push({
      role: 'user',
      content: message,
      timestamp: Date.now()
    });

    // Build conversation history for context
    const messageHistory = conversation.messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    console.log(`🤖 Sending to AI with ${messageHistory.length} messages of context...`);

    // 🔥 CALL THE AI WITH FULL CONTEXT
    const aiResponse = await Cerebras_AI_Service(
      userName,
      message,
      messageHistory.slice(0, -1) // Send all previous messages except current
    );

    // Add AI response to conversation
    conversation.messages.push({
      role: 'assistant',
      content: aiResponse,
      timestamp: Date.now()
    });

    // Update conversation title if first message
    if (conversation.messages.length === 2) {
      conversation.title = message.length > 50 
        ? message.substring(0, 47) + '...' 
        : message;
    }

    conversation.lastActivity = Date.now();
    await conversation.save();

    res.json({
      success: true,
      message: {
        role: 'assistant',
        content: aiResponse,
        timestamp: Date.now()
      },
      conversation: {
        id: conversation._id,
        title: conversation.title,
        messageCount: conversation.messages.length
      }
    });

  } catch (error) {
    console.error('❌ Error sending message:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get conversation history
exports.getConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Check DB connection
    if (!mongoose.connection || mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        error: 'Database not connected',
        success: false 
      });
    }

    const conversation = await Conversation.findOne({
      _id: id,
      userId: userId
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json({
      success: true,
      conversation: {
        id: conversation._id,
        title: conversation.title,
        messages: conversation.messages,
        createdAt: conversation.createdAt,
        lastActivity: conversation.lastActivity
      }
    });
  } catch (error) {
    console.error('❌ Error fetching conversation:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get all conversations for user
exports.getUserConversations = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { limit = 20, offset = 0 } = req.query;

    // Check if limit and offset are numbers
    if (typeof limit !== 'number' || typeof offset !== 'number') {
      return res.status(400).json({ error: 'Limit and offset must be numbers' });
    }

    // Check DB connection
    if (!mongoose.connection || mongoose.connection.readyState !== 1) {
      return res.json({ 
        success: true, 
        conversations: [],
        note: 'Database not connected'
      });
    }

    const conversations = await Conversation.find({ 
      userId: userId,
      status: 'active'
    })
      .sort({ lastActivity: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit))
      .select('_id title lastActivity createdAt messageCount tokenCount');

    const total = await Conversation.countDocuments({ 
      userId: userId,
      status: 'active' 
    });

    res.json({
      success: true,
      conversations: conversations.map(c => ({
        id: c._id,
        title: c.title,
        lastActivity: c.lastActivity,
        createdAt: c.createdAt,
        messageCount: c.messages?.length || 0
      })),
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: offset + conversations.length < total
      }
    });
  } catch (error) {
    console.error('❌ Error fetching conversations:', error);
    res.json({ 
      success: true, 
      conversations: [] 
    });
  }
};

// Delete conversation
exports.deleteConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Check DB connection
    if (!mongoose.connection || mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        error: 'Database not connected',
        success: false 
      });
    }

    const result = await Conversation.deleteOne({
      _id: id,
      userId: userId
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json({
      success: true,
      message: 'Conversation deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting conversation:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update conversation title
exports.updateTitle = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const userId = req.user.userId;

    // Check if title is a string
    if (typeof title !== 'string') {
      return res.status(400).json({ error: 'Title must be a string' });
    }

    // Check DB connection
    if (!mongoose.connection || mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        error: 'Database not connected',
        success: false 
      });
    }

    const conversation = await Conversation.findOneAndUpdate(
      { _id: id, userId: userId },
      { title: title },
      { new: true }
    );

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json({
      success: true,
      title: conversation.title
    });
  } catch (error) {
    console.error('❌ Error updating title:', error);
    res.status(500).json({ error: error.message });
  }
};