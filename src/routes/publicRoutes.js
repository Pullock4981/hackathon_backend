const express = require('express');
const {
  getPublicAttendanceForm,
  submitPublicAttendanceForm
} = require('../controllers/attendanceFormController');
const {
  getPublicQuiz,
  submitPublicQuiz
} = require('../controllers/quizController');

const router = express.Router();

router.get('/attendance-forms/:formId', getPublicAttendanceForm);
router.post('/attendance-forms/:formId/submit', submitPublicAttendanceForm);

router.get('/quizzes/:quizId', getPublicQuiz);
router.post('/quizzes/:quizId/submit', submitPublicQuiz);

module.exports = router;
