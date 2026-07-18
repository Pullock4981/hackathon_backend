const User = require('../models/User');
const Student = require('../models/Student');

// @desc    Get all users (mentors, admins)
// @route   GET /api/v1/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a user
// @route   PUT /api/v1/admin/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
  try {
    const { name, email, role } = req.body;
    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;

    await user.save();

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a user
// @route   DELETE /api/v1/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await user.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all students
// @route   GET /api/v1/admin/students
// @access  Private/Admin
exports.getStudents = async (req, res, next) => {
  try {
    const students = await Student.find().populate('project', 'name batch').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: students.length, data: students });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a student
// @route   PUT /api/v1/admin/students/:id
// @access  Private/Admin
exports.updateStudent = async (req, res, next) => {
  try {
    let student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: student });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a student
// @route   DELETE /api/v1/admin/students/:id
// @access  Private/Admin
exports.deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    await student.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
