const chatService = require('../services/chatService');

const startChat = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const conversation = await chatService.getOrCreateConversation(req.user.id, receiverId);
    res.json(conversation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const send = async (req, res) => {
  try {
    const { conversationId, type, content, songId } = req.body;
    let finalContent = content;
    let finalType = type || 'text';

    if (req.files && req.files.image) {
      finalContent = req.files.image[0].path;   // Cloudinary secure URL
      finalType = 'image';
    }

    const message = await chatService.sendMessage(req.user.id, {
      conversationId,
      type: finalType,
      content: finalContent,
      songId
    });
    
    const populatedMessage = await message.populate('sender_id', 'username profile.avatar_url profile.display_name');
    
    req.io.in(conversationId).emit('new_message', populatedMessage);

    // Notify tất cả participants để cập nhật conversation list (realtime)
    const conversation = await require('../models/Conversation').findById(conversationId).select('participants');
    if (conversation) {
      const preview = {
        conversationId,
        lastMessage: {
          content: populatedMessage.content,
          type: populatedMessage.type,
          created_at: populatedMessage.created_at,
          sender_id: populatedMessage.sender_id,
        },
      };
      conversation.participants.forEach(participantId => {
        req.io.to(participantId.toString()).emit('conversation_updated', preview);
      });
    }
    
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getHistory = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit, beforeId } = req.query;
    const messages = await chatService.getMessages(conversationId, parseInt(limit), beforeId);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getConversations = async (req, res) => {
  try {
    const list = await chatService.getUserConversations(req.user.id);
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const revoke = async (req, res) => {
  try {
    const result = await chatService.revokeMessage(req.user.id, req.params.messageId);
    
    req.io.in(result.conversation_id.toString()).emit('message_revoked', { messageId: req.params.messageId });
    
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


const markRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    await chatService.markAsRead(req.user.id, conversationId);
    
    req.io.in(conversationId).emit('message_read', {
      conversationId,
      userId: req.user.id, 
      time: new Date()
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const editMsg = async (req, res) => {
  try {
    const { content } = req.body;
    const result = await chatService.editMessage(req.user.id, req.params.messageId, content);
    req.io.in(result.conversation_id.toString()).emit('message_edited', {
      messageId: result._id,
      content: result.content,
      is_edited: true,
    });
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteMsg = async (req, res) => {
  try {
    const result = await chatService.deleteMessage(req.user.id, req.params.messageId);
    req.io.in(result.conversation_id.toString()).emit('message_deleted', {
      messageId: result.messageId,
    });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { startChat, send, getHistory, getConversations, revoke, markRead, editMsg, deleteMsg };