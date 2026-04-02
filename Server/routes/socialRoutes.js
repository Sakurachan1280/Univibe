const express = require('express');
const router = express.Router();
const socialController = require('../controllers/socialController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect); // Yêu cầu đăng nhập

// 1. Tìm kiếm người dùng (chỉ role: user)
router.get('/search', socialController.search);

// 2. Trang cá nhân người khác (Public info)
router.get('/profile/:id', socialController.getUserProfile);

// 3. Gửi lời mời kết bạn
router.post('/request', socialController.sendRequest); 

// 4. Xem danh sách lời mời kết bạn (để chấp nhận)
router.get('/requests/pending', socialController.getPending);

// 5. Phản hồi lời mời (Accept/Reject)
router.post('/request/respond', socialController.respondRequest); 

// 6. Hủy kết bạn / Block / Hủy lời mời
router.post('/relation/modify', socialController.modifyRelation); 

// 7. Lấy danh sách bạn bè
router.get('/friends', socialController.getFriends);

// 8. Lấy trạng thái quan hệ với 1 người
router.get('/status/:targetUserId', socialController.getFriendshipStatus);

module.exports = router;