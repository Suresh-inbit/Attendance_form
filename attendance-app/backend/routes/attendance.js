const express = require('express');
const router = express.Router();
const { Attendance } = require('../models');

// Validation helpers
function isValidRollNumber(rollNumber) {
  return /^[a-zA-Z0-9]+$/.test(rollNumber);
}
function isValidName(name) {
  return /^[A-Za-z ]+$/.test(name);
}


// POST /api/attendance/add
router.post('/add', async (req, res) => {
  const { rollNumber, name } = req.body;
  const rawIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const ipAddress = rawIP.includes('::ffff:') ? rawIP.split('::ffff:')[1] : rawIP;
  const now = new Date();
  const currentTime = now.toTimeString().split(' ')[0]; // HH:MM:SS
  const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD


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
    const duplicateIp = await Attendance.findOne({ where: { ipAddress } });
    if (duplicateIp && ipAddress != process.env.LOCAL_IP) {
      return res.status(409).json({ success: false, message: 'IP record exists...' + process.env.LOCAL_IP });
    }

    await Attendance.create({
                rollNumber,
                name,
                ipAddress,
                attendanceDate: currentDate,
                timestamp: now
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
router.get('/all', async (req, res) => {
  try {
    const records = await Attendance.findAll({
      order: [['timestamp', 'DESC']], 
    });
    res.status(200).json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching data', error });
  }
});
module.exports = router;
