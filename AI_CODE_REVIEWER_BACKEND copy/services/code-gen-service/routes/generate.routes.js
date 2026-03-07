const express = require('express');
const router = express.Router();
const generateController = require('../controllers/generate.controller');
const { verifyToken } = require('../middleware/auth');

// All routes require authentication
router.use(verifyToken);

router.post('/code', generateController.generateCode);
router.get('/history/:id', generateController.getGeneration);
router.get('/my-generations', generateController.getUserGenerations);

module.exports = router;