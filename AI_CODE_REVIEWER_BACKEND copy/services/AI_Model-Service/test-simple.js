// Create file: test-simple.js
const fs = require('fs');
const path = require('path');

console.log("📁 Current directory:", __dirname);
console.log("📄 Checking .env file...");

// Check if .env exists in current directory
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log("✅ .env file FOUND at:", envPath);
  console.log("File contents first line:");
  const content = fs.readFileSync(envPath, 'utf8').split('\n')[0];
  console.log(content);
} else {
  console.log("❌ .env file NOT found at:", envPath);
}

// Try to load dotenv
require('dotenv').config();
console.log("\n🔑 Environment variables:");
console.log("CEREBRAS_API_KEY:", process.env.CEREBRAS_API_KEY ? "LOADED" : "MISSING");
console.log("GROQ_API_KEY:", process.env.GROQ_API_KEY ? "LOADED" : "MISSING");