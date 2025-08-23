const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const attendanceRoutes = require('./routes/attendance');
const { router: toggleRoutes } = require('./routes/toggle');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
// app.use(cors());
app.use(express.json());

// Routes
app.use('/api/attendance', attendanceRoutes);
app.use('/api/toggle', toggleRoutes);

app.get('/', (req, res) => {
  res.send('Attendance API Running');
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  dbName: 'Attendance',
})
  .then(() => {
    console.log('✅ MongoDB connected');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
  });

  app.listen(PORT, () => {
    const interfaces = os.networkInterfaces();
    let ipAddresses = [];
    for (const iface of Object.values(interfaces)) {
      for (const config of iface) {
        if (config.family === 'IPv4' && !config.internal) {
          ipAddresses.push(config.address);
        }
      }
    }
    console.log(`🚀 Server running on:`);
    ipAddresses.forEach(ip => {
      console.log(`   http://${ip}:${PORT}`);
    });
  });
module.exports = app;
