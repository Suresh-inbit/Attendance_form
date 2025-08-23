const mongoose = require('mongoose');

const AppStateSchema = new mongoose.Schema({
    identifier: {
        type: String,
        required: true,
        unique: true,
        default: 'global'
    },
    toggleInput: {
        type: Boolean,
        default: false
    },
    toggleAttendance: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('AppState', AppStateSchema);
