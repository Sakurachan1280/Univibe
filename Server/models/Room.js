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

  settings: {
    guest_can_control: { type: Boolean, default: true },
  },

  /** Hàng đợi bài hát (append khi thành viên add_to_queue) */
  queue: [
    {
      song_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Song' },
      title: String,
      cover_image: String,
      file_url: String,
      artist_ids: [{ _id: String, name: String }],
    },
  ],

  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Room', roomSchema);