const mongoose = require('mongoose');

const listeningHistorySchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  song_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Song', required: true },
  
  action_type: { type: String, enum: ['listen', 'skip', 'complete', 'repeat', 'seek'], required: true },
  
  duration_listened: { type: Number, default: 0 }, 
  context: { type: String, default: 'playlist' }, 
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ListeningHistory', listeningHistorySchema);