const Story = require('../models/Story');
const Friendship = require('../models/Friendship');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const chatService = require('./chatService'); 

// Đăng Story
const createStory = async (userId, fileUrl, songId, startTime) => {
  return await Story.create({
    user_id: userId,
    media_url: fileUrl,
    background_music_id: songId || null,
    music_start_time: startTime || 0
  });
};

// Lấy Feed Story (Của mình + Bạn bè)
const getStoryFeed = async (userId) => {
  const friendships = await Friendship.find({
    $or: [{ requester_id: userId }, { recipient_id: userId }],
    status: 'accepted'
  });

  const friendIds = friendships.map(f => 
    f.requester_id.toString() === userId ? f.recipient_id : f.requester_id
  );

  friendIds.push(userId);

  const stories = await Story.find({
    user_id: { $in: friendIds },
    expires_at: { $gt: new Date() }
  })
  .populate('user_id', 'username profile.display_name profile.avatar_url')
  .populate('background_music_id', 'title cover_image file_url')
  .sort({ created_at: -1 }); 

  return stories;
};

// Xem Story (Đánh dấu đã xem)
const viewStory = async (userId, storyId) => {
  return await Story.findByIdAndUpdate(
    storyId,
    { $addToSet: { viewers: userId } }, 
    { new: true }
  );
};

// Thả tim / Bỏ tim
const toggleLikeStory = async (userId, storyId) => {
  const story = await Story.findById(storyId);
  if (!story) throw new Error('Story not found');

  const isLiked = story.likes.includes(userId);
  if (isLiked) {
    story.likes.pull(userId); // Bỏ like
  } else {
    story.likes.push(userId); // Like
  }
  await story.save();
  return { isLiked: !isLiked, likesCount: story.likes.length };
};

// Reply Story (Gửi tin nhắn kèm trích dẫn Story)
const replyStory = async (senderId, storyId, content) => {
  const story = await Story.findById(storyId);
  if (!story) throw new Error('Story not found');

  const conversation = await chatService.getOrCreateConversation(senderId, story.user_id);

  const message = await Message.create({
    conversation_id: conversation._id,
    sender_id: senderId,
    type: 'text', 
    content: `Phản hồi story: ${content || '❤️'}`, 
  });

  conversation.last_message = {
    content: `Phản hồi story`,
    sender_id: senderId,
    created_at: new Date(),
    is_read: false
  };
  await conversation.save();

  return message;
};

module.exports = {
  createStory,
  getStoryFeed,
  viewStory,
  toggleLikeStory,
  replyStory
};