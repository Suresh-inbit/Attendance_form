const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Attendance = require('../models/index'); // replace with your actual Mongoose model

// MongoDB connection
// const MONGO_URI = "mongodb://127.0.0.1:27017/attendance_db"; // change URI if using Atlas
mongoose.connect(process.env.MONGO_URI ,{
  dbName: 'Attendance',
})
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Helper functions
function getTodayDate() {
  const today = new Date();
  const formatted = today.toISOString().split('T')[0]; // YYYY-MM-DD
  return formatted;
}

function getCurrentTime() {
  return new Date().toTimeString().split(' ')[0]; // HH:MM:SS
}

// Load JSON data
const filePath = path.join(__dirname, '../load.json');
let data;

try {
  const raw = fs.readFileSync(filePath);
  data = JSON.parse(raw);
} catch (err) {
  console.error('❌ Failed to read or parse data file:', err);
  process.exit(1);
}

// Seed function
(async () => {
  try {
    const today = getTodayDate();
    const now = getCurrentTime();

    for (const entry of data) {
      try {
          const newEntry = new Attendance({
          ...entry,
          attendanceDate: today,
          timestamp: now,
        });

        await newEntry.save();
        // res.status(200).json({ success: true, message: 'Attendance added.' });
        console.log(`✔️ Inserted: ${entry.rollNumber}`);
      } catch (err) {
        if (err.code === 11000) { // Mongo duplicate key error
          console.warn(`⚠️ Skipped duplicate: ${entry.rollNumber}`);
        } else {
          console.error(`❌ Error inserting ${entry.rollNumber}:`, err.message);
        }
      }
    }

    console.log('\n✅ All data inserted!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Mongo error:', err);
    process.exit(1);
  }
})();


// const fs = require('fs');
// const path = require('path');
// const { Attendance, sequelize } = require('../models/index'); // replace with actual path

// // Helper functions
// function getTodayDate() {
//     const tomorrow = new Date();
// tomorrow.setDate(tomorrow.getDate() + 1 );
// const formatted = tomorrow.toISOString().split('T')[0];
//   return formatted; // 'YYYY-MM-DD'
// }

// function getCurrentTime() {
//   return new Date().toTimeString().split(' ')[0];
// }

// // Load JSON data
// const filePath = path.join(__dirname, '../load.json');
// let data;

// try {
//   const raw = fs.readFileSync(filePath);
//   data = JSON.parse(raw);
// } catch (err) {
//   console.error('❌ Failed to read or parse data file:', err);
//   process.exit(1);
// }

// // Seed function
// (async () => {
//   try {
//     await sequelize.sync();

//     const today = getTodayDate();
//     const now = getCurrentTime();

//     for (const entry of data) {
//       try {
//         await Attendance.create({
//           ...entry,
//           attendanceDate: today,
//           timestamp: now
//         });
//         console.log(`✔️ Inserted: ${entry.rollNumber}`);
//       } catch (err) {
//         if (err.name === 'SequelizeUniqueConstraintError') {
//           console.warn(`⚠️ Skipped duplicate: ${entry.rollNumber}`);
//         } else {
//           console.error(`❌ Error inserting ${entry.rollNumber}:`, err.message);
//         }
//       }
//     }

//     console.log('\n✅ All data inserted!');
//     process.exit(0);
//   } catch (err) {
//     console.error('❌ Sequelize error:', err);
//     process.exit(1);
//   }
// })();
