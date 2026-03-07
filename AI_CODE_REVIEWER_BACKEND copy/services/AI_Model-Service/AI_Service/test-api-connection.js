// test-api-connection.js
const { Cerebras } = require('@cerebras/cerebras_cloud_sdk');
require('dotenv').config();

async function testConnection() {
  console.log('🔌 Testing Cerebras API Connection...');
  
  // Check if API key exists
  if (!process.env.CEREBRAS_API_KEY) {
    console.log('❌ CEREBRAS_API_KEY not found in .env file');
    console.log('Please add: CEREBRAS_API_KEY=your_key_here');
    return;
  }
  
  console.log(`API Key: ${process.env.CEREBRAS_API_KEY.substring(0, 10)}...`);
  
  try {
    const cerebras = new Cerebras({
      apiKey: process.env.CEREBRAS_API_KEY
    });
    
    console.log('✅ Cerebras client initialized');
    
    // List available models
    console.log('\n📋 Fetching available models...');
    try {
      const models = await cerebras.models.list();
      console.log(`✅ Found ${models.data.length} models`);
      
      // Show first 5 models
      console.log('\nAvailable models:');
      models.data.slice(0, 10).forEach((model, i) => {
        console.log(`${i + 1}. ${model.id}`);
      });
      
      if (models.data.length > 10) {
        console.log(`... and ${models.data.length - 10} more`);
      }
      
    } catch (modelError) {
      console.log('⚠️ Cannot list models, trying direct test...');
    }
    
    // Test with a known working model
    console.log('\n🧪 Testing with known models...');
    
    const knownModels = [
      'llama-3.1-8b-instant',
      'llama-3.2-1b-preview',
      'mixtral-8x7b-32768'
    ];
    
    for (const model of knownModels) {
      try {
        const response = await cerebras.chat.completions.create({
          messages: [{ role: "user", content: "Say OK" }],
          model: model,
          max_completion_tokens: 5,
          temperature: 0.1,
          stream: false
        });
        
        console.log(`✅ ${model}: Works! (${response.choices[0].message.content})`);
        break; // Stop at first working model
        
      } catch (error) {
        console.log(`❌ ${model}: ${error.message}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('1. Check your Cerebras API key');
    console.log('2. Check internet connection');
    console.log('3. Visit: https://platform.cerebras.ai/');
    console.log('4. Make sure your account has credits');
  }
}

testConnection();