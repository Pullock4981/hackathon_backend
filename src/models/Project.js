const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a project name'],
      trim: true,
    },
    batch: {
      type: String,
      required: [true, 'Please add a batch number/name'],
    },
    description: {
      type: String,
    },
    mentor: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Completed'],
      default: 'Active',
    },
    startedDate: {
      type: String,
    },
    bannerImage: {
      type: String,
    },
    // Calculated fields to cache performance (updated occasionally via CRON or triggers)
    totalStudents: { type: Number, default: 0 },
    avgAttendanceRate: { type: Number, default: 0 },
    totalHired: { type: Number, default: 0 },
    totalInactive: { type: Number, default: 0 },
    totalActive: { type: Number, default: 0 },
    totalRisk: { type: Number, default: 0 },
    customFormConfig: {
      type: Object,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Project', projectSchema);
