const mongoose = require('mongoose');

const attendanceFormSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.ObjectId,
      ref: 'Project',
      required: true,
    },
    presentMark: {
      type: Number,
      required: true,
      default: 1,
    },
    absentMark: {
      type: Number,
      required: true,
      default: -1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    absenteesProcessed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('AttendanceForm', attendanceFormSchema);
