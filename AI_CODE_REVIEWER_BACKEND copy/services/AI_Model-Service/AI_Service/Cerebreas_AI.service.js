// Cerebreas_AI.service.js - WORKING VERSION
const { Cerebras } = require('@cerebras/cerebras_cloud_sdk');

const cerebras = new Cerebras({
  apiKey: process.env.CEREBRAS_API_KEY
});

async function Cerebras_AI_Service(userName, message) {
  try {
    console.log(`🤖 Cerebras AI called for user: ${userName}`);
    
    // ✅ USE THE WORKING MODEL
    const model = 'llama3.1-8b';
    console.log(`Using model: ${model}`);
    
    const response = await cerebras.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an expert code reviewer. Analyze the provided code and give detailed feedback.
          
          **ANALYSIS FORMAT:**
          1. Code Quality Assessment
          2. Potential Bugs & Issues
          3. Performance Considerations
          4. Security Concerns
          5. Best Practices Recommendations
          6. Improvement Suggestions
          
          Be thorough and provide specific examples.
          User: ${userName}`
        },
        {
          role: "user",
          content: message
        }
      ],
      model: model,
      max_completion_tokens: 3072,
      temperature: 0.4,
      top_p: 0.9,
      stream: false
    });
    
    console.log(`✅ Cerebras AI (${model}) response generated`);
    return response.choices[0].message.content;
    
  } catch (error) {
    console.error('❌ Cerebras AI Processing failed:', error.message);
    
    // Fallback response
    return `## Cerebras AI Analysis
    
**Status:** Cerebras AI encountered an error: ${error.message}

**Basic Code Review Tips:**
1. Check syntax and indentation
2. Add comments for clarity
3. Consider edge cases
4. Follow language best practices

*Please try again or contact support.*`;
  }
}

module.exports = { Cerebras_AI_Service };