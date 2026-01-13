const express = require('express');
const router = express.Router();
const socialController = require('../controllers/socialController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect); // Yêu cầu đăng nhập

// 1. Tìm kiếm người dùng
router.get('/search', socialController.search);

// 2. Trang cá nhân người khác (Public info)
router.get('/profile/:id', socialController.getUserProfile);

// 3. Gửi lời mời kết bạn
router.post('/request', socialController.sendRequest); 

// 4. Xem danh sách lời mời kết bạn (để chấp nhận)
router.get('/requests/pending', socialController.getPending);

// 5. Phản hồi lời mời (Accept/Reject)
router.post('/request/respond', socialController.respondRequest); 

// 6. Hủy kết bạn hoặc Block
router.post('/relation/modify', socialController.modifyRelation); 

module.exports = router;