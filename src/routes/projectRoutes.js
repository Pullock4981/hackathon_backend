const express = require('express');
const {
  createProject,
  getProjects,
  getProject
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

// Include other resource routers
const studentRouter = require('./studentRoutes');

const router = express.Router();

// Re-route into other resource routers
router.use('/:projectId/students', studentRouter);

router.route('/')
  .get(protect, getProjects)
  .post(protect, createProject);

router.route('/:id')
  .get(protect, getProject);

module.exports = router;
