// ai/groq.service.js
const axios = require('axios');

class GroqService {
  constructor() {
    this.apiKey = process.env.GROQ_API_KEY;
    this.baseUrl = 'https://api.groq.com/openai/v1';
  }

  async enhance(initialAnalysis, code, language, filePath) {
    try {
      // If no issues found, don't waste API calls
      if (!initialAnalysis || initialAnalysis.length === 0) {
        return [];
      }
      
      console.log('🔄 [Groq] Enhancing analysis...');
      
      const response = await axios.post(`${this.baseUrl}/chat/completions`, {
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: `Review these issues. Remove any that are NOT critical bugs.
            
            Keep ONLY issues that will cause the code to FAIL or CRASH.
            Remove style suggestions, optimizations, and best practices.
            
            Return a JSON array with ONLY critical bugs.`
          },
          {
            role: 'user',
            content: `Initial Analysis: ${JSON.stringify(initialAnalysis)}
            
            Code:
            ${code}
            
            Return filtered JSON array.`
          }
        ],
        temperature: 0.1,
        max_tokens: 2000
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const content = response.data.choices[0].message.content;
      
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return [];
      
    } catch (error) {
      console.error('❌ [Groq] Error:', error.message);
      return [];
    }
  }

  async enhanceFix(originalFix, issues, code, language) {
    try {
      if (!issues || issues.length === 0) {
        return code;
      }
      
      console.log('🔄 [Groq] Enhancing fix...');
      
      const response = await axios.post(`${this.baseUrl}/chat/completions`, {
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'Fix ONLY critical bugs. Do not change working code.'
          },
          {
            role: 'user',
            content: `Critical bugs: ${JSON.stringify(issues)}
            
            Code:
            ${code}
            
            Return fixed code with ONLY critical bugs fixed.`
          }
        ],
        temperature: 0.1,
        max_tokens: 2000
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.choices[0].message.content;
      
    } catch (error) {
      console.error('❌ [Groq] Fix enhancement error:', error.message);
      return originalFix;
    }
  }
}

module.exports = GroqService;