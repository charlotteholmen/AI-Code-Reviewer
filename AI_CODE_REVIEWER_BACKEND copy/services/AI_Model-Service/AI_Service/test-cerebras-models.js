// test-cerebras-models.js
const { Cerebras } = require('@cerebras/cerebras_cloud_sdk');
const dotenv = require('dotenv');


// Load environment variables from .env file
dotenv.config();
const cerebras = new Cerebras({
  apiKey: process.env.CEREBRAS_API_KEY
});

const testModels = [
  'llama-3.2-1b-preview',
  'llama-3.2-3b-preview',
  'llama-3.1-8b-instant',
  'llama-3.1-70b-versatile',
  'mixtral-8x7b-32768',
  'llama-3.2-90b-vision-preview',
  'zai-glm-4.6' // Your original model
];

async function testAllModels() {
  console.log('🔍 Testing Cerebras models...');
  console.log(`API Key present: ${!!process.env.CEREBRAS_API_KEY}`);
  
  for (const model of testModels) {
    try {
      console.log(`\n═══════════════════════════════════════════════`);
      console.log(`Testing model: ${model}`);
      console.log(`═══════════════════════════════════════════════`);
      
      // Simple test
      const response = await cerebras.chat.completions.create({
        messages: [{ 
          role: "user", 
          content: "Say 'Hello World' if this model is working" 
        }],
        model: model,
        max_completion_tokens: 20,
        temperature: 0.1,
        stream: false
      });
      
      console.log(`✅ ${model} WORKS!`);
      console.log(`Response: ${response.choices[0].message.content}`);
      
      // Try code review test
      try {
        const codeResponse = await cerebras.chat.completions.create({
          messages: [
            { 
              role: "system", 
              content: "You are a helpful code assistant. Keep responses brief." 
            },
            { 
              role: "user", 
              content: "Review this Python code: print('Hello World')" 
            }
          ],
          model: model,
          max_completion_tokens: 100,
          temperature: 0.3,
          stream: false
        });
        
        console.log(`📝 Code review test passed`);
        console.log(`Review: ${codeResponse.choices[0].message.content.substring(0, 100)}...`);
        
      } catch (codeError) {
        console.log(`⚠️ Code review test failed: ${codeError.message}`);
      }
      
    } catch (error) {
      console.log(`❌ ${model} FAILED`);
      console.log(`Error: ${error.message}`);
      
      if (error.status) {
        console.log(`Status: ${error.status}`);
      }
      if (error.error) {
        console.log(`Details: ${JSON.stringify(error.error)}`);
      }
    }
    
    // Wait 2 seconds between tests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n═══════════════════════════════════════════════');
  console.log('✅ All models tested!');
  console.log('═══════════════════════════════════════════════');
}

// Run the test
testAllModels().catch(error => {
  console.error('❌ Test failed with error:', error);
  process.exit(1);
});