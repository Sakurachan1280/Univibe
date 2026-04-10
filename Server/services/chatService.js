const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Song = require('../models/Song');
const User = require('../models/User');

const getOrCreateConversation = async (senderId, receiverId) => {
  let conversation = await Conversation.findOne({
    type: 'private',
    participants: { $all: [senderId, receiverId] }
  });

  if (!conversation) {
    conversation = await Conversation.create({
      type: 'private',
      participants: [senderId, receiverId],
      updated_at: new Date()
    });
  }
  return conversation;
};

const sendMessage = async (senderId, data) => {
  const { conversationId, type, content, songId } = data;

  let messageData = {
    conversation_id: conversationId,
    sender_id: senderId,
    type: type,
    content: content || '',
    read_by: [senderId] 
  };

  if (type === 'music_card' && songId) {
    const song = await Song.findById(songId).populate('artist_ids');
    if (!song) throw new Error('Song not found');

    messageData.music_card_data = {
      song_id: song._id,
      song_title: song.title,
      artist_name: song.artist_ids.map(a => a.name).join(', '),
      artist_id: song.artist_ids.length > 0 ? song.artist_ids[0]._id : null,
      cover_url: song.cover_image,
      preview_url: song.file_url
    };
  }

  const message = await Message.create(messageData);

  await Conversation.findByIdAndUpdate(conversationId, {
    last_message: {
      content: type === 'text' ? content : `Sent a ${type}`,
      sender_id: senderId,
      created_at: new Date(),
      is_read: false
    },
    updated_at: new Date()
  });

  return message;
};

const getMessages = async (conversationId, limit = 50, beforeId) => {
  const query = { conversation_id: conversationId };
  if (beforeId) {
    query._id = { $lt: beforeId };
  }

  return await Message.find(query)
    .sort({ created_at: -1 }) 
    .limit(limit)
    .populate('sender_id', 'username profile.avatar_url profile.display_name');
};

const getUserConversations = async (userId) => {
  const conversations = await Conversation.find({ participants: userId })
    .sort({ updated_at: -1 })
    .populate('participants', 'username profile.display_name profile.avatar_url status.is_online')
    .populate('last_message.sender_id', 'username');

  // Lọc ra người còn lại (không phải mình) trong mỗi conversation
  return conversations.map(conv => {
    const convObj = conv.toObject();
    const userIdStr = String(userId);
    convObj.otherParticipants = convObj.participants.filter(
      p => String(p._id) !== userIdStr
    );
    return convObj;
  });
};

const revokeMessage = async (userId, messageId) => {
  const message = await Message.findOne({ _id: messageId, sender_id: userId });
  if (!message) throw new Error('Message not found or permission denied');

  message.is_revoked = true;
  await message.save();
  return message;
};

const markAsRead = async (userId, conversationId) => {

  await Message.updateMany(
    { conversation_id: conversationId, read_by: { $ne: userId } },
    { $addToSet: { read_by: userId } }
  );
  return { success: true };
};

const editMessage = async (userId, messageId, newContent) => {
  const message = await Message.findOne({ _id: messageId, sender_id: userId, type: 'text' });
  if (!message) throw new Error('Message not found or permission denied');
  if (message.is_revoked) throw new Error('Cannot edit a revoked message');

  message.content = newContent;
  message.is_edited = true;
  await message.save();
  return message;
};

const deleteMessage = async (userId, messageId) => {
  const message = await Message.findOne({ _id: messageId, sender_id: userId });
  if (!message) throw new Error('Message not found or permission denied');
  await message.deleteOne();
  return { messageId, conversation_id: message.conversation_id };
};

module.exports = {
  getOrCreateConversation,
  sendMessage,
  getMessages,
  getUserConversations,
  revokeMessage,
  markAsRead,
  editMessage,
  deleteMessage,
};