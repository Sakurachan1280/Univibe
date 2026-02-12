const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true }, // Defines the model type (e.g., 'Song', 'User', 'Playlist')
    target_id: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'type' },
    description: { type: String, required: true },
    status: {
        type: String,
        enum: ['pending', 'resolved', 'rejected'],
        default: 'pending'
    },
    admin_note: { type: String, default: '' }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: false }
});

module.exports = mongoose.model('Report', reportSchema);
