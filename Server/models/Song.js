const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Artist' }],
  album_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Album' }, 
  duration: { type: Number, required: true }, 
  file_url: { type: String, required: true }, 
  cover_image: { type: String, default: '' },
  
  embedding_vector: { type: [Number], select: false }, 
  
  lyrics: [{
    time: Number, 
    text: String
  }],
  
  genres: [{ type: String }],
  
  stats: {
    play_count: { type: Number, default: 0 },
    like_count: { type: Number, default: 0 }
  }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('Song', songSchema);