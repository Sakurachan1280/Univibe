const express = require('express');
const router = express.Router();
const playlistController = require('../controllers/playlistController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Tất cả thao tác Playlist đều cần đăng nhập
router.use(protect);

// 1. Tạo & Lấy danh sách
router.post('/', upload.fields([{ name: 'cover_image', maxCount: 1 }]), playlistController.create);
router.get('/', playlistController.getMyPlaylists);

// 2. Thao tác trên Playlist cụ thể (Sửa, Xóa, Xem chi tiết)
router.get('/:id', playlistController.getDetail);
router.put('/:id', playlistController.update); // Đổi tên, Đổi chế độ public/private
router.delete('/:id', playlistController.remove);

// 3. Quản lý bài hát trong Playlist
router.post('/:id/songs', playlistController.addSong);
router.delete('/:id/songs/:songId', playlistController.removeSong); // Xóa bài hát cụ thể

module.exports = router;
