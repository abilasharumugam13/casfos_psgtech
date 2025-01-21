const mongoose = require('mongoose');

const DataEntrySchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: String,
    joined: { type: Date, default: () => {
        // Get the current date in UTC
        let date = new Date();
        
        // Convert to IST (UTC+5:30)
        let istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30 hours
        let istDate = new Date(date.getTime() + istOffset);
        
        return istDate;
    } }

});

const DataEntryModel = mongoose.model('dataentrylogin', DataEntrySchema);
module.exports = DataEntryModel;
