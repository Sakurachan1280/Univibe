const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, default: '' },
  cover_image: { type: String, default: '' },
  is_public: { type: Boolean, default: true }, 
  type: { 
    type: String, 
    enum: ['user_created', 'system_mix', 'mood'], 
    default: 'user_created' 
  },
  artist_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist', default: null },
  tags: [{ type: String }],
  tracks: [{
    song_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Song' },
    added_at: { type: Date, default: Date.now }
  }]
}, { 
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } 
});

module.exports = mongoose.model('Playlist', playlistSchema);