// ai/cerebras.service.js
const axios = require('axios');

class CerebrasService {
  constructor() {
    this.apiKey = process.env.CEREBRAS_API_KEY;
    this.baseUrl = 'https://api.cerebras.ai/v1';
  }

  async analyze(code, language, filePath) {
    try {
      console.log('🤖 [Cerebras] Analyzing code...');
      
      const response = await axios.post(`${this.baseUrl}/chat/completions`, {
        model: 'llama3.1-8b',
        messages: [
          {
            role: 'system',
            content: `You are an expert code reviewer. Find ONLY CRITICAL BUGS that will break the code.

            RULES:
            - ONLY report issues that will cause the code to FAIL or CRASH
            - DO NOT report style issues, optimizations, or best practices
            - DO NOT report missing comments or formatting
            - DO NOT suggest improvements unless they are CRITICAL bugs
            - If the code works correctly, return []
            
            Each issue must have:
            - type: ONLY "bug" or "syntax"
            - description: what's wrong (only if it will break)
            - line: approximate line number
            - severity: ONLY "high"
            - fix: the fix (only if absolutely necessary)
            
            Return ONLY the JSON array, no other text.`
          },
          {
            role: 'user',
            content: `File: ${filePath}\nLanguage: ${language}\n\nCode:\n${code}`
          }
        ],
        temperature: 0.1, // Lower temperature for more strict analysis
        max_tokens: 2000
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const content = response.data.choices[0].message.content;
      console.log('✅ [Cerebras] Analysis complete');
      
      // Extract JSON from response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const issues = JSON.parse(jsonMatch[0]);
        // Filter to only keep HIGH severity issues
        return issues.filter(i => i.severity === 'high');
      }
      
      return [];
      
    } catch (error) {
      console.error('❌ [Cerebras] Error:', error.message);
      return [];
    }
  }

  async generateFix(code, issues, language) {
    try {
      // If no critical issues, return original code
      if (!issues || issues.length === 0) {
        return code;
      }
      
      const issueDesc = issues.map(i => `- Critical bug: ${i.description}`).join('\n');
      
      const response = await axios.post(`${this.baseUrl}/chat/completions`, {
        model: 'llama3.1-8b',
        messages: [
          {
            role: 'system',
            content: 'Fix ONLY critical bugs that will break the code. Do not optimize or improve style.'
          },
          {
            role: 'user',
            content: `Critical bugs to fix:\n${issueDesc}\n\nCode:\n${code}`
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
      console.error('❌ [Cerebras] Fix error:', error.message);
      return code;
    }
  }
}

module.exports = CerebrasService;