// @desc    Mock AI Resume Scorer
// @route   POST /api/v1/ai/resume-score
// @access  Private
exports.scoreResume = async (req, res, next) => {
  try {
    const { resumeUrl } = req.body;
    
    // Here we would call an external AI API (e.g. OpenAI) to analyze the resume
    // For now, return a mock response
    
    const mockScore = Math.floor(Math.random() * 40) + 60; // 60-100
    
    res.status(200).json({
      success: true,
      data: {
        score: mockScore,
        feedback: 'The resume looks good but could use more details on recent projects.',
        improvements: ['Add quantitative metrics', 'Highlight leadership roles']
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mock AI Predictive Risk Analysis
// @route   POST /api/v1/ai/predict-risk
// @access  Private
exports.predictRisk = async (req, res, next) => {
  try {
    const { studentStats } = req.body;
    
    // Pass student stats (attendance, scores) to AI model
    // Mock response
    
    let riskLevel = 'Low';
    if (studentStats.attendancePercentage < 60) riskLevel = 'High';
    else if (studentStats.attendancePercentage < 80) riskLevel = 'Medium';
    
    res.status(200).json({
      success: true,
      data: {
        riskLevel,
        reason: riskLevel === 'High' ? 'Low attendance trend detected.' : 'Student is performing consistently.'
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Manually trigger AI risk emails
// @route   POST /api/v1/ai/send-risk-emails
// @access  Private
const { generateWarningEmail, generateQuizQuestions } = require('../utils/aiService');
const sendEmail = require('../utils/sendEmail');
const Student = require('../models/Student');

exports.sendRiskEmails = async (req, res, next) => {
  try {
    const { studentId } = req.body || {};
    let query = { riskStatus: 'High' };
    
    if (studentId) {
      query = { _id: studentId };
    }

    const atRiskStudents = await Student.find(query).populate({
      path: 'project',
      populate: {
        path: 'mentor',
        model: 'User'
      }
    });

    let emailsSent = 0;

    for (let student of atRiskStudents) {
      if (student.email && student.project && student.project.mentor) {
        const mentor = student.project.mentor;
        const emailBody = await generateWarningEmail(student.name, mentor.name);
        
        const mailOptions = {
          to: student.email + ', ' + mentor.email,
          subject: 'Action Required: Boot-camp Performance Update',
          text: emailBody
        };

        await sendEmail(mailOptions);
        emailsSent++;
      }
    }

    res.status(200).json({
      success: true,
      message: `${emailsSent} warning emails sent.`,
    });
  } catch (error) {
    next(error);
  }
};

exports.generateQuiz = async (req, res, next) => {
  try {
    const { topic, numQuestions, marksPerQuestion, difficulty } = req.body;
    if (!topic || !numQuestions || !marksPerQuestion || !difficulty) {
      return res.status(400).json({ success: false, message: 'Please provide topic, numQuestions, marksPerQuestion, and difficulty.' });
    }

    const questions = await generateQuizQuestions(topic, numQuestions, marksPerQuestion, difficulty);

    res.status(200).json({
      success: true,
      data: questions
    });
  } catch (error) {
    next(error);
  }
};
