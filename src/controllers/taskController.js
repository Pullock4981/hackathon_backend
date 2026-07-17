const Task = require('../models/Task');
const Student = require('../models/Student');
const GlobalSetting = require('../models/GlobalSetting');

const getSettings = async () => {
  let settings = await GlobalSetting.findOne();
  if (!settings) {
    settings = await GlobalSetting.create({});
  }
  return settings;
};

// @desc    Submit a task
// @route   POST /api/v1/projects/:projectId/tasks
// @access  Private
exports.submitTask = async (req, res, next) => {
  try {
    const { studentId, date, title, status } = req.body;
    const projectId = req.params.projectId;

    const student = await Student.findOne({ _id: studentId, project: projectId });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found in this project' });
    }

    const settings = await getSettings();
    let mark = 0;
    if (status === 'Complete') mark = settings.taskCompleteMark;
    else if (status === 'Incomplete') mark = settings.taskIncompleteMark;

    const task = await Task.create({
      student: studentId,
      project: projectId,
      date: date || Date.now(),
      title,
      status,
      mark
    });

    // Update Student stats
    student.totalTaskMark += mark;
    student.totalMark = student.totalAttendanceMark + student.totalTaskMark;
    await student.save();

    res.status(201).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get tasks for a project
// @route   GET /api/v1/projects/:projectId/tasks
// @access  Private
exports.getProjectTasks = async (req, res, next) => {
  try {
    const query = { project: req.params.projectId };
    
    if (req.query.date) {
      const startOfDay = new Date(req.query.date);
      startOfDay.setHours(0,0,0,0);
      const endOfDay = new Date(req.query.date);
      endOfDay.setHours(23,59,59,999);
      
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }

    const tasks = await Task.find(query).populate('student', 'name email profilePicture');

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};
