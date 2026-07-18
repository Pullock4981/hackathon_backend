const Student = require('../models/Student');
const Project = require('../models/Project');

// @desc    Calculate and update tiers for all students in a project
// @route   POST /api/v1/projects/:projectId/calculate-tiers
// @access  Private
exports.calculateTiers = async (req, res, next) => {
  try {
    const projectId = req.params.projectId;
    const students = await Student.find({ project: projectId });

    const updatedStudents = [];

    for (let student of students) {
      const { 
        totalAttendance, 
        totalAbsent, 
        mockInterviewScore, 
        profiles 
      } = student;

      const totalDays = totalAttendance + totalAbsent;
      let attendancePercentage = 0;
      if (totalDays > 0) {
        attendancePercentage = (totalAttendance / totalDays) * 100;
      } else {
        // If no classes have happened, give them benefit of the doubt
        attendancePercentage = 100;
      }

      const profilesReady = profiles.resumeReady && profiles.githubReady && profiles.linkedinReady;

      let tier = 'Tier C';

      if (profilesReady && attendancePercentage >= 60 && mockInterviewScore >= 70) {
        tier = 'Tier A';
      } else if (profilesReady && attendancePercentage >= 50 && mockInterviewScore >= 60) {
        tier = 'Tier B';
      }

      student.tier = tier;
      await student.save();
      updatedStudents.push(student);
    }

    res.status(200).json({
      success: true,
      message: 'Tiers calculated successfully',
      count: updatedStudents.length,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get project leaderboard
// @route   GET /api/v1/projects/:projectId/leaderboard
// @access  Private
exports.getLeaderboard = async (req, res, next) => {
  try {
    const projectId = req.params.projectId;
    
    // Sort by totalMark descending
    const students = await Student.find({ project: projectId })
      .sort({ totalMark: -1 })
      .select('name email profilePicture tier totalMark attendanceStreak');

    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get global dashboard stats for a mentor
// @route   GET /api/v1/dashboard
// @access  Private
exports.getDashboardStats = async (req, res, next) => {
  try {
    const mentorId = req.user.id;
    
    // Find projects by this mentor (or all if admin)
    const projectQuery = req.user.role === 'admin' ? {} : { mentor: mentorId };
    const projects = await Project.find(projectQuery);
    
    const projectIds = projects.map(p => p._id);

    // Aggregate student stats across these projects
    const totalStudents = await Student.countDocuments({ project: { $in: projectIds } });
    const totalHired = await Student.countDocuments({ project: { $in: projectIds }, hiredStatus: 'Hired' });
    const totalActive = await Student.countDocuments({ project: { $in: projectIds }, activeStatus: 'Active' });
    
    const placementRate = totalStudents > 0 ? ((totalHired / totalStudents) * 100).toFixed(2) : 0;

    // Get real-time activities (recently added students)
    const recentStudents = await Student.find({ project: { $in: projectIds } })
      .sort({ createdAt: -1 })
      .limit(4)
      .populate('project', 'name batch');

    const recentActivities = recentStudents.map(student => ({
      text: `${student.name} profile was added/updated in the cohort`,
      time: new Date(student.createdAt).toLocaleDateString(),
      batch: student.project ? (student.project.batch || student.project.name) : 'Batch 1'
    }));

    // Get real-time priority tasks from at-risk students
    const riskStudents = await Student.find({ project: { $in: projectIds }, riskStatus: 'High' })
      .sort({ createdAt: -1 });

    const totalRiskCount = riskStudents.length;
    
    const priorityTasks = riskStudents.slice(0, 4).map(student => 
      `Contact ${student.name} immediately regarding high dropout risk`
    );

    let totalMentors = 0;
    if (req.user.role === 'admin') {
      const User = require('../models/User');
      totalMentors = await User.countDocuments({ role: 'mentor' });
    }

    res.status(200).json({
      success: true,
      data: {
        totalProjects: projects.length,
        totalStudents,
        totalMentors,
        totalHired,
        totalActive,
        placementRate: `${placementRate}%`,
        totalRiskCount,
        recentActivities,
        priorityTasks
      }
    });
  } catch (error) {
    next(error);
  }
};
