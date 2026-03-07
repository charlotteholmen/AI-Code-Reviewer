const mongoose = require('mongoose');

const generationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  prompt: { type: String, required: true },
  generatedCode: { type: String, required: true },
  tokensUsed: Number,
  status: { 
    type: String, 
    enum: ['success', 'failed'],
    default: 'success'
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CodeGeneration', generationSchema);