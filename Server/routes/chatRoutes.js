const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.use(protect);

// Tạo phòng 1-1
router.post('/start', chatController.startChat);

// Gửi tin nhắn (Text / Music Card / Image)
router.post('/send', 
  upload.fields([{ name: 'image', maxCount: 1 }]), 
  chatController.send
); 

// Lấy danh sách tin nhắn của 1 phòng
router.get('/:conversationId/messages', chatController.getHistory);

// Lấy danh sách các cuộc trò chuyện
router.get('/conversations', chatController.getConversations);

// Thu hồi tin nhắn
router.put('/messages/:messageId/revoke', chatController.revoke);

// Đánh dấu đã xem
router.put('/:conversationId/read', chatController.markRead);

// Chỉnh sửa tin nhắn
router.put('/messages/:messageId/edit', chatController.editMsg);

// Xóa tin nhắn
router.delete('/messages/:messageId', chatController.deleteMsg);

module.exports = router;