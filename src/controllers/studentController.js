const Student = require('../models/Student');
const Project = require('../models/Project');

// @desc    Add single student
// @route   POST /api/v1/projects/:projectId/students
// @access  Private
exports.addStudent = async (req, res, next) => {
  try {
    req.body.project = req.params.projectId;

    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const student = await Student.create(req.body);

    // Update total students count on project
    project.totalStudents += 1;
    await project.save();

    res.status(201).json({
      success: true,
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk import students (e.g., from parsed CSV/Sheet JSON array)
// @route   POST /api/v1/projects/:projectId/students/bulk
// @access  Private
exports.bulkAddStudents = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Expecting req.body.students to be an array of objects
    const students = req.body.students.map(s => ({ ...s, project: req.params.projectId }));

    const insertedStudents = await Student.insertMany(students, { ordered: false }); // unordered allows continuing on duplicates

    // Update count
    project.totalStudents = await Student.countDocuments({ project: req.params.projectId });
    await project.save();

    res.status(201).json({
      success: true,
      count: insertedStudents.length,
      data: insertedStudents,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all students for a project
// @route   GET /api/v1/projects/:projectId/students
// @access  Private
exports.getStudents = async (req, res, next) => {
  try {
    const students = await Student.find({ project: req.params.projectId });

    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update student profile
// @route   PUT /api/v1/students/:id
// @access  Private
exports.updateStudentProfile = async (req, res, next) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Import detailed student info (upsert by email)
// @route   POST /api/v1/projects/:projectId/students/import-details
// @access  Private
exports.importDetails = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const { students } = req.body;
    if (!students || !Array.isArray(students)) {
      return res.status(400).json({ success: false, message: 'Students array is required' });
    }

    let updatedCount = 0;
    let insertedCount = 0;

    for (const s of students) {
      if (!s.email) continue;
      
      const existing = await Student.findOne({ email: s.email, project: project._id });
      if (existing) {
        // Update existing
        Object.assign(existing, s);
        await existing.save();
        updatedCount++;
      } else {
        // Insert new
        await Student.create({ ...s, project: project._id });
        insertedCount++;
      }
    }

    project.totalStudents = await Student.countDocuments({ project: project._id });
    await project.save();

    res.status(200).json({
      success: true,
      message: `Updated ${updatedCount} and inserted ${insertedCount} students.`,
      updatedCount,
      insertedCount
    });
  } catch (error) {
    next(error);
  }
};
