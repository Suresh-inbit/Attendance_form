const express = require('express');
const router = express.Router();
const {Attendance, AttendanceCount} = require('../models/index'); 
const os = require('os');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

function isValidRollNumber(rollNumber) {
  return /^[a-zA-Z0-9]+$/.test(rollNumber);
}
function isValidName(name) {
  return /^[A-Za-z ]+$/.test(name);
}
// Google Sheets Setup
const setupGoogleAuth = () => {
  return new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
};

// Function to sync attendance count from Google Sheets
const syncAttendanceFromSheet = async (sheetId, sheetName = 'Attendance') => {
  try {
    const serviceAccountAuth = setupGoogleAuth();
    const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);
    
    await doc.loadInfo();
    const sheet = doc.sheetsByTitle[sheetName] || doc.sheetsByIndex[0];
    const rows = await sheet.getRows();
    
    const results = [];
    
    for (const row of rows) {
      // Adjust column names based on your sheet structure
      const rollNumber = row.get('rollNumber') || row.get('Roll Number') || row.get('RollNumber');
      const count = parseInt(row.get('Absent') || row.get('Attendance Count') || row.get('LeaveCount') || 0);
      
      if (rollNumber && (isValidRollNumber(rollNumber) ||rollNumber === 'TOTAL_COUNT')) {
        try {
          const record = await AttendanceCount.findOneAndUpdate(
            { rollNumber },
            { count },
            { new: true, upsert: true }
          );
          
          results.push({ rollNumber, count: record.count, status: 'updated' });
        } catch (error) {
          results.push({ rollNumber, error: error.message, status: 'failed' });
        }
      }
    }
    console.log(`Sync completed. Total records processed: ${results.length}`);
    return results;
  } catch (error) {
    throw new Error(`Sheet sync failed: ${error.message}`);
  }
};

// GET /api/attendance/leave-count?RollNumber=...
router.get('/leave-count', async (req, res) => {
    try {
        const { rollNumber } = req.query;
        
        if (!rollNumber) {
            return res.status(400).json({ success: false, message: 'Roll Number required' });
        }

        const record = await AttendanceCount.findOne({ rollNumber:rollNumber });
        const totalCountRecord = await AttendanceCount.findOne({ rollNumber: 'TOTAL_COUNT' });

        res.json({ 
            success: true, 
            rollNumber, 
            count: (record && record.count !== undefined && record.count !== null) ? record.count : -1,
            totalCount: (totalCountRecord && totalCountRecord.count !== undefined && totalCountRecord.count !== null) ? totalCountRecord.count : -1,
            
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// POST /api/attendance/sync-from-sheet - Sync attendance count from Google Sheets
router.post('/sync-from-sheet', async (req, res) => {
  try {
    // Use your actual sheet ID and name
    const sheetId = '1Sbo55D_ZvT4Fya0PpTOJxGDTM0Uk-y27UP8c4keUYgw';
    const sheetName = 'Attendance';
    
    const results = await syncAttendanceFromSheet(sheetId, sheetName);
    
    res.json({ 
      success: true, 
      message: 'Sync completed',
      updated: results.filter(r => r.status === 'updated').length,
      failed: results.filter(r => r.status === 'failed').length,
      results 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/attendance/sheet-preview - Preview data from Google Sheets
router.get('/sheet-preview', async (req, res) => {
  try {
    // Use your actual sheet ID and name
    const sheetId = '1Sbo55D_ZvT4Fya0PpTOJxGDTM0Uk-y27UP8c4keUYgw';
    const sheetName = 'Attendance';
    
    const serviceAccountAuth = setupGoogleAuth();
    const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);
    
    await doc.loadInfo();
    const sheet = doc.sheetsByTitle[sheetName] || doc.sheetsByIndex[0];
    const rows = await sheet.getRows();
    
    const preview = rows.slice(0, 10).map(row => ({
      rollNumber: row.get('rollNumber') || row.get('Roll Number') || row.get('RollNumber'),
      count: row.get('count') || row.get('Absent') || row.get('Attendance Count') || row.get('LeaveCount'),
      rawData: row._rawData
    }));
    
    res.json({ 
      success: true, 
      sheetTitle: doc.title,
      sheetName: sheet.title,
      totalRows: rows.length,
      preview 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
// GET /api/attendance/test-sheets - Test Google Sheets connection
router.get('/test-sheets', async (req, res) => {
  try {
    console.log('Testing Google Sheets connection...');
    console.log('Service account email:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
    console.log('Private key exists:', !!process.env.GOOGLE_PRIVATE_KEY);
    
    const serviceAccountAuth = setupGoogleAuth();
    const sheetId = '1Sbo55D_ZvT4Fya0PpTOJxGDTM0Uk-y27UP8c4keUYgw';
    const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);
    
    await doc.loadInfo();
    console.log('Sheet title:', doc.title);
    
    res.json({ 
      success: true, 
      message: 'Connection successful',
      sheetTitle: doc.title,
      sheetCount: doc.sheetCount
    });
  } catch (error) {
    console.error('Google Sheets error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message,
      code: error.code || 'unknown'
    });
  }
});

module.exports =  router ;