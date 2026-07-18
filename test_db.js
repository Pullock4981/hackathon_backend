const mongoose = require('mongoose');
require('dotenv').config();

const Project = require('./src/models/Project');
const Student = require('./src/models/Student');

async function test() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const projects = await Project.find().sort({ createdAt: -1 }).limit(5);
    console.log('Recent Projects:');
    for (const p of projects) {
      const studentCount = await Student.countDocuments({ project: p._id });
      console.log(`- ${p.name} (ID: ${p._id}, Batch: ${p.batch}, CreatedAt: ${p.createdAt}) -> Students in DB: ${studentCount}`);
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

test();
