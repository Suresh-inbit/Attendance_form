const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const attendanceRoutes = require('./routes/attendance');
const { router: toggleRoutes } = require('./routes/toggle');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
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
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
  });
