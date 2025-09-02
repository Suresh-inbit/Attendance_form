const express = require('express');
const router = express.Router();
const AppState = require('../models/appState');

// Middleware to ensure a single AppState document exists and attach it to the request
const ensureAppState = async (req, res, next) => {
    try {
        let appState = await AppState.findOne({ identifier: 'global' });
        if (!appState) {
            // If no document exists, create one with default values
            appState = new AppState({
                identifier: 'global',
                toggleInput: false,
                toggleAttendance: true
            });
            await appState.save();
        }
        // Attach the document to the request object
        req.appState = appState;
        next();
    } catch (error) {
        console.error('Error ensuring AppState exists:', error);
        res.status(500).json({ success: false, message: 'Server error while ensuring app state.' });
    }
};

// Apply the middleware to all routes in this router
router.use(ensureAppState);

// Get toggle state for input
router.get('/input', (req, res) => {
  res.json({ state: req.appState.toggleInput });
});

// Update toggle state for input
router.post('/input', async (req, res) => {
  if (typeof req.body.state === 'boolean') {
    try {
        req.appState.toggleInput = req.body.state;
        await req.appState.save();
        res.json({ success: true, state: req.appState.toggleInput });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update state' });
    }
  } else {
    res.status(400).json({ success: false, message: 'Invalid state value' });
  }
});

// Get toggle state for attendance
router.get('/attendance', (req, res) => {
  res.json({ state: req.appState.toggleAttendance });
});

// Update toggle state for attendance
router.post('/attendance', async (req, res) => {
  if (typeof req.body.state === 'boolean') {
    try {
        req.appState.toggleAttendance = req.body.state;
        await req.appState.save();
        res.json({ success: true, state: req.appState.toggleAttendance });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update state' });
    }
  } else {
    res.status(400).json({ success: false, message: 'Not allowed to enter attendance' });
  }
});

module.exports = { router };
