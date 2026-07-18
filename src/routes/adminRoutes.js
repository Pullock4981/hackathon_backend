const express = require('express');
const {
  getUsers,
  updateUser,
  deleteUser,
  getStudents,
  updateStudent,
  deleteStudent
} = require('../controllers/adminController');

const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply auth middleware to all routes in this file
router.use(protect);
router.use(authorize('admin'));

router.route('/users')
  .get(getUsers);

router.route('/users/:id')
  .put(updateUser)
  .delete(deleteUser);

router.route('/students')
  .get(getStudents);

router.route('/students/:id')
  .put(updateStudent)
  .delete(deleteStudent);

module.exports = router;
