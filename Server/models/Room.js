const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  host_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], 
  
  current_song: {
    song_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Song' },
    title: String,
    cover_url: String,
    file_url: String,
    artist: String
  },
  
  playback_state: { 
    status: { type: String, enum: ['playing', 'paused'], default: 'paused' },
    current_time: { type: Number, default: 0 }, 
    updated_at: { type: Date, default: Date.now } 
  },

  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Room', roomSchema);