const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { protect } = require('../middlewares/authMiddleware');

// Các route AI đều cần xác thực người dùng
router.use(protect);

router.get('/recommendations', aiController.getAIRecommendations);
router.get('/playlists', aiController.getAIPlaylists);

module.exports = router;
