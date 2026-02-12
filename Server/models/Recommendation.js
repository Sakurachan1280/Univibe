const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    daily_mix: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }],
    discovery: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }],
    similar_artists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Artist' }]
}, {
    timestamps: { createdAt: false, updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Recommendation', recommendationSchema);
