const express = require('express');
const cors = require('cors');
const attendanceRoutes = require('./routes/attendance');

const app = express();
const PORT = process.env.PORT || 5000;
const IP_ADDRESS = process.env.LOCAL_IP ;
const corsOptions = {
  origin: function (origin, callback) {
    if (origin && 
      /^http:\/\/10\.42\.\d{1,3}\.\d{1,3}:5173$/.test(origin) ||
      origin === `http://${IP_ADDRESS}:5173` ||
      origin === `http://${IP_ADDRESS}:5000` ||

      origin === 'http://localhost:5173' ||
      origin === 'http://127.0.0.1:5173') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST'],
  credentials: true
};
// app.use(cors(corsOptions));


app.use(cors());
app.use(express.json());
app.use('/api/attendance', attendanceRoutes);

app.get('/', (req, res) => {
  res.send('Attendance API Running');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('Server running on port 5000');
});
