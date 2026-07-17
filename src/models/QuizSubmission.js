const mongoose = require('mongoose');

const quizSubmissionSchema = new mongoose.Schema(
  {
    quiz: {
      type: mongoose.Schema.ObjectId,
      ref: 'Quiz',
      required: true,
    },
    student: {
      type: mongoose.Schema.ObjectId,
      ref: 'Student',
      required: true,
    },
    project: {
      type: mongoose.Schema.ObjectId,
      ref: 'Project',
      required: true,
    },
    score: {
      type: Number,
      default: 0,
    },
    totalPossibleScore: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Submitted', 'Auto-Submitted (Cheated)', 'Auto-Submitted (Timeout)'],
      default: 'Submitted',
    },
    answers: [
      {
        questionId: { type: mongoose.Schema.ObjectId },
        providedAnswer: { type: String },
        isCorrect: { type: Boolean }
      }
    ]
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate submissions
quizSubmissionSchema.index({ quiz: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('QuizSubmission', quizSubmissionSchema);
