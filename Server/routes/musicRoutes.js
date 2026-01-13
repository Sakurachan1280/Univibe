const express = require('express');
const router = express.Router();
const musicController = require('../controllers/musicController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

//(Cần tạo dữ liệu trước)
// 1. Tạo Nghệ sĩ
router.post('/artists', 
  protect, // Yêu cầu đăng nhập
  upload.fields([{ name: 'avatar', maxCount: 1 }]), 
  musicController.createArtist
);

// 2. Upload Bài hát (Core)
router.post('/songs', 
  protect, 
  upload.fields([
    { name: 'audio', maxCount: 1 }, 
    { name: 'cover', maxCount: 1 }
  ]), 
  musicController.createSong
);

// 3. Load bài hát để phát (Play)
router.get('/songs/:id', musicController.playSong);

// 4. Lấy danh sách bài hát (Hỗ trợ Next, Previous, Shuffle)
router.get('/queue', musicController.getQueue);

// 5. Ghi nhận hành động (Pause, Seek, Complete, Skip)
router.post('/log', protect, musicController.logAction);

module.exports = router;