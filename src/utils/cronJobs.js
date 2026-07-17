const cron = require('node-cron');
const Student = require('../models/Student');
const Project = require('../models/Project');
const sendEmail = require('./sendEmail');
const { generateWarningEmail } = require('./aiService');

// Daily task to reset things or update stats
// Run at 00:00 every day
const initCronJobs = () => {
  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily cron job for student updates and emails...');
    
    try {
      // 1. Logic for Red Zone / High Risk students
      const atRiskStudents = await Student.find({ riskStatus: 'High' }).populate({
        path: 'project',
        populate: {
          path: 'mentor',
          model: 'User'
        }
      });

      for (let student of atRiskStudents) {
        // Ensure student has email and mentor exists
        if (student.email && student.project && student.project.mentor) {
          const mentor = student.project.mentor;
          
          // Generate AI email body
          const emailBody = await generateWarningEmail(student.name, mentor.name);
          
          // Prepare recipients (student and mentor CC'd)
          const mailOptions = {
            to: student.email + ', ' + mentor.email,
            subject: 'Action Required: Boot-camp Performance Update (High Risk)',
            text: emailBody
          };

          // Send email
          await sendEmail(mailOptions);
          console.log(`Warning email sent for student: ${student.email}`);
        }
      }
      
      console.log('Cron job completed successfully.');
    } catch (error) {
      console.error('Error running cron job:', error);
    }
  });
  
  console.log('CRON jobs initialized.');
};

module.exports = initCronJobs;
