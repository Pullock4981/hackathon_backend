const express = require('express');
const {
  submitTask,
  getProjectTasks
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router({ mergeParams: true });

router.route('/')
  .get(protect, getProjectTasks)
  .post(protect, submitTask);

module.exports = router;
