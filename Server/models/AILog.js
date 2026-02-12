const mongoose = require('mongoose');

const aiLogSchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    log_level: { type: String, enum: ['info', 'warning', 'error'], default: 'info' },
    message: { type: String, required: true },
    affected_users_count: { type: Number, default: 0 },
    module: { type: String, required: true }
});

module.exports = mongoose.model('AILog', aiLogSchema);
