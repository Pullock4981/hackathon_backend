const mongoose = require('mongoose');

const globalSettingSchema = new mongoose.Schema(
  {
    attendancePresentMark: {
      type: Number,
      default: 1,
    },
    attendanceAbsentMark: {
      type: Number,
      default: -1,
    },
    taskCompleteMark: {
      type: Number,
      default: 1,
    },
    taskIncompleteMark: {
      type: Number,
      default: -1,
    },
    // We can ensure only one settings document exists by using a singleton pattern 
    // or just checking if one exists before creating.
    isSingleton: {
      type: Boolean,
      default: true,
      unique: true, // Forces only one document to have true
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('GlobalSetting', globalSettingSchema);
