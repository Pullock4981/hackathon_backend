const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    phoneNumber: {
      type: String,
    },
    profilePicture: {
      type: String, // URL to image
    },
    project: {
      type: mongoose.Schema.ObjectId,
      ref: 'Project',
      required: true,
    },
    // Dynamic Tracking Data
    tier: {
      type: String,
      enum: ['Tier A', 'Tier B', 'Tier C'],
      default: 'Tier C',
    },
    riskStatus: {
      type: String,
      enum: ['Low', 'High', 'On Track'],
      default: 'On Track',
    },
    activeStatus: {
      type: String,
      enum: ['Active', 'Inactive', 'Risk', 'Willingly Leave'],
      default: 'Active',
    },
    hiredStatus: {
      type: String,
      enum: ['Looking', 'In Job task', 'In interview', 'On Process', 'Hired'],
      default: 'Looking',
    },
    // Statistics
    totalAttendance: { type: Number, default: 0 },
    totalAbsent: { type: Number, default: 0 },
    attendanceStreak: { type: Number, default: 0 },
    absentStreak: { type: Number, default: 0 },
    totalAttendanceMark: { type: Number, default: 0 },
    totalTaskMark: { type: Number, default: 0 },
    totalMark: { type: Number, default: 0 }, // Attendance + Task
    mockInterviewScore: { type: Number, default: 0 },
    // Profile Links
    profiles: {
      resume: { type: String, default: '' },
      github: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      resumeReady: { type: Boolean, default: false },
      githubReady: { type: Boolean, default: false },
      linkedinReady: { type: Boolean, default: false },
    },
    lastUpdateNote: { type: String, default: '' },
    lastUpdateDate: { type: Date },
  },
  {
    timestamps: true,
    strict: false,
  }
);

// Ensure a student can be added to a specific project only once (optional based on logic, but PRD says data isolated per project)
studentSchema.index({ email: 1, project: 1 }, { unique: true });

module.exports = mongoose.model('Student', studentSchema);
