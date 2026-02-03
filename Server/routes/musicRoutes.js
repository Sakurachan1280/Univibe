const express = require('express');
const router = express.Router();
const musicController = require('../controllers/musicController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

//(Cần tạo dữ liệu trước)
// 0. Lấy danh sách Nghệ sĩ
router.get('/artists', musicController.getArtists);

// 1. Tạo Nghệ sĩ
router.post('/artists',
  protect, // Yêu cầu đăng nhập
  upload.fields([{ name: 'avatar', maxCount: 1 }]),
  musicController.createArtist
);

// 1a. Cập nhật Nghệ sĩ
router.put('/artists/:id',
  protect,
  upload.fields([{ name: 'avatar', maxCount: 1 }]),
  musicController.updateArtist
);

// 1b. Xóa Nghệ sĩ
router.delete('/artists/:id',
  protect,
  musicController.deleteArtist
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

// 2a. Cập nhật Bài hát
router.put('/songs/:id',
  protect,
  upload.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'cover', maxCount: 1 }
  ]),
  musicController.updateSong
);

// 2b. Xóa Bài hát
router.delete('/songs/:id',
  protect,
  musicController.deleteSong
);

// 3. Load bài hát để phát (Play) - MUST be after PUT/DELETE
router.get('/songs/:id', musicController.playSong);

// 4. Lấy danh sách bài hát (Hỗ trợ Next, Previous, Shuffle)
router.get('/queue', musicController.getQueue);

// 5. Ghi nhận hành động (Pause, Seek, Complete, Skip)
router.post('/log', protect, musicController.logAction);

console.log('✅ Music routes loaded:');
console.log('  - PUT /songs/:id (updateSong)');
console.log('  - DELETE /songs/:id (deleteSong)');
console.log('  - PUT /artists/:id (updateArtist)');
console.log('  - DELETE /artists/:id (deleteArtist)');

module.exports = router;