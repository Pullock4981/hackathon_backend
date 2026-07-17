const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
  marks: { type: Number, default: 1 }
});

const quizSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.ObjectId,
      ref: 'Project',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Live', 'Draft', 'Inactive'],
      default: 'Draft',
    },
    durationMinutes: {
      type: Number,
      default: 15,
    },
    questions: [questionSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Quiz', quizSchema);
