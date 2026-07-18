require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const initCronJobs = require('./utils/cronJobs');

const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB().then(() => {
  // Initialize Cron Jobs
  initCronJobs();

  if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  }
}).catch((error) => {
  console.error('Failed to connect to the database:', error);
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

// Export the Express API for Vercel
module.exports = app;
