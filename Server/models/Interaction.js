const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  target_id: { type: mongoose.Schema.Types.ObjectId, required: true }, 
  target_type: { type: String, enum: ['song', 'artist', 'playlist'], required: true },
  action: { type: String, enum: ['like', 'follow'], required: true },
  timestamp: { type: Date, default: Date.now }
});

interactionSchema.index({ user_id: 1, target_id: 1, action: 1 }, { unique: true });

module.exports = mongoose.model('Interaction', interactionSchema);