const express = require('express');
const {
  createAttendanceForm,
  getAttendanceForms
} = require('../controllers/attendanceFormController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router({ mergeParams: true });

router.route('/')
  .get(protect, getAttendanceForms)
  .post(protect, createAttendanceForm);

module.exports = router;
