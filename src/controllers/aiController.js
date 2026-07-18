// @desc    Mock AI Resume Scorer
// @route   POST /api/v1/ai/resume-score
// @access  Private
exports.scoreResume = async (req, res, next) => {
  try {
    const { resumeUrl } = req.body;
    
    if (!resumeUrl) {
      return res.status(400).json({ success: false, message: 'Resume URL is required' });
    }
    
    // Generate a deterministic score based on the resume URL length and characters
    let seed = 0;
    for (let i = 0; i < resumeUrl.length; i++) {
      seed += resumeUrl.charCodeAt(i);
    }
    
    // Use the seed to generate a consistent score between 65 and 96
    const mockScore = 65 + (seed % 32); 
    
    // Choose consistent feedback based on the score
    let issues = [];
    let feedback = '';

    if (mockScore >= 85) {
      feedback = 'The resume is exceptionally well-structured with clear impact metrics. Highly compatible with top-tier roles.';
      issues = [
        { problem: 'Slightly generic professional summary.', recovery: 'Tailor the summary specifically to the target job description to stand out even more.' }
      ];
    } else if (mockScore >= 75) {
      feedback = 'The resume shows strong potential but lacks concrete data and impact metrics in some areas. Structural flow is decent.';
      issues = [
        { problem: 'Missing quantitative metrics in the "Projects" section.', recovery: 'Add numbers to show impact (e.g., "Improved load time by 30%").' },
        { problem: 'Leadership experience is not highlighted prominently.', recovery: 'Create a separate "Leadership" section or emphasize team management roles.' }
      ];
    } else {
      feedback = 'The resume needs significant improvement in formatting and content delivery to pass modern ATS systems effectively.';
      issues = [
        { problem: 'Weak action verbs used in descriptions.', recovery: 'Replace words like "Helped" or "Worked on" with strong action verbs like "Architected", "Spearheaded", or "Optimized".' },
        { problem: 'Formatting is inconsistent or overly complex.', recovery: 'Use a clean, single-column layout with consistent fonts and spacing for ATS parsing.' },
        { problem: 'Lack of clear technical stack summary.', recovery: 'Add a dedicated "Skills" section grouping technologies by category (Frontend, Backend, Tools).' }
      ];
    }
    
    res.status(200).json({
      success: true,
      data: {
        score: mockScore,
        feedback,
        issues
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
