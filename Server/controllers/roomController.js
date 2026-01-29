const roomService = require('../services/roomService');
const Song = require('../models/Song');
const User = require('../models/User');

const create = async (req, res) => {
  try {
    const { name, songId } = req.body;
    
    let song = null;
    if (songId) {
      song = await Song.findById(songId).populate('artist_ids');
    }

    const room = await roomService.createRoom(req.user.id, name, song);
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getDetail = async (req, res) => {
  try {
    const room = await roomService.getRoom(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// API Mời bạn bè
const inviteFriend = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { friendId } = req.body; 

    const friend = await User.findById(friendId);
    if (!friend) return res.status(404).json({ message: "User not found" });

    req.io.to(friendId).emit('notification', {
      type: 'room_invite',
      content: `${req.user.username} mời bạn nghe nhạc cùng!`,
      roomId: roomId,
      inviter: {
        username: req.user.username,
        avatar: req.user.profile.avatar_url
      }
    });

    res.json({ message: `Invitation sent to ${friend.username}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
module.exports = { create, getDetail, inviteFriend };