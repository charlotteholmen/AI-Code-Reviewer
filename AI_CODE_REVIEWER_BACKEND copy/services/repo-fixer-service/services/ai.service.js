// services/ai.service.js
const CerebrasService = require('../ai/cerebras.service')
const GroqService = require('../ai/groq.service')

class AIService {
  constructor () {
    this.cerebras = new CerebrasService()
    this.groq = new GroqService()
  }

  // Find ONLY CRITICAL bugs
  async findBugs (code, filePath) {
    try {
      console.log('\n🔷 STEP 1: Cerebras AI Analysis (critical bugs only)...')

      const language = filePath.split('.').pop()

      // Step 1: Cerebras finds critical bugs
      const cerebrasIssues = await this.cerebras.analyze(
        code,
        language,
        filePath
      )
      console.log(`✅ Cerebras found ${cerebrasIssues.length} critical issues`)

      // If no issues, return early
      if (!cerebrasIssues || cerebrasIssues.length === 0) {
        console.log('✅ No critical bugs found')
        return []
      }

      // Step 2: Groq filters and enhances
      console.log('🔷 STEP 2: Groq AI filtering...')
      const enhancedIssues = await this.groq.enhance(
        cerebrasIssues,
        code,
        language,
        filePath
      )
      console.log(`✅ Groq confirmed ${enhancedIssues.length} critical issues`)

      return enhancedIssues
    } catch (error) {
      console.error('❌ AI Service error:', error.message)
      return []
    }
  }

  // Generate fix for critical bugs only
  async generateFix (code, issues, filePath) {
    try {
      // If no critical issues, return original code
      if (!issues || issues.length === 0) {
        return code
      }

      console.log('\n🔷 STEP 1: Cerebras generating fix...')

      const language = filePath.split('.').pop()

      const cerebrasFix = await this.cerebras.generateFix(
        code,
        issues,
        language
      )

      console.log('🔷 STEP 2: Groq verifying fix...')
      const enhancedFix = await this.groq.enhanceFix(
        cerebrasFix,
        issues,
        code,
        language
      )

      let finalFix = enhancedFix
        .replace(/```javascript/g, '')
        .replace(/```js/g, '')
        .replace(/```/g, '')
        .trim()

      return finalFix
    } catch (error) {
      console.error('❌ Fix generation error:', error.message)
      return code
    }
  }
}

module.exports = new AIService()
