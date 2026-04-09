const socialService = require('../services/socialService');

const search = async (req, res) => {
  try {
    const { keyword } = req.query;
    if (!keyword) return res.status(400).json({ message: "Keyword is required" });
    const users = await socialService.searchUsers(keyword, req.user.id);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const sendRequest = async (req, res) => {
  try {
    const { recipientId } = req.body;
    const result = await socialService.sendFriendRequest(req.user.id, recipientId);

    // Thông báo realtime cho người nhận
    req.io.to(recipientId).emit('new_notification', { type: 'friend_request' });

    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const respondRequest = async (req, res) => {
  try {
    const { requestId, action } = req.body; 
    if (!['accept', 'reject'].includes(action)) throw new Error("Invalid action");
    
    const result = await socialService.respondToRequest(req.user.id, requestId, action);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const modifyRelation = async (req, res) => {
  try {
    const { targetUserId, action } = req.body; 
    const result = await socialService.modifyRelation(req.user.id, targetUserId, action);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const result = await socialService.getUserProfile(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

const getPending = async (req, res) => {
  try {
    const list = await socialService.getPendingRequests(req.user.id);
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getFriends = async (req, res) => {
  try {
    const friends = await socialService.getFriends(req.user.id);
    res.json(friends);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getFriendshipStatus = async (req, res) => {
  try {
    const { targetUserId } = req.params;
    const result = await socialService.getFriendshipStatus(req.user.id, targetUserId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  search,
  sendRequest,
  respondRequest,
  modifyRelation,
  getUserProfile,
  getPending,
  getFriends,
  getFriendshipStatus
};