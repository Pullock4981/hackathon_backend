const express = require('express');
const {
  getPublicAttendanceForm,
  submitPublicAttendanceForm
} = require('../controllers/attendanceFormController');
const {
  getPublicQuiz,
  submitPublicQuiz,
  verifyStudent
} = require('../controllers/quizController');
const {
  getPublicForm,
  submitPublicForm
} = require('../controllers/projectController');

const router = express.Router();

router.get('/attendance-forms/:formId', getPublicAttendanceForm);
router.post('/attendance-forms/:formId/submit', submitPublicAttendanceForm);

router.get('/quizzes/:quizId', getPublicQuiz);
router.post('/quizzes/:quizId/verify', verifyStudent);
router.post('/quizzes/:quizId/submit', submitPublicQuiz);

router.get('/projects/:projectId/form', getPublicForm);
router.post('/projects/:projectId/form/submit', submitPublicForm);

module.exports = router;
