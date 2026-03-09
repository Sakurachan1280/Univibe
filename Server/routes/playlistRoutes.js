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
router.get('/system', playlistController.getSystemAlbums); // Album hệ thống (system_mix, public) - mọi user xem được


// 2. Thao tác trên Playlist cụ thể (Sửa, Xóa, Xem chi tiết)
router.get('/:id', playlistController.getDetail);
router.put('/:id', playlistController.update); // Đổi tên, Đổi chế độ public/private
router.delete('/:id', playlistController.remove);

// 3. Quản lý bài hát trong Playlist
router.post('/:id/songs', playlistController.addSong);
router.delete('/:id/songs/:songId', playlistController.removeSong); // Xóa bài hát cụ thể

// 4. Cập nhật ảnh bìa (riêng để dùng multipart)
router.put('/:id/cover', upload.fields([{ name: 'cover_image', maxCount: 1 }]), playlistController.updateCover);

// 5. Sắp xếp lại thứ tự bài hát
router.put('/:id/reorder', playlistController.reorderTracks);

module.exports = router;
