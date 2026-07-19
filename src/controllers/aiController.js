// @desc    Mock AI Resume Scorer
// @route   POST /api/v1/ai/resume-score
// @access  Private
const { generateStudentWarningEmail, generateMentorWarningEmail, generateQuizQuestions, analyzeResumeWithAI } = require('../utils/aiService');

// @desc    AI Resume Scorer
// @route   POST /api/v1/ai/resume-score
// @access  Private
exports.scoreResume = async (req, res, next) => {
  try {
    const { resumeUrl } = req.body;
    
    if (!resumeUrl) {
      return res.status(400).json({ success: false, message: 'Resume URL is required' });
    }
    
    // Call the OpenAI API via aiService
    const aiResult = await analyzeResumeWithAI(resumeUrl);
    
    res.status(200).json({
      success: true,
      data: {
        score: aiResult.score,
        feedback: aiResult.feedback,
        strengths: aiResult.strengths,
        issues: aiResult.issues
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
const sendEmail = require('../utils/sendEmail');
const Student = require('../models/Student');

exports.sendRiskEmails = async (req, res, next) => {
  try {
    const { studentId, studentIds } = req.body || {};
    let query = { riskStatus: 'High' };
    
    if (studentIds && Array.isArray(studentIds) && studentIds.length > 0) {
      query = { _id: { $in: studentIds } };
    } else if (studentId) {
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
        
        // Send email to student
        const studentEmailData = await generateStudentWarningEmail(student.name, mentor.name);
        const studentMailOptions = {
          to: student.email,
          subject: studentEmailData.subject || 'Action Required: Boot-camp Performance Update',
          text: studentEmailData.body || studentEmailData
        };
        await sendEmail(studentMailOptions);

        // Send email to mentor
        const mentorEmailData = await generateMentorWarningEmail(student.name, mentor.name);
        const mentorMailOptions = {
          to: mentor.email,
          subject: mentorEmailData.subject || `Action Required: Student ${student.name} Needs Mentorship`,
          text: mentorEmailData.body || mentorEmailData
        };
        await sendEmail(mentorMailOptions);

        emailsSent += 2;
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
