// test-hybrid-pipeline.js
require('dotenv').config();

console.log('🚀 TESTING HYBRID AI PIPELINE');
console.log('===============================');

const { Cerebras } = require('@cerebras/cerebras_cloud_sdk');
const { Groq } = require('groq-sdk');

const cerebras = new Cerebras({ apiKey: process.env.CEREBRAS_API_KEY });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function testHybridPipeline() {
  try {
    const testCode = "Review this Python code:\n\nprint('Hello World')\n\nPlease analyze for code quality, bugs, performance, and best practices.";
    
    console.log('1. Testing Cerebras (llama3.1-8b)...');
    const cerebrasResponse = await cerebras.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a code reviewer. Analyze this code."
        },
        {
          role: "user",
          content: testCode
        }
      ],
      model: 'llama3.1-8b',
      max_completion_tokens: 500,
      temperature: 0.4,
      stream: false
    });
    
    const cerebrasText = cerebrasResponse.choices[0].message.content;
    console.log('✅ Cerebras response length:', cerebrasText.length, 'chars');
    console.log('Preview:', cerebrasText.substring(0, 150) + '...');
    
    console.log('\n2. Testing Groq enhancement...');
    const groqResponse = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Enhance and improve this code review response. Make it more detailed and structured."
        },
        {
          role: "user",
          content: `Original response to enhance:\n${cerebrasText}`
        }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.3,
      max_tokens: 800,
    });
    
    const groqText = groqResponse.choices[0].message.content;
    console.log('✅ Groq enhancement length:', groqText.length, 'chars');
    console.log('Preview:', groqText.substring(0, 150) + '...');
    
    console.log('\n🎉 HYBRID PIPELINE IS WORKING!');
    console.log('Cerebras + Groq = ✅ Success!');
    
    return {
      cerebras: cerebrasText,
      groq: groqText,
      combined: groqText
    };
    
  } catch (error) {
    console.error('\n❌ Pipeline failed:', error.message);
    throw error;
  }
}

testHybridPipeline().then(result => {
  console.log('\n✅ Test completed successfully!');
}).catch(error => {
  console.error('\n❌ Test failed completely');
});