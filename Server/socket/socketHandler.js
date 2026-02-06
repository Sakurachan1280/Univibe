const User = require('../models/User');
const Room = require('../models/Room');

const onlineUsers = new Map();

const socketHandler = (io) => {
  console.log('>> [SOCKET] Service sẵn sàng!');
  io.on('connection', (socket) => {
    console.log('>> [SOCKET] Có kết nối mới:', socket.id);
    
    socket.on('user_connected', async (userId) => {
      onlineUsers.set(userId, socket.id);
      socket.userId = userId;
      socket.join(userId);
      await User.findByIdAndUpdate(userId, { 
        'status.is_online': true,
        'status.last_active': new Date()
      });

      io.emit('user_status_change', { userId, status: 'online' });
      console.log(`User ${userId} is Online`);
    });

    socket.on('join_music_room', async ({ roomId, userId }) => {
      socket.join(roomId);
      console.log(`User ${userId} joined Music Room: ${roomId}`);

      const room = await Room.findByIdAndUpdate(roomId, 
        { $addToSet: { participants: userId } },
        { new: true }
      );

      const user = await User.findById(userId).select('username profile.avatar_url');
      io.to(roomId).emit('room_participant_joined', user);

      socket.emit('sync_current_state', {
        song: room.current_song,
        playbackState: room.playback_state
      });
    });

    // RỜI PHÒNG
    socket.on('leave_music_room', async ({ roomId, userId }) => {
      socket.leave(roomId);
      await Room.findByIdAndUpdate(roomId, { $pull: { participants: userId } });
      io.to(roomId).emit('room_participant_left', { userId });
    });

    // ĐỒNG BỘ NHẠC
    socket.on('music_action', async (data) => {
      const { roomId, action, currentTime, songInfo } = data;
      
      let updateData = {
        'playback_state.current_time': currentTime,
        'playback_state.updated_at': new Date()
      };

      if (action === 'play') updateData['playback_state.status'] = 'playing';
      if (action === 'pause') updateData['playback_state.status'] = 'paused';
      if (songInfo) updateData['current_song'] = songInfo; // Nếu đổi bài

      await Room.findByIdAndUpdate(roomId, updateData);

      socket.to(roomId).emit('music_sync', {
        action: action, // 'play', 'pause', 'seek', 'next'
        currentTime: currentTime,
        song: songInfo
      });
    });

    // CHAT TRONG PHÒNG
    socket.on('room_chat_message', ({ roomId, userId, content }) => {
       // Phát lại tin nhắn cho cả phòng
       io.to(roomId).emit('room_chat_receive', {
         userId,
         content,
         timestamp: new Date()
       });
    });

    socket.on('join_chat', (room) => {
      socket.join(room);
      console.log(`User joined room: ${room}`);
    });

    socket.on('leave_chat', (room) => {
      socket.leave(room);
    });

    socket.on('typing', ({ room, userId }) => {
      // Gửi cho tất cả người trong phòng TRỪ người gửi
      socket.in(room).emit('typing', { userId, isTyping: true });
    });

    socket.on('stop_typing', ({ room, userId }) => {
      socket.in(room).emit('typing', { userId, isTyping: false });
    });

    socket.on('disconnect', async () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        
        // DB: is_online = false
        await User.findByIdAndUpdate(socket.userId, { 
          'status.is_online': false,
          'status.last_active': new Date()
        });

        // Báo Offline
        io.emit('user_status_change', { userId: socket.userId, status: 'offline' });
        console.log(`User ${socket.userId} disconnected`);
      }
    });
  });
};

module.exports = socketHandler;