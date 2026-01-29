const storyService = require('../services/storyService');
const Story = require('../models/Story');
const Friendship = require('../models/Friendship');
// Đăng Story
const create = async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({ message: "Image is required" });
    }
    const imageUrl = `/uploads/${req.files.image[0].filename}`;
    const { songId, startTime } = req.body;

    const story = await storyService.createStory(req.user.id, imageUrl, songId, startTime);
    const friendships = await Friendship.find({
      $or: [{ requester_id: req.user.id }, { recipient_id: req.user.id }],
      status: 'accepted'
    });
    
    const friendIds = friendships.map(f => 
      f.requester_id.toString() === req.user.id ? f.recipient_id.toString() : f.requester_id.toString()
    );

    friendIds.forEach(friendId => {
      req.io.to(friendId).emit('new_story_posted', {
        userId: req.user.id,
        username: req.user.username,
        avatar: req.user.profile.avatar_url,
        storyId: story._id
      });
    });

    res.status(201).json(story);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy danh sách Story
const getFeed = async (req, res) => {
  try {
    const stories = await storyService.getStoryFeed(req.user.id);
    res.json(stories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Đánh dấu đã xem
const view = async (req, res) => {
  try {
    await storyService.viewStory(req.user.id, req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Thả tim
const like = async (req, res) => {
  try {
    const result = await storyService.toggleLikeStory(req.user.id, req.params.id);
    const story = await Story.findById(req.params.id);
    
    if (story && story.user_id.toString() !== req.user.id) {
        req.io.to(story.user_id.toString()).emit('notification', {
            type: 'story_like',
            content: `${req.user.username} đã thả tim story của bạn`,
            user: {
                _id: req.user._id,
                username: req.user.username,
                avatar: req.user.profile.avatar_url
            },
            storyId: story._id
        });
    }

    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Reply Story -> Bắn tin nhắn chat
const reply = async (req, res) => {
  try {
    const { content } = req.body;
    const message = await storyService.replyStory(req.user.id, req.params.id, content);
    req.io.to(message.conversation_id.toString()).emit('receive_message', message);

    res.json(message);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { create, getFeed, view, like, reply };