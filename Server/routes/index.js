const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
// const musicRoutes = require('./musicRoutes');
// const playlistRoutes = require('./playlistRoutes');
// const libraryRoutes = require('./libraryRoutes');
// const socialRoutes = require('./socialRoutes');
// const chatRoutes = require('./chatRoutes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
// router.use('/music', musicRoutes);
// router.use('/playlists', playlistRoutes);
// router.use('/library', libraryRoutes);
// router.use('/social', socialRoutes);
// router.use('/chat', chatRoutes);

module.exports = router;