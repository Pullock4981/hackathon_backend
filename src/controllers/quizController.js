const Quiz = require('../models/Quiz');
const QuizSubmission = require('../models/QuizSubmission');
const Student = require('../models/Student');

// @desc    Create a quiz
// @route   POST /api/v1/projects/:projectId/quizzes
// @access  Private (Mentor/Admin)
exports.createQuiz = async (req, res, next) => {
  try {
    req.body.project = req.params.projectId;
    const quiz = await Quiz.create(req.body);

    res.status(201).json({
      success: true,
      data: quiz,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all quizzes for a project
// @route   GET /api/v1/projects/:projectId/quizzes
// @access  Private
exports.getQuizzes = async (req, res, next) => {
  try {
    const quizzes = await Quiz.find({ project: req.params.projectId });

    res.status(200).json({
      success: true,
      count: quizzes.length,
      data: quizzes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit a quiz and auto-calculate marks
// @route   POST /api/v1/projects/:projectId/quizzes/:id/submit
// @access  Private (Student typically, but using Mentor token here for simplicity)
exports.submitQuiz = async (req, res, next) => {
  try {
    const { studentId, answers, status } = req.body;
    const quizId = req.params.id;
    const projectId = req.params.projectId;

    const quiz = await Quiz.findById(quizId);
    if (!quiz || quiz.status !== 'Live') {
      return res.status(400).json({ success: false, message: 'Quiz is not available' });
    }

    const student = await Student.findOne({ _id: studentId, project: projectId });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found in this project' });
    }

    let score = 0;
    let totalPossibleScore = 0;
    const processedAnswers = [];

    // Auto-grading logic
    quiz.questions.forEach((question) => {
      totalPossibleScore += question.marks;
      
      const studentAnswerObj = answers.find(a => a.questionId === question._id.toString());
      const providedAnswer = studentAnswerObj ? studentAnswerObj.providedAnswer : null;
      
      const isCorrect = providedAnswer === question.correctAnswer;
      if (isCorrect) {
        score += question.marks;
      }

      processedAnswers.push({
        questionId: question._id,
        providedAnswer,
        isCorrect
      });
    });

    const submission = await QuizSubmission.create({
      quiz: quizId,
      student: studentId,
      project: projectId,
      score,
      totalPossibleScore,
      status: status || 'Submitted', // Could be 'Auto-Submitted (Cheated)'
      answers: processedAnswers
    });

    // Optionally update student profile with total mock interview score or average quiz score
    // student.mockInterviewScore = ((student.mockInterviewScore + (score / totalPossibleScore) * 100) / 2);
    // await student.save();

    res.status(201).json({
      success: true,
      data: submission,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Student has already submitted this quiz' });
    }
    next(error);
  }
};
