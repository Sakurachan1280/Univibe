const express = require('express');
const router = express.Router();
const musicController = require('../controllers/musicController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

//(Cần tạo dữ liệu trước)
// 0. Lấy danh sách Nghệ sĩ
router.get('/artists', musicController.getArtists);

// 0a. Lấy nghệ sĩ theo ID
router.get('/artists/:id', musicController.getArtistById);

// 0b. Lấy bài hát theo nghệ sĩ
router.get('/artists/:id/songs', musicController.getSongsByArtist);

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

// 3. Tìm kiếm bài hát (MUST be before /songs/:id)
router.get('/songs/search', musicController.searchSongs);

// 3a. Lấy danh sách bài hát ngẫu nhiên
router.get('/songs/random', musicController.getRandomSongs);

// 3b. Lấy TẤT CẢ bài hát (admin, không giới hạn)
router.get('/songs/all', musicController.getAllSongs);

// 3c. Lấy bài hát theo thể loại (?genre=pop)
router.get('/songs/genre', musicController.getSongsByGenre);

// 3. Load bài hát để phát (Play) - MUST be after PUT/DELETE
router.get('/songs/:id', musicController.playSong);

// 4. Lấy danh sách bài hát (Hỗ trợ Next, Previous, Shuffle)
router.get('/queue', musicController.getQueue);

// 5. Ghi nhận hành động (Pause, Seek, Complete, Skip)
router.post('/log', protect, musicController.logAction);

module.exports = router;