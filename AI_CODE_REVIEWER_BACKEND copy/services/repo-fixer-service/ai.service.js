// services/ai.service.js
const CerebrasService = require('./ai/cerebras.service.js')
const GroqService = require('./ai/groq.service.js')

class AIService {
  constructor() {
    this.cerebras = new CerebrasService();
    this.groq = new GroqService();
  }

  // Find bugs in code using hybrid AI
  async findBugs(code, filePath) {
    try {
      console.log('\n🔷 STEP 1: Cerebras AI Analysis...');
      
      const language = filePath.split('.').pop();
      
      // Step 1: Cerebras initial analysis
      const cerebrasIssues = await this.cerebras.analyze(code, language, filePath);
      console.log(`✅ Cerebras found ${cerebrasIssues.length} issues`);
      
      // Step 2: Groq enhancement (only if issues found)
      if (cerebrasIssues && cerebrasIssues.length > 0) {
        console.log('🔷 STEP 2: Groq AI Enhancement...');
        const enhancedIssues = await this.groq.enhance(cerebrasIssues, code, language, filePath);
        console.log(`✅ Groq enhanced to ${enhancedIssues.length} issues`);
        
        // Sort by line number
        enhancedIssues.sort((a, b) => (a.line || 0) - (b.line || 0));
        return enhancedIssues;
      }
      
      return cerebrasIssues || [];
      
    } catch (error) {
      console.error('❌ AI Service error:', error.message);
      return [];
    }
  }

  // Generate fix using hybrid AI
  async generateFix(code, issues, filePath) {
    try {
      console.log('\n🔷 STEP 1: Cerebras generating fix...');
      
      const language = filePath.split('.').pop();
      
      // Step 1: Cerebras generates initial fix
      const cerebrasFix = await this.cerebras.generateFix(code, issues, language);
      
      // Step 2: Groq enhances the fix
      console.log('🔷 STEP 2: Groq enhancing fix...');
      const enhancedFix = await this.groq.enhanceFix(cerebrasFix, issues, code, language);
      
      // Clean up
      let finalFix = enhancedFix.replace(/```javascript/g, '')
                               .replace(/```js/g, '')
                               .replace(/```/g, '')
                               .trim();
      
      return finalFix;
      
    } catch (error) {
      console.error('❌ Fix generation error:', error.message);
      return code;
    }
  }
}

module.exports = new AIService();


