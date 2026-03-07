// test-cerebras-correct.js
require('dotenv').config();

console.log('🧪 CEREBRAS API WITH CORRECT MODELS');
console.log('====================================');

const { Cerebras } = require('@cerebras/cerebras_cloud_sdk');
const cerebras = new Cerebras({ apiKey: process.env.CEREBRAS_API_KEY });

async function testModels() {
  const models = [
    'llama3.1-8b',        // ✅ This should work (no dot)
    'llama-3.3-70b',      // ✅ With dot
    'zai-glm-4.7',        // ✅ Your original (corrected)
    'qwen-3-32b',         // ✅ Simpler Qwen model
    'gpt-oss-120b'        // ✅ GPT model
  ];
  
  for (const model of models) {
    try {
      console.log(`\n🔍 Testing model: ${model}`);
      
      const response = await cerebras.chat.completions.create({
        messages: [
          { role: 'user', content: 'Say OK if working' }
        ],
        model: model,
        max_completion_tokens: 10,
        temperature: 0.1,
        stream: false
      });
      
      console.log(`✅ ${model} WORKS!`);
      console.log(`Response: ${response.choices[0].message.content}`);
      return; // Stop at first working model
      
    } catch (error) {
      console.log(`❌ ${model} failed: ${error.message}`);
    }
    
    // Wait 1 second between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n❌ All models failed!');
}

testModels().catch(console.error);