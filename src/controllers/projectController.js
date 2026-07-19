const Project = require('../models/Project');
const Student = require('../models/Student');

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

// @desc    Initialize form configuration for a project
// @route   POST /api/v1/projects/:projectId/forms
// @access  Private
exports.createFormConfig = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    
    // Check ownership
    if (project.mentor.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only the assigned mentor can configure this form' });
    }

    project.customFormConfig = {
      _id: project._id,
      fields: [
        { id: 'email', label: 'Email', type: 'text', required: true },
        { id: 'name', label: 'Name', type: 'text', required: true },
        { id: 'courseEmail', label: 'Your Course Email Address', type: 'text', required: true },
        { id: 'phoneNumber', label: 'Mobile Number', type: 'text', required: true },
        { id: 'discordUsername', label: 'Discord Username', type: 'text', required: true },
        { id: 'currentAddress', label: 'Your current address (area, police station, and district)', type: 'textarea', required: true },
        { id: 'educationInstitute', label: 'Your Education Institute', type: 'text', required: true },
        { id: 'groupSubject', label: 'Group/Subject', type: 'text', required: true },
        { id: 'nextExamDate', label: 'আপনার পরবর্তী এক্সাম এর সম্ভাব্য তারিখ কবে?', type: 'date', required: false },
        { id: 'currentOccupation', label: 'Currently, what are you doing', type: 'select', required: true, options: ['University Student', 'College Student', 'High School Student', 'Non Development Job (Looking for a switch)', 'Development Job', 'Unemployed (Looking for first job)', 'Other'] },
        { id: 'level2Batch', label: 'Which batch are you in for the Level 2 course?', type: 'select', required: true, options: ['Level 2 Batch 1', 'Level 2 Batch 2', 'Level 2 Batch 3', 'Level 2 Batch 4', 'Level 2 Batch 5', 'Level 2 Batch 6', 'Level 2 Batch 7', 'Other'] }
      ]
    };
    await project.save();

    res.status(201).json({
      success: true,
      data: project.customFormConfig
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update form configuration
// @route   PUT /api/v1/projects/:projectId/forms
// @access  Private
exports.updateFormConfig = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    
    // Check ownership
    if (project.mentor.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only the assigned mentor can configure this form' });
    }

    const { fields } = req.body;
    project.customFormConfig = {
      _id: project._id,
      fields: fields || []
    };
    await project.save();

    res.status(200).json({
      success: true,
      data: project.customFormConfig
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get public form configuration
// @route   GET /api/v1/public/projects/:projectId/form
// @access  Public
exports.getPublicForm = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    if (!project.customFormConfig || !project.customFormConfig.fields || project.customFormConfig.fields.length === 0 || project.customFormConfig.fields.length === 5) {
      project.customFormConfig = {
        _id: project._id,
        fields: [
          { id: 'email', label: 'Email', type: 'text', required: true },
          { id: 'name', label: 'Name', type: 'text', required: true },
          { id: 'courseEmail', label: 'Your Course Email Address', type: 'text', required: true },
          { id: 'phoneNumber', label: 'Mobile Number', type: 'text', required: true },
          { id: 'discordUsername', label: 'Discord Username', type: 'text', required: true },
          { id: 'currentAddress', label: 'Your current address (area, police station, and district)', type: 'textarea', required: true },
          { id: 'educationInstitute', label: 'Your Education Institute', type: 'text', required: true },
          { id: 'groupSubject', label: 'Group/Subject', type: 'text', required: true },
          { id: 'nextExamDate', label: 'আপনার পরবর্তী এক্সাম এর সম্ভাব্য তারিখ কবে?', type: 'date', required: false },
          { id: 'currentOccupation', label: 'Currently, what are you doing', type: 'select', required: true, options: ['University Student', 'College Student', 'High School Student', 'Non Development Job (Looking for a switch)', 'Development Job', 'Unemployed (Looking for first job)', 'Other'] },
          { id: 'level2Batch', label: 'Which batch are you in for the Level 2 course?', type: 'select', required: true, options: ['Level 2 Batch 1', 'Level 2 Batch 2', 'Level 2 Batch 3', 'Level 2 Batch 4', 'Level 2 Batch 5', 'Level 2 Batch 6', 'Level 2 Batch 7', 'Other'] }
        ]
      };
      await project.save();
    }

    res.status(200).json({
      success: true,
      data: project.customFormConfig
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit public form and update student
// @route   POST /api/v1/public/projects/:projectId/form/submit
// @access  Public
exports.submitPublicForm = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const formData = req.body;
    const email = formData.email || formData.mail || formData.emailAddress;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required to identify the student.' });
    }

    // Find student in this project by email
    const student = await Student.findOne({ email: email.toLowerCase(), project: project._id });
    
    if (!student) {
      return res.status(404).json({ success: false, message: 'No student found with this email in the project cohort.' });
    }

    // Assign all form fields to the student dynamically
    for (const key in formData) {
      if (key !== 'email' && key !== 'mail' && key !== 'emailAddress' && key !== 'project') {
        student[key] = formData[key];
      }
    }
    await student.save();

    res.status(200).json({
      success: true,
      message: 'Details updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Import sheet proxy (fetches CSV URL)
// @route   POST /api/v1/projects/import-sheet
// @access  Private
exports.importSheet = async (req, res, next) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, message: 'Google Sheet CSV URL is required' });
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch sheet: ${response.statusText}`);
    }

    const csvData = await response.text();

    res.status(200).json({
      success: true,
      csvData
    });
  } catch (error) {
    next(error);
  }
};
