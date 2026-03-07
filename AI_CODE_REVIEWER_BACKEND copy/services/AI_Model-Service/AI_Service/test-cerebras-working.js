// test-cerebras-working.js - FIXED VERSION
const path = require('path');

// ✅ Load .env from PARENT directory (where it actually is)
const envPath = path.join(__dirname, '..', '.env');
console.log('📁 Current directory:', __dirname);
console.log('📄 Looking for .env at:', envPath);

// Check if file exists
const fs = require('fs');
if (fs.existsSync(envPath)) {
  console.log('✅ .env file found!');
  require('dotenv').config({ path: envPath });
} else {
  console.log('❌ .env file NOT found at:', envPath);
  console.log('Checking current directory for .env...');
  require('dotenv').config(); // Try current directory as fallback
}

console.log('\n🔑 Environment Variables Status:');
console.log('CEREBRAS_API_KEY:', process.env.CEREBRAS_API_KEY ? '✅ Loaded' : '❌ Missing');
console.log('GROQ_API_KEY:', process.env.GROQ_API_KEY ? '✅ Loaded' : '❌ Missing');

if (process.env.CEREBRAS_API_KEY) {
  console.log('Cerebras key preview:', process.env.CEREBRAS_API_KEY.substring(0, 15) + '...');
}

// Only proceed if API key is loaded
if (!process.env.CEREBRAS_API_KEY) {
  console.log('\n❌ Cannot proceed without CEREBRAS_API_KEY');
  console.log('💡 Make sure .env file exists at:', envPath);
  console.log('💡 Or run this test from the parent directory (AI_Model-Service)');
  process.exit(1);
}

// Test Cerebras
const { Cerebras } = require('@cerebras/cerebras_cloud_sdk');

async function testCerebras() {
  try {
    console.log('\n🧪 Initializing Cerebras client...');
    const cerebras = new Cerebras({
      apiKey: process.env.CEREBRAS_API_KEY
    });
    
    console.log('✅ Cerebras client initialized');
    
    // List available models first
    console.log('\n📋 Listing available models...');
    try {
      const models = await cerebras.models.list();
      console.log(`Found ${models.data.length} models:`);
      models.data.slice(0, 5).forEach((model, i) => {
        console.log(`  ${i + 1}. ${model.id}`);
      });
    } catch (modelError) {
      console.log('Could not list models:', modelError.message);
    }
    
    // Test with your available models
    const testModels = [
      'qwen-3-coder-480b',  // Best for coding
      'llama3.1-8b',        // Fast model
      'zai-glm-4.7',        // Your original (corrected)
      'llama-3.3-70b'       // General purpose
    ];
    
    console.log('\n🔍 Testing available models...');
    
    for (const model of testModels) {
      try {
        console.log(`\nTrying model: ${model}`);
        const response = await cerebras.chat.completions.create({
          messages: [
            { 
              role: "system", 
              content: "You are a code reviewer. Respond briefly." 
            },
            { 
              role: "user", 
              content: "Review: print('Hello')" 
            }
          ],
          model: model,
          max_completion_tokens: 100,
          temperature: 0.3,
          stream: false
        });
        
        console.log(`✅ ${model} WORKS!`);
        console.log(`Response: ${response.choices[0].message.content.substring(0, 100)}...`);
        break; // Stop at first working model
        
      } catch (error) {
        console.log(`❌ ${model} failed: ${error.message}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
  } catch (error) {
    console.log('❌ Cerebras test failed:', error.message);
  }
}

testCerebras().catch(console.error);