const Project = require('../models/Project');

// @desc    Create a project
// @route   POST /api/v1/projects
// @access  Private (Mentor/Admin)
exports.createProject = async (req, res, next) => {
  try {
    req.body.mentor = req.user.id;

    const project = await Project.create(req.body);

    res.status(201).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all projects for logged-in mentor
// @route   GET /api/v1/projects
// @access  Private
exports.getProjects = async (req, res, next) => {
  try {
    // If admin, they could see all, but let's default to filtering by the logged-in mentor
    let query = {};
    if (req.user.role !== 'admin') {
      query.mentor = req.user.id;
    }

    const projects = await Project.find(query);

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project details
// @route   GET /api/v1/projects/:id
// @access  Private
exports.getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Check ownership
    if (project.mentor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to access this project' });
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};
