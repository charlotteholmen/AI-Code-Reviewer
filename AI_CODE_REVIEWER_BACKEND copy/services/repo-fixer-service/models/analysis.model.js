// models/analysis.model.js
const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  repoUrl: { type: String, required: true },
  owner: String,
  repo: String,
  branch: String,
  filesAnalyzed: Number,
  bugsFound: Number,
  files: [{
    path: String,
    content: String,
    sha: String,
    issues: [{
      description: String,
      line: Number,
      severity: { type: String, enum: ['low', 'medium', 'high'] },
      fix: String
    }]
  }],
  prUrl: String,
  status: { 
    type: String, 
    enum: ['analyzing', 'analyzed', 'fixing', 'fixed', 'failed'],
    default: 'analyzing'
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Analysis', analysisSchema);