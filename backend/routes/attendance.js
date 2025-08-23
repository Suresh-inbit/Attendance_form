const express = require('express');
const router = express.Router();
const Attendance = require('../models/index'); // model we converted
const os = require('os');
const AppState = require('../models/appState');


// Validation helpers
function isValidRollNumber(rollNumber) {
  return /^[a-zA-Z0-9]+$/.test(rollNumber);
}
function isValidName(name) {
  return /^[A-Za-z ]+$/.test(name);
}

// POST /api/attendance/add
router.post('/add', async (req, res) => {
  const { rollNumber, name, optionalField } = req.body;
  let rawIP =
  req.headers['x-real-ip'] ||
  req.headers['x-forwarded-for']?.split(',')[0].trim() ||
  req.connection?.remoteAddress ||
  req.socket?.remoteAddress ||
  req.ip;

  const ipAddress = rawIP.startsWith("::ffff:") ? rawIP.substring(7) : rawIP;

  const now = new Date();
  now.setHours(now.getHours() + 6); 
  const currentDate = now.toISOString().split("T")[0]; // "Mon Aug 12 2025"
  // console.log(currentDate);
  now.setHours(now.getHours() - 6); 
  const currentTime = now.toTimeString({timezone:'IST'}).split(' ')[0]; 

  const appState = await AppState.findOne({ identifier: 'global' });
  if (!appState || !appState.toggleAttendance) {
    return res.status(400).json({ success: false, message: "Not the class time..." });
  }

  if (!rollNumber || !isValidRollNumber(rollNumber)) {
    return res.status(400).json({ success: false, message: 'Invalid roll number.' });
  }
  if (!name || !isValidName(name)) {
    return res.status(400).json({ success: false, message: 'Invalid name.' });
  }

  try {
    // Check if already marked by rollNumber for this date
    const existingEntry = await Attendance.findOne({ rollNumber, attendanceDate: currentDate });
    if (existingEntry) {
      return res.status(409).json({ success: false, message: 'Roll number already marked present.' });
    }

    // Check duplicate IP for same date
    const duplicateIp = await Attendance.findOne({ ipAddress, attendanceDate: currentDate });
    const AllowedIP = process.env.ADMIN_IP;

    // if (duplicateIp && (ipAddress !== AllowedIP && ipAddress !== '127.0.0.1')) {
    //   return res.status(409).json({ success: false, message: 'Proxy not allowed.' });
    // }

    // Save attendance
    const newEntry = new Attendance({
      rollNumber,
      name,
      optionalField,
      ipAddress,
      attendanceDate: currentDate,
      timestamp: currentTime,
    });

    await newEntry.save();
    res.status(200).json({ success: true, message: 'Attendance added.' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/attendance/list?date=...
router.get('/list', async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ success: false, message: 'Date is required.' });
    }

    const records = await Attendance.find({ attendanceDate: date }).sort({ timestamp: -1 });
    res.status(200).json({ success: true, data: records });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/attendance/count?date=...
router.get('/count', async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ success: false, message: 'Date is required.' });
    }

    const count = await Attendance.countDocuments({ attendanceDate: date });

    res.status(200).json({ success: true, date, count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/attendance/list-all
router.get('/list-all', async (req, res) => {
  try {
    const records = await Attendance.find().sort({ currentDate: -1 });
    res.status(200).json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching data', error });
  }
});

// POST /api/attendance/delete
router.post('/delete', async (req, res) => {
  const { rollNumber, date, ipAddress } = req.body;
  if (!rollNumber || !date) {
    return res.status(400).json({ success: false, message: 'Roll number and date are required.' });
  }

  try {
    let deleted = await Attendance.findOneAndDelete({ rollNumber, attendanceDate: date });
    if (deleted) {
      return res.status(200).json({ success: true, message: 'Attendance record deleted.' });
    }

    deleted = await Attendance.findOneAndDelete({ ipAddress, attendanceDate: date });
    if (deleted) {
      return res.status(200).json({ success: true, message: 'Attendance record deleted by IP.' });
    }

    return res.status(404).json({ success: false, message: 'Attendance record not found.' });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
