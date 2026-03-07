// models/User.js - UPDATED SCHEMA
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: String,        // GitHub name
  login: String,           // GitHub username
  email: { type: String, required: true, unique: true },
  password: { type: String, default: 'oauth' },
  
  // ⚠️ IMPORTANT: Separate fields for GitHub ID and actual access token
  github_id: { type: String, unique: true, sparse: true },  // GitHub user ID (numeric)
  oauth_token: String,      // 🔑 REAL GitHub access token (starts with gho_)
  github_token: String,     // 🔑 Backup field for token
  github_access_token: String, // 🔑 Another backup field
  
  // GitHub user data
  avatar_url: String,
  bio: String,
  blog: String,
  company: String,
  location: String,
  followers: Number,
  following: Number,
  created_at: Date,
  repos: [String],
  
  // App specific fields
  role: { type: String, enum: ['host', 'participant'], default: 'participant' },
  joinedContest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contest',
    default: null
  }
}, { timestamps: true }) // Add timestamps

module.exports = mongoose.model('User', userSchema)