const express = require('express');
const router = express.Router();
const { Attendance } = require('../models');
// import os from 'os';
const os = require('os');
const { getToggleAttendance } = require('../routes/toggle'); // Import the toggle state

// let toggleAttendance = getToggleAttendance(); // in-memory toggle state

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name in interfaces) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1'; // fallback
}

// Validation helpers
function isValidRollNumber(rollNumber) {
  return /^[a-zA-Z0-9]+$/.test(rollNumber);
}
function isValidName(name) {
  return /^[A-Za-z ]+$/.test(name);
}


// POST /api/attendance/add
router.post('/add', async (req, res) => {
  const { rollNumber, name , optionalField } = req.body;
  const rawIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const ipAddress = rawIP.includes('::ffff:') ? rawIP.split('::ffff:')[1] : rawIP;
  const now = new Date();
  now.setHours(now.getHours() + 6); // Adjusting for timezone
  const currentDate = now.toDateString(); // 'YYYY-MM-DD'
  now.setHours(now.getHours() - 6); // restore original time
  const currentTime = now.toTimeString().split(' ')[0]; // HH:MM:SS
  if (!getToggleAttendance()) {
    return res.status(400).json({ success: false, message: "Not the class time..." });
  }


  if (!rollNumber || !isValidRollNumber(rollNumber)) {
    return res.status(400).json({ success: false, message: 'Invalid roll number.' });
  }
  if (!name || !isValidName(name)) {
    return res.status(400).json({ success: false, message: 'Invalid name.' });
  }
  

  try {
    const existingEntry = await Attendance.findOne({ where: { rollNumber , attendanceDate: currentDate } });
    if (existingEntry) {
      return res.status(409).json({ success: false, message: 'Roll number already marked present.' });
    }
    const duplicateIp = await Attendance.findOne({ where: { ipAddress , attendanceDate: currentDate } });
    const localIP = getLocalIP() ;

    if (duplicateIp && (ipAddress !== localIP && ipAddress !== '127.0.0.1')) {
      return res.status(409).json({
        success: false,
        message: 'Proxy not allowed.'
      });
    }


    await Attendance.create({
                rollNumber,
                name,
                optionalField,
                ipAddress,
                attendanceDate: currentDate,
                timestamp: currentTime
        });
    res.status(200).json({ success: true, message: 'Attendance added.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/attendance/list
router.get('/list', async (req, res) => {
  try {
    const { date } = req.query;
     if (!date) {
      return res.status(400).json({ success: false, message: 'Date is required.' });
    }

    const records = await Attendance.findAll({
      where: date ? { attendanceDate: date } : {},
      order: [['timestamp', 'DESC']]
    });
    res.status(200).json({ success: true, data: records });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/attendance/count
router.get('/count', async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ success: false, message: 'Date is required.' });
    }

    const count = await Attendance.count({
      where: { attendanceDate: date }
    });

    res.status(200).json({
      success: true,
      date,
      count
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


router.get('/list-all', async (req, res) => {
  try {
    const records = await Attendance.findAll({
      order: [['createdAt', 'DESC']], 
    });
    res.status(200).json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching data', error });
  }
});
router.post('/delete', async (req, res)=>{
  // Delete attendance record by roll number and date
  // Request body should contain rollNumber and date
  const { rollNumber, date , ipAddress} = req.body;
  if (!rollNumber || !date) {
    return res.status(400).json({ success: false, message: 'Roll number and date are required.' });
  }

  try {
    const deleted = await Attendance.destroy({
      where: {rollNumber, attendanceDate: date }
    });
    if (deleted) {
      return res.status(200).json({ success: true, message: 'Attendance record deleted.' });
    }
    else{
      const deleteIP = await Attendance.destroy({
        where: {ipAddress: ipAddress, attendanceDate: date }
      });
      if (deleteIP) {
        return res.status(200).json({ success: true, message: 'Attendance record deleted by IP' });
      }
    }
    return res.status(404).json({ success: false, message: 'Attendance record not found.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});
module.exports = router;
