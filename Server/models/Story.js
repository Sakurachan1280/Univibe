const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  media_url: { type: String, required: true },
  
  background_music_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Song' },
  music_start_time: { type: Number, default: 0 }, 
  
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  created_at: { type: Date, default: Date.now },
  expires_at: { type: Date, default: () => new Date(+new Date() + 24*60*60*1000) } 
});

storySchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Story', storySchema);