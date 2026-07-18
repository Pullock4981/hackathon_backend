const Quiz = require('../models/Quiz');
const QuizSubmission = require('../models/QuizSubmission');
const Student = require('../models/Student');

// @desc    Create a quiz
// @route   POST /api/v1/projects/:projectId/quizzes
// @access  Private (Mentor/Admin)
exports.createQuiz = async (req, res, next) => {
  try {
    req.body.project = req.params.projectId;
    req.body.creator = req.user.id;
    const quiz = await Quiz.create(req.body);

    res.status(201).json({
      success: true,
      data: quiz,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a quiz (e.g. status change)
// @route   PUT /api/v1/projects/:projectId/quizzes/:id
// @access  Private
exports.updateQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOneAndUpdate(
      { _id: req.params.id, project: req.params.projectId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    res.status(200).json({
      success: true,
      data: quiz
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
    let query = { project: req.params.projectId };
    if (req.user.role !== 'admin') {
      query.creator = req.user.id;
    }
    const quizzes = await Quiz.find(query);

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

// @desc    Get public quiz details without answers
// @route   GET /api/v1/public/quizzes/:quizId
// @access  Public
exports.getPublicQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz || quiz.status !== 'Live') {
      return res.status(404).json({ success: false, message: 'Quiz not found or not active.' });
    }

    // Strip answers from questions
    const safeQuestions = quiz.questions.map(q => ({
      _id: q._id,
      questionText: q.questionText,
      options: q.options,
      marks: q.marks
    }));

    res.status(200).json({
      success: true,
      data: {
        _id: quiz._id,
        title: quiz.title,
        durationMinutes: quiz.durationMinutes,
        questions: safeQuestions,
        project: quiz.project
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify if a student is authorized (in the batch) to take the quiz
// @route   POST /api/v1/public/quizzes/:quizId/verify
// @access  Public
exports.verifyStudent = async (req, res, next) => {
  try {
    const { email } = req.body;
    const quizId = req.params.quizId;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz || quiz.status !== 'Live') {
      return res.status(400).json({ success: false, message: 'Quiz is not active.' });
    }

    const student = await Student.findOne({ email: email.toLowerCase(), project: quiz.project });
    if (!student) {
      return res.status(403).json({ success: false, message: 'Access Denied: You are not enrolled in the cohort for this quiz.' });
    }

    res.status(200).json({ success: true, message: 'Student verified.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit quiz answers
// @route   POST /api/v1/public/quizzes/:quizId/submit
// @access  Public
exports.submitPublicQuiz = async (req, res, next) => {
  try {
    const { name, email, answers, status } = req.body;
    const quizId = req.params.quizId;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Course Email is required.' });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz || quiz.status !== 'Live') {
      return res.status(400).json({ success: false, message: 'Quiz is no longer active.' });
    }

    // Find student (must exist in project batch)
    let student = await Student.findOne({ email: email.toLowerCase(), project: quiz.project });
    if (!student) {
      return res.status(403).json({ success: false, message: 'Access Denied: You are not enrolled in the cohort for this quiz.' });
    }

    let score = 0;
    let totalPossibleScore = 0;
    const processedAnswers = [];

    // Auto-grading logic
    quiz.questions.forEach((question) => {
      totalPossibleScore += question.marks;
      
      // Ensure answers handles both Object shape from body { qId: option }
      let providedAnswer = null;
      if (Array.isArray(answers)) {
        const studentAnswerObj = answers.find(a => a.questionId === question._id.toString());
        providedAnswer = studentAnswerObj ? studentAnswerObj.providedAnswer : null;
      } else if (typeof answers === 'object') {
        providedAnswer = answers[question._id.toString()] || null;
      }
      
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
      student: student._id,
      project: quiz.project,
      score,
      totalPossibleScore,
      status: status || 'Submitted',
      answers: processedAnswers
    });

    res.status(201).json({
      success: true,
      data: {
        score,
        totalPossibleScore,
        status: submission.status
      }
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already submitted this quiz.' });
    }
    next(error);
  }
};

// @desc    Get all submissions for a quiz
// @route   GET /api/v1/quizzes/:quizId/submissions
// @access  Private
exports.getQuizSubmissions = async (req, res, next) => {
  try {
    const submissions = await QuizSubmission.find({ quiz: req.params.id })
      .populate('student', 'name email profilePicture')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions
    });
  } catch (error) {
    next(error);
  }
};
