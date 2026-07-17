const express = require('express');
const {
  addStudent,
  getStudents,
  bulkAddStudents,
  updateStudentProfile
} = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router({ mergeParams: true }); // Important for nested routes

router.route('/')
  .get(protect, getStudents)
  .post(protect, addStudent);

router.route('/bulk')
  .post(protect, bulkAddStudents);

// This handles /api/v1/students/:id since it's mounted differently?
// Actually if mounted from projectRoutes it will be /api/v1/projects/:projectId/students/:id
// But we might want to update a student directly without project ID
const directRouter = express.Router();
directRouter.route('/:id')
  .put(protect, updateStudentProfile);

module.exports = router;
module.exports.directRouter = directRouter;
