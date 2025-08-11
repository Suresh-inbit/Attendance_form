const express = require('express');
const router = express.Router();

let toggleState = false; // store in-memory

// Get toggle state
router.get('/', (req, res) => {
  res.json({ state: toggleState });
});

// Update toggle state
router.post('/', (req, res) => {
  if (typeof req.body.state === 'boolean') {
    toggleState = req.body.state;
    res.json({ success: true, state: toggleState });
  } else {
    res.status(400).json({ success: false, message: 'Invalid state value' });
  }
});

let toggleAttendance = true; // in-memory toggle state
router.get('/toggle-attendance', (req, res) => {
  res.json({ state: toggleAttendance });
});

// Update toggle state
router.post('/toggle-attendance', (req, res) => {
  if (typeof req.body.state === 'boolean') {
    toggleAttendance = req.body.state;
    res.json({ success: true, state: toggleAttendance });
  } else {
    res.status(400).json({ success: false, message: 'Not allowed to enter attendance' });
  }
});
module.exports = { router, getToggleState: () => toggleState, getToggleAttendance: () => toggleAttendance };
