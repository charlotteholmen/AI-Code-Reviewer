// routes/repo.routes.js
const express = require('express');
const router = express.Router();
const repoController = require('../controller/repo.controller.js');
const { verifyToken } = require('../middleware/auth.js');

// All routes require authentication
router.use(verifyToken);

// 📥 Import and analyze repo
router.post('/analyze', repoController.analyzeRepo);

// ✨ Fix repo and create PR
router.post('/fix', repoController.fixRepo);

// 📊 Get analysis status
router.get('/analysis/:id', repoController.getAnalysis);

// 📋 Get user's analyses
router.get('/my-analyses', repoController.getUserAnalyses);

module.exports = router;