const express = require('express');
const {
  createQuiz,
  getQuizzes,
  updateQuiz,
  submitQuiz,
  getQuizSubmissions
} = require('../controllers/quizController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router({ mergeParams: true });

router.route('/')
  .get(protect, getQuizzes)
  .post(protect, createQuiz);

router.route('/:id/submit')
  .post(protect, submitQuiz);

router.route('/:id/submissions')
  .get(protect, getQuizSubmissions);

router.route('/:id')
  .put(protect, updateQuiz);

module.exports = router;
