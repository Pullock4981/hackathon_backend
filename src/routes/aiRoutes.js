const express = require('express');
const { scoreResume, predictRisk } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/resume-score', protect, scoreResume);
router.post('/predict-risk', protect, predictRisk);

module.exports = router;
