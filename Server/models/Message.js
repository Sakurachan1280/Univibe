const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversation_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  sender_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ['text', 'image', 'music_card', 'sticker'], 
    default: 'text' 
  },
  content: { type: String }, 
  music_card_data: { 
    song_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Song' },
    song_title: String,
    artist_name: String,
    artist_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist' },
    cover_url: String,
    preview_url: String
  },
  
  read_by: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], 
  is_revoked: { type: Boolean, default: false },
  is_edited: { type: Boolean, default: false }
}, { 
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } 
});

module.exports = mongoose.model('Message', messageSchema);