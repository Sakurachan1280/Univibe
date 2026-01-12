const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  type: { type: String, enum: ['private', 'group'], default: 'private' },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  group_name: { type: String },
  group_avatar: { type: String },
  last_message: { 
    content: String,
    sender_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    created_at: Date,
    is_read: { type: Boolean, default: false }
  }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('Conversation', conversationSchema);