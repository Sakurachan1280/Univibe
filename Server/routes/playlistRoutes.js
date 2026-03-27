const express = require('express');
const router = express.Router();
const playlistController = require('../controllers/playlistController');
const { protect, optionalProtect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// ── Public (không cần đăng nhập) ──────────────────────────────────────────────
// Album hệ thống (system_mix, public) — mọi user xem được kể cả chưa login
router.get('/system', optionalProtect, playlistController.getSystemAlbums);

// Xem chi tiết playlist/album công khai — optionalProtect để check owner nếu cần
router.get('/:id', optionalProtect, playlistController.getDetail);

// ── Protected (cần đăng nhập) ─────────────────────────────────────────────────
// 1. Tạo & Lấy danh sách playlist của user
router.post('/', protect, upload.fields([{ name: 'cover_image', maxCount: 1 }]), playlistController.create);
router.get('/', protect, playlistController.getMyPlaylists);

// 2. Thao tác trên Playlist cụ thể (Sửa, Xóa)
router.put('/:id', protect, playlistController.update);
router.delete('/:id', protect, playlistController.remove);

// 3. Quản lý bài hát trong Playlist
router.post('/:id/songs', protect, playlistController.addSong);
router.delete('/:id/songs/:songId', protect, playlistController.removeSong);

// 4. Cập nhật ảnh bìa
router.put('/:id/cover', protect, upload.fields([{ name: 'cover_image', maxCount: 1 }]), playlistController.updateCover);

// 5. Sắp xếp lại thứ tự bài hát
router.put('/:id/reorder', protect, playlistController.reorderTracks);

module.exports = router;
