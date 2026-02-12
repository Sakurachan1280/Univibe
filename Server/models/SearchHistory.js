const mongoose = require('mongoose');

const searchHistorySchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    keyword: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    is_deleted: { type: Boolean, default: false }
});

module.exports = mongoose.model('SearchHistory', searchHistorySchema);
