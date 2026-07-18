const express = require('express');
const {
  createProject,
  getProjects,
  getProject,
  createFormConfig,
  updateFormConfig
} = require('../controllers/projectController');
const { calculateTiers, getLeaderboard } = require('../controllers/statsController');
const { protect } = require('../middleware/authMiddleware');

// Include other resource routers
const studentRouter = require('./studentRoutes');
const attendanceRouter = require('./attendanceRoutes');
const attendanceFormRouter = require('./attendanceFormRoutes');
const taskRouter = require('./taskRoutes');
const quizRouter = require('./quizRoutes');

const router = express.Router();

// Re-route into other resource routers
router.use('/:projectId/students', studentRouter);
router.use('/:projectId/attendance', attendanceRouter);
router.use('/:projectId/attendance-forms', attendanceFormRouter);
router.use('/:projectId/tasks', taskRouter);
router.use('/:projectId/quizzes', quizRouter);

router.route('/')
  .get(protect, getProjects)
  .post(protect, createProject);

router.route('/:id')
  .get(protect, getProject);

router.post('/:projectId/calculate-tiers', protect, calculateTiers);
router.get('/:projectId/leaderboard', protect, getLeaderboard);

router.route('/:projectId/forms')
  .post(protect, createFormConfig)
  .put(protect, updateFormConfig);

module.exports = router;
