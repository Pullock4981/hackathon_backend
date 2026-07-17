const express = require('express');
const {
  submitAttendance,
  getProjectAttendance
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router({ mergeParams: true });

router.route('/')
  .get(protect, getProjectAttendance)
  .post(protect, submitAttendance);

module.exports = router;
