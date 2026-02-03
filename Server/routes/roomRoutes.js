const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.post('/', roomController.create);
router.get('/:id', roomController.getDetail);
router.post('/:id/invite', roomController.inviteFriend);

module.exports = router;