const express = require('express');
const { scoreResume, predictRisk, sendRiskEmails, generateQuiz } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/resume-score', protect, scoreResume);
router.post('/predict-risk', protect, predictRisk);
router.post('/send-risk-emails', protect, sendRiskEmails);
router.post('/generate-quiz', protect, generateQuiz);

module.exports = router;
