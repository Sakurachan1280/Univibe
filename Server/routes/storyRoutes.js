const express = require('express');
const router = express.Router();
const storyController = require('../controllers/storyController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.use(protect);

// Đăng Story
router.post('/', upload.fields([{ name: 'image', maxCount: 1 }]), storyController.create);

//  Lấy Feed Story (Bạn bè & Mình)
router.get('/feed', storyController.getFeed);

// Đánh dấu đã xem Story
router.put('/:id/view', storyController.view);

// Thả tim Story
router.post('/:id/like', storyController.like);

// Reply Story
router.post('/:id/reply', storyController.reply);

module.exports = router;