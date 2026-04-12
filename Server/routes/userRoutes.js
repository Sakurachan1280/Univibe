const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Tất cả các route dưới đây đều cần đăng nhập
router.use(protect);

router.get('/me', userController.getMe);
router.get('/:id', userController.getUserById);
router.put('/profile', 
  upload.fields([
    { name: 'avatar', maxCount: 1 }, 
    { name: 'cover', maxCount: 1 }
  ]), 
  userController.updateProfile
);

module.exports = router;