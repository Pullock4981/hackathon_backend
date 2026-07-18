const cron = require('node-cron');
const Student = require('../models/Student');
const Project = require('../models/Project');
const sendEmail = require('./sendEmail');
const { generateStudentWarningEmail, generateMentorWarningEmail } = require('./aiService');

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
          
          // Generate AI email body for student
          const studentEmailBody = await generateStudentWarningEmail(student.name, mentor.name);
          const studentMailOptions = {
            to: student.email,
            subject: 'Action Required: Boot-camp Performance Update (High Risk)',
            text: studentEmailBody
          };
          await sendEmail(studentMailOptions);

          // Generate AI email body for mentor
          const mentorEmailBody = await generateMentorWarningEmail(student.name, mentor.name);
          const mentorMailOptions = {
            to: mentor.email,
            subject: `Action Required: Student ${student.name} Needs Mentorship (High Risk)`,
            text: mentorEmailBody
          };
          await sendEmail(mentorMailOptions);
          
          console.log(`Warning emails sent for student: ${student.email} and mentor: ${mentor.email}`);
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
