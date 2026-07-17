const cron = require('node-cron');
const Student = require('../models/Student');

// Daily task to reset things or update stats
// Run at 00:00 every day
const initCronJobs = () => {
  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily cron job for student updates...');
    
    try {
      // Find students whose last update date was more than a day ago
      // and maybe mark them absent if they didn't submit today (mock logic)
      
      // For demonstration, let's just log this. In a real app we would:
      // 1. Find all students who haven't submitted attendance today
      // 2. Mark them as absent (add to absentStreak, reset attendanceStreak)
      
      console.log('Cron job completed successfully.');
    } catch (error) {
      console.error('Error running cron job:', error);
    }
  });
  
  console.log('CRON jobs initialized.');
};

module.exports = initCronJobs;
