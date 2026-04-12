const Room = require('../models/Room');

// Tạo phòng mới
const createRoom = async (userId, roomName, initialSong) => {
  let songData = {};
  if (initialSong) {
    songData = {
      song_id: initialSong._id,
      title: initialSong.title,
      cover_url: initialSong.cover_image,
      file_url: initialSong.file_url,
      artist: initialSong.artist_ids[0]?.name || 'Unknown'
    };
  }

  const room = await Room.create({
    name: roomName,
    host_id: userId,
    participants: [userId], 
    current_song: songData
  });
  
  return room;
};

// Lấy thông tin phòng (kèm populate host và participants)
const getRoom = async (roomId) => {
  return await Room.findById(roomId)
    .populate('host_id', 'username profile.avatar_url')
    .populate('participants', 'username profile.avatar_url');
};

// Đóng phòng (Khi chủ thoát)
const closeRoom = async (roomId, userId) => {
  return await Room.findOneAndDelete({ _id: roomId, host_id: userId });
};

module.exports = { createRoom, getRoom, closeRoom };