const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const attendanceRoutes = require('./routes/attendance');
const { router: toggleRoutes } = require('./routes/toggle');

const app = express();

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
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
  });
  
// Handle 404 - Not Found
app.use((req, res, next) => {
  res.status(404).send("Sorry, can't find that!");
});

// Basic Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Export the app instance for Vercel
module.exports = app;