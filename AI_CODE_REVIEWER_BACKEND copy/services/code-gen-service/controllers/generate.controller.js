// controllers/generate.controller.js
const { Cerebras_AI_Service } = require('../services/cerebrasAI.service');
const CodeGeneration = require('../models/generation.model');

exports.generateCode = async (req, res) => {
  try {
    const { prompt } = req.body;
    const userId = req.user.userId;
    const userName = req.user.username || 'Developer';

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log(`📝 Generating code for prompt: ${prompt.substring(0, 100)}...`);

    // Call Cerebras - THIS IS WORKING!
    const generatedCode = await Cerebras_AI_Service(userName, prompt);

    // Try to save to database, but DON'T FAIL if DB is down
    let generationId = null;
    let dbError = null;  // ✅ DECLARE dbError HERE

    try {
      const generation = new CodeGeneration({
        userId,
        prompt,
        generatedCode,
        status: 'success'
      });
      await generation.save();
      generationId = generation._id;
      console.log('✅ Saved to database');
    } catch (error) {
      dbError = error;  // ✅ STORE THE ERROR
      console.log('⚠️ Could not save to database:', error.message);
      // Continue anyway - AI response is still valid!
    }

    // ALWAYS return the generated code, even if DB fails
    res.json({
      success: true,
      generationId: generationId,
      code: generatedCode,
      note: dbError ? 'Code generated but not saved to history' : undefined
    });

  } catch (error) {
    console.error('❌ Generation error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

exports.getGeneration = async (req, res) => {
  try {
    const { id } = req.params;
    const generation = await CodeGeneration.findById(id);
    
    if (!generation) {
      return res.status(404).json({ error: 'Generation not found' });
    }
    
    res.json({
      success: true,
      generation
    });
  } catch (error) {
    console.error('❌ Error fetching generation:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getUserGenerations = async (req, res) => {
  try {
    const generations = await CodeGeneration.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(20);
    
    res.json({
      success: true,
      generations
    });
  } catch (error) {
    console.error('❌ Error fetching generations:', error);
    // Return empty array if DB fails
    res.json({
      success: true,
      generations: []
    });
  }
};