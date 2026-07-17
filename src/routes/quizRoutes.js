const express = require('express');
const {
  createQuiz,
  getQuizzes,
  submitQuiz
} = require('../controllers/quizController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router({ mergeParams: true });

router.route('/')
  .get(protect, getQuizzes)
  .post(protect, createQuiz);

router.route('/:id/submit')
  .post(protect, submitQuiz);

module.exports = router;
