const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const GlobalSetting = require('../models/GlobalSetting');

// Helper to get global settings
const getSettings = async () => {
  let settings = await GlobalSetting.findOne();
  if (!settings) {
    settings = await GlobalSetting.create({});
  }
  return settings;
};

// @desc    Submit daily attendance (Present/Absent/Leave)
// @route   POST /api/v1/projects/:projectId/attendance
// @access  Private (Mentors or Students via dynamic link)
exports.submitAttendance = async (req, res, next) => {
  try {
    const { studentId, date, status } = req.body;
    const projectId = req.params.projectId;

    const student = await Student.findOne({ _id: studentId, project: projectId });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found in this project' });
    }

    const settings = await getSettings();
    let mark = 0;
    if (status === 'Present') mark = settings.attendancePresentMark;
    else if (status === 'Absent') mark = settings.attendanceAbsentMark;
    else if (status === 'Leave') mark = 0; // Leave is 0

    const attendance = await Attendance.create({
      student: studentId,
      project: projectId,
      date: date || Date.now(),
      status,
      mark
    });

    // Update Student stats
    if (status === 'Present') {
      student.totalAttendance += 1;
      student.attendanceStreak += 1;
      student.absentStreak = 0;
    } else if (status === 'Absent') {
      student.totalAbsent += 1;
      student.absentStreak += 1;
      student.attendanceStreak = 0;
    }
    
    student.totalAttendanceMark += mark;
    student.totalMark = student.totalAttendanceMark + student.totalTaskMark;
    await student.save();

    res.status(201).json({
      success: true,
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance for a project (can filter by date)
// @route   GET /api/v1/projects/:projectId/attendance
// @access  Private
exports.getProjectAttendance = async (req, res, next) => {
  try {
    const query = { project: req.params.projectId };
    
    // Optional date filter
    if (req.query.date) {
      const startOfDay = new Date(req.query.date);
      startOfDay.setHours(0,0,0,0);
      const endOfDay = new Date(req.query.date);
      endOfDay.setHours(23,59,59,999);
      
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }

    const attendances = await Attendance.find(query).populate('student', 'name email profilePicture');

    res.status(200).json({
      success: true,
      count: attendances.length,
      data: attendances,
    });
  } catch (error) {
    next(error);
  }
};
