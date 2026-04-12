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

      // Báo cho tất cả biết user này online
      io.emit('user_status_change', { userId, status: 'online' });

      // Gửi snapshot danh sách online hiện tại cho chính client vừa kết nối
      const onlineUserIds = Array.from(onlineUsers.keys());
      socket.emit('online_users_list', onlineUserIds);

      console.log(`User ${userId} is Online. Total online: ${onlineUsers.size}`);
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
        playbackState: room.playback_state,
        queue: room.queue || [],
        settings: room.settings || { guest_can_control: true },
      });
    });

    // RỜI PHÒNG (khách tự thoát)
    socket.on('leave_music_room', async ({ roomId, userId }) => {
      socket.leave(roomId);
      await Room.findByIdAndUpdate(roomId, { $pull: { participants: userId } });
      io.to(roomId).emit('room_participant_left', { userId });
    });

    // KẾT THÚC PHÒNG (host kết thúc → thông báo cho tất cả thành viên)
    socket.on('end_jam_room', async ({ roomId, userId }) => {
      try {
        // Thông báo cho TOÀN BỘ phòng (kể cả host) trước khi đóng
        io.to(roomId).emit('jam_room_ended', { roomId });
        // Cập nhật DB: dừng phát và xóa queue
        await Room.findByIdAndUpdate(roomId, {
          $set: {
            'playback_state.status': 'stopped',
            queue: [],
            participants: [],
          },
        });
        console.log(`[Room ${roomId}] ended by host ${userId}`);
      } catch (err) {
        console.error('[socket] end_jam_room error:', err);
      }
    });

    // ĐỒNG BỘ NHẠC
    socket.on('music_action', async (data) => {
      const { roomId, action, currentTime, songInfo } = data;

      // ── add_to_queue: append vào room.queue ──────────────────────────────
      if (action === 'add_to_queue' && songInfo) {
        await Room.findByIdAndUpdate(roomId, {
          $addToSet: { queue: songInfo },
        });
        // Thông báo cho cả phòng (kể cả người gửi)
        io.to(roomId).emit('queue_updated', { songInfo });
        console.log(`[Room ${roomId}] queue appended: ${songInfo.title}`);
        return;
      }

      // ── play / pause / seek / next ───────────────────────────────────────
      const updateData = {
        'playback_state.current_time': currentTime ?? 0,
        'playback_state.updated_at': new Date(),
      };

      if (action === 'play')  updateData['playback_state.status'] = 'playing';
      if (action === 'pause') updateData['playback_state.status'] = 'paused';
      if (songInfo)           updateData['current_song'] = songInfo;

      await Room.findByIdAndUpdate(roomId, updateData);

      socket.to(roomId).emit('music_sync', {
        action,
        currentTime,
        song: songInfo,
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

    // MỜI VÀO JAM
    // Payload: { roomId, inviteeId, hostName, jamName, hostAvatar? }
    socket.on('jam_invite', ({ roomId, inviteeId, hostName, jamName, hostAvatar }) => {
      console.log(`[Jam] ${socket.userId} invited ${inviteeId} to room ${roomId}`);
      // Gửi đến user được mời (họ đã join room theo userId của mình)
      io.to(inviteeId).emit('jam_invite_received', {
        roomId,
        hostName,
        jamName,
        hostAvatar,
      });
    });

    // CẬP NHẬT CÀI ĐẶT PHÒNG (host điều chỉnh quyền khách)
    socket.on('room_update_settings', async ({ roomId, hostId, settings }) => {
      try {
        const updateData = {};
        if (typeof settings.guestCanControl === 'boolean') {
          updateData['settings.guest_can_control'] = settings.guestCanControl;
        }
        if (Object.keys(updateData).length > 0) {
          await Room.findByIdAndUpdate(roomId, updateData);
          // Broadcast cài đặt mới đến tất cả members
          io.to(roomId).emit('room_settings_updated', { settings });
          console.log(`[Room ${roomId}] settings updated by host ${hostId}:`, settings);
        }
      } catch (err) {
        console.error('[room_update_settings] error:', err);
      }
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