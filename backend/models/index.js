// models/attendance.js
const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB (connection handled in server.js, so you can remove this connect if already done there)
// mongoose.connect(process.env.MONGO_URI);

// Define schema
const attendanceSchema = new mongoose.Schema({
  rollNumber: {
    type: String,
    required: true,
    match: /^[a-zA-Z0-9]+$/, // Alphanumeric roll numbers
    trim: true,
  },
  name: {
    type: String,
    required: true,
  },
  optionalField: {
    type: String,
    default: null,
  },
  attendanceDate: {
  type: Date,
  required: true,
  default: () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // reset time part to 00:00:00
    return today;
  }
  },
  timestamp: {
    type: String,
    default: () => new Date().toLocaleTimeString(), // store just time
  },
  ipAddress: {
    type: String,
    default: '0.0.0.0',
  },
});

// Unique index on rollNumber + attendanceDate
attendanceSchema.index({ rollNumber: 1, attendanceDate: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
