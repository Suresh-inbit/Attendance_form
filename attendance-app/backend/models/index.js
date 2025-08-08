const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
require('dotenv').config();

// SQLite database stored in a file
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'attendance.sqlite'),
});

const Attendance = sequelize.define('Attendance', {
 
  rollNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      is: /^[a-zA-Z0-9]+$/, // Alphanumeric roll numbers
      notEmpty: true,
    } 
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  optionalField: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // optionalField2: {
  //   type: DataTypes.STRING,
  //   allowNull: true,
  // },
  attendanceDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  timestamp: {
    type: DataTypes.TIME,
    defaultValue: DataTypes.NOW
  },
  ipAddress: {
    type: DataTypes.STRING,
    defaultValue: '0.0.0.0',
    allowNull: true,
  }
  
},
{
  indexes: [
    {
      unique: true,
      fields: ['rollNumber', 'attendanceDate']
    }
  ]
});

sequelize.sync(); // Ensures table is created

module.exports = { sequelize, Attendance };
