const User = require('../models/User');

const onlineUsers = new Map();

const socketHandler = (io) => {
  console.log('>> [SOCKET] Service sẵn sàng!');
  io.on('connection', (socket) => {
    console.log('>> [SOCKET] Có kết nối mới:', socket.id);
    
    socket.on('user_connected', async (userId) => {
      onlineUsers.set(userId, socket.id);
      socket.userId = userId;
      await User.findByIdAndUpdate(userId, { 
        'status.is_online': true,
        'status.last_active': new Date()
      });

      io.emit('user_status_change', { userId, status: 'online' });
      console.log(`User ${userId} is Online`);
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