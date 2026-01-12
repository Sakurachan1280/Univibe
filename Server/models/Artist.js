const mongoose = require('mongoose');

const artistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  bio: { type: String, default: '' },
  avatar: { type: String, default: '' },
  followers_count: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Artist', artistSchema);