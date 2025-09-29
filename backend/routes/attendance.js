const express = require('express');
const router = express.Router();
const {Attendance, AttendanceCount} = require('../models/index'); 
const os = require('os');
const AppState = require('../models/appState');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

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
  const IST_OFFSET_MINUTES = 330; // 5 hours and 30 minutes

  const now = new Date();
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000); // Convert local time to UTC in milliseconds
  const istTime = new Date(utcTime + (IST_OFFSET_MINUTES * 60000)); // Add IST offset

  const currentDate = istTime.toISOString().split('T')[0];
  const currentTime = istTime.toTimeString().split(' ')[0];
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
    /*

    Could not get IP of student when hosted on vercel.
    Public ip of multiple users are same...
    Removing this feature, can add later.
    
    */
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
  if (!rollNumber && !date) {
    return res.status(400).json({ success: false, message: 'Roll number or date is required.' });
  }

  try {
    let deleted = await Attendance.findOneAndDelete({ rollNumber, attendanceDate: date , ipAddress: ipAddress});
    if (deleted) {
      return res.status(200).json({ success: true, message: 'Attendance record deleted.' });
    }
    
    // Delete all records matching the criteria
    const deleteResult = await Attendance.deleteMany({ attendanceDate: date, ipAddress: ipAddress });
    if (deleteResult.deletedCount > 0) {
      return res.status(200).json({ success: true, message: `${deleteResult.deletedCount} attendance record(s) deleted.` });
    }

    return res.status(404).json({ success: false, message: 'Attendance record not found.' });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});
router.post('/close-attendance', async (req, res) => {
  try {
    const IST_OFFSET_MINUTES = 330;
    const now = new Date();
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    const istTime = new Date(utcTime + (IST_OFFSET_MINUTES * 60000));
    const currentDate = istTime.toISOString().split('T')[0];

    const allCounts = await AttendanceCount.find({});
    for (const record of allCounts) {
      const present = await Attendance.findOne({ rollNumber: record.rollNumber, attendanceDate: currentDate });
      if (!present) {
        record.count += 1;
        await record.save();
      }
    }
    res.status(200).json({ success: true, message: 'Attendance counts updated for absentees.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});
module.exports = router;