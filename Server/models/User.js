const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String },
  phone: { type: String },
  auth_provider: { 
    type: String, 
    enum: ['local', 'google', 'facebook', 'phone'], 
    default: 'local' 
  },
  fcm_token: { type: String, default: '' },
  favorites_playlist_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Playlist' },
  
  profile: {
    display_name: { type: String, default: '' },
    avatar_url: { type: String, default: '' },
    cover_url: { type: String, default: '' },
    bio: { type: String, default: '' },
    dob: { type: Date },
    genres_interest: [{ type: String }],
    social_links: {
      instagram: { type: String, default: '' },
      spotify: { type: String, default: '' },
      facebook: { type: String, default: '' }
    }
  },
  
  settings: {
    language: { type: String, default: 'vi' },
    theme: { type: String, enum: ['dark', 'light'], default: 'dark' }, 
    notifications_enabled: { type: Boolean, default: true }
  },
  
  status: {
    is_online: { type: Boolean, default: false },
    last_active: { type: Date, default: Date.now },
    is_banned: { type: Boolean, default: false }
  },
  
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { 
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } 
});

module.exports = mongoose.model('User', userSchema);