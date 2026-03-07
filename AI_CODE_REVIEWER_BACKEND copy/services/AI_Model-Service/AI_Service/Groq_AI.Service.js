// const Groq = require("groq-sdk");

// const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

// async function enhancePreviousAIResponse(userName, userMessage, previousResponse) {
//   try {
//     const chatCompletion = await client.chat.completions.create({
//       messages: [
//         {
//           role: "system",
//           content: `You are a helpful assistant. Improve and enhance the previous AI response. 
//            Make it clearer, more detailed, well-structured, and natural. 
//            Focus on coding, programming, AI, Machine Learning, and Development topics.
//            If the user asks nonsense questions, respond with "I don't understand".
//            Do NOT rhyme. Do NOT invent facts.
           
//            USER NAME: ${userName}`
//         },
//         {
//           role: "user",
//           content: `User's question: ${userMessage}
// Previous AI response: ${previousResponse}

// Please enhance, rewrite, and clarify the previous response.`
//         }
//       ],
//       model: "llama-3.1-8b-instant",
//       temperature: 0.5,
//       max_tokens: 1024,
//     });

//     return chatCompletion.choices[0].message.content;
//   } catch (error) {
//     console.error('❌ Groq AI enhancement failed:', error.message);
//     throw error;
//   }
// }

// module.exports = { enhancePreviousAIResponse };





// new groq




const Groq = require("groq-sdk");

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function enhancePreviousAIResponse(userName, userMessage, previousResponse) {
  try {
    console.log(`🔄 Groq AI enhancing response for: ${userName}`);
    
    const chatCompletion = await client.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an AI response enhancer. Your task is to IMPROVE and ENRICH the previous AI response.
          
          **INSTRUCTIONS:**
          1. Make the response more detailed and comprehensive
          2. Add code examples if applicable
          3. Improve structure with clear sections
          4. Add practical recommendations
          5. Maintain technical accuracy
          6. Keep it professional but approachable
          
          **USER:** ${userName}
          **CONTEXT:** Code review/analysis`
        },
        {
          role: "user",
          content: `**Original User Query:**
${userMessage}

**Initial AI Response:**
${previousResponse}

**Your Task:**
Enhance this response. Make it:
1. More detailed with specific examples
2. Better organized with clear sections
3. More actionable with step-by-step recommendations
4. Add missing insights about performance, security, and best practices`
        }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.3, // Lower for more consistent enhancement
      max_tokens: 2048,
      top_p: 0.9
    });

    const enhanced = chatCompletion.choices[0].message.content;
    console.log(`✅ Groq enhancement complete: ${enhanced.substring(0, 100)}...`);
    return enhanced;
    
  } catch (error) {
    console.error('❌ Groq AI enhancement failed:', error.message);
    
    // If Groq fails, return the original response with a note
    return `${previousResponse}

---
*Note: Groq AI enhancement service is temporarily unavailable.*`;
  }
}

// NEW FUNCTION: Direct Groq Analysis (if Cerebras completely fails)
async function directGroqAnalysis(userName, message) {
  try {
    console.log(`🤖 Direct Groq analysis for: ${userName}`);
    
    const chatCompletion = await client.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an expert code reviewer. Provide comprehensive analysis of the given code.
          
          **ANALYSIS FORMAT:**
          1. **Code Quality** (Readability, structure, maintainability)
          2. **Potential Issues** (Bugs, logical errors, edge cases)
          3. **Performance** (Time/space complexity, optimizations)
          4. **Security** (Vulnerabilities, best practices)
          5. **Best Practices** (Language-specific conventions)
          6. **Improvement Suggestions** (Specific code changes)
          
          Be thorough and provide code examples when helpful.
          User: ${userName}`
        },
        {
          role: "user",
          content: message
        }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.4,
      max_tokens: 3072,
      top_p: 0.95
    });

    const analysis = chatCompletion.choices[0].message.content;
    console.log(`✅ Direct Groq analysis complete`);
    return analysis;
    
  } catch (error) {
    console.error('❌ Direct Groq analysis failed:', error.message);
    throw error;
  }
}

module.exports = { enhancePreviousAIResponse, directGroqAnalysis };