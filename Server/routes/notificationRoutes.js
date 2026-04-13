const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  getNotifications,
  markConversationRead,
  respondFriendNotif,
  markAlbumRead,
} = require('../controllers/notificationController');

router.use(protect);

// Lấy danh sách thông báo tổng hợp
router.get('/', getNotifications);

// Đánh dấu đã đọc conversation
router.put('/read-messages/:conversationId', markConversationRead);

// Phản hồi lời mời kết bạn (accept/reject)
router.put('/read-friend/:friendshipId', respondFriendNotif);

// Đánh dấu đã xem thông báo album (xoá khỏi list)
router.put('/read-album/:albumId', markAlbumRead);

module.exports = router;
