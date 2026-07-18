const AttendanceForm = require('../models/AttendanceForm');
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const GlobalSetting = require('../models/GlobalSetting');

// @desc    Create a new attendance form link
// @route   POST /api/v1/projects/:projectId/attendance-forms
// @access  Private (Mentors)
exports.createAttendanceForm = async (req, res, next) => {
  try {
    const { presentMark, absentMark } = req.body;
    const projectId = req.params.projectId;

    // We can just create one, or deactivate previous ones first if we want only 1 active link
    // But since this is a daily generation or ad-hoc generation, let's just create it
    const form = await AttendanceForm.create({
      project: projectId,
      presentMark: presentMark || 1,
      absentMark: absentMark || -1,
      isActive: true,
      absenteesProcessed: false,
    });

    res.status(201).json({
      success: true,
      data: form,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance forms for a project
// @route   GET /api/v1/projects/:projectId/attendance-forms
// @access  Private
exports.getAttendanceForms = async (req, res, next) => {
  try {
    const forms = await AttendanceForm.find({ project: req.params.projectId }).sort('-createdAt');
    res.status(200).json({
      success: true,
      count: forms.length,
      data: forms,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get public attendance form info
// @route   GET /api/v1/public/attendance-forms/:formId
// @access  Public
exports.getPublicAttendanceForm = async (req, res, next) => {
  try {
    const form = await AttendanceForm.findById(req.params.formId).populate('project', 'name batch');
    
    if (!form) {
      return res.status(404).json({ success: false, message: 'Form not found' });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: form._id,
        project: form.project,
        presentMark: form.presentMark,
        absentMark: form.absentMark,
        isActive: form.isActive,
        date: new Date(form.createdAt).toISOString().split('T')[0] // Use createdAt as display date
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit public attendance form
// @route   POST /api/v1/public/attendance-forms/:formId/submit
// @access  Public
exports.submitPublicAttendanceForm = async (req, res, next) => {
  try {
    const { email, name, jobsApplied } = req.body;
    const formId = req.params.formId;

    const form = await AttendanceForm.findById(formId);
    if (!form) {
      return res.status(404).json({ success: false, message: 'Form not found' });
    }

    if (!form.isActive) {
      return res.status(400).json({ success: false, message: 'This form is no longer accepting responses.' });
    }

    // Find student
    let student = await Student.findOne({ email: email.toLowerCase(), project: form.project });
    
    if (!student) {
      // Create student if not found
      student = await Student.create({
        name: name || email.split('@')[0],
        email: email.toLowerCase(),
        project: form.project,
        activeStatus: 'Active',
        hiredStatus: 'Hunting',
        riskStatus: 'Low',
        totalAttendance: 0,
        totalAbsent: 0,
        totalAttendanceMark: 0,
        totalTaskMark: 0,
        totalMark: 0,
        attendanceStreak: 0,
        absentStreak: 0,
        jobsApplied: jobsApplied || 0
      });
    } else {
      // Update jobsApplied
      if (jobsApplied) {
        student.jobsApplied = (student.jobsApplied || 0) + Number(jobsApplied);
      }
    }

    // Dynamic timestamp based on server time
    const todayStr = new Date().toISOString().split('T')[0];

    // Check if attendance already exists for today
    const startOfDay = new Date();
    startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date();
    endOfDay.setHours(23,59,59,999);

    const existingAtt = await Attendance.findOne({
      student: student._id,
      project: form.project,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    if (existingAtt && existingAtt.status === 'Present') {
      return res.status(400).json({ success: false, message: 'You have already marked your attendance for today.' });
    }

    let mark = form.presentMark;
    let newAtt = existingAtt;

    if (existingAtt) {
      // If marked as absent or leave, update to present
      existingAtt.status = 'Present';
      existingAtt.mark = mark;
      await existingAtt.save();
    } else {
      newAtt = await Attendance.create({
        student: student._id,
        project: form.project,
        date: Date.now(),
        status: 'Present',
        mark: mark
      });
    }

    // Update stats
    student.totalAttendance += 1;
    student.attendanceStreak += 1;
    student.absentStreak = 0;
    student.totalAttendanceMark += mark;
    student.totalMark = student.totalAttendanceMark + student.totalTaskMark;
    
    await student.save();

    res.status(200).json({
      success: true,
      data: {
        studentName: student.name,
        date: todayStr,
        mark: mark,
        jobsApplied: student.jobsApplied
      }
    });

  } catch (error) {
    next(error);
  }
};
