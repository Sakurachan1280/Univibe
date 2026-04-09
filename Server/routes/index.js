const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const musicRoutes = require('./musicRoutes');
const playlistRoutes = require('./playlistRoutes');
const libraryRoutes = require('./libraryRoutes');
const socialRoutes = require('./socialRoutes');
const chatRoutes = require('./chatRoutes');
const storyRoutes = require('./storyRoutes');
const roomRoutes = require('./roomRoutes');
const notificationRoutes = require('./notificationRoutes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/music', musicRoutes);
router.use('/playlists', playlistRoutes);
router.use('/library', libraryRoutes);
router.use('/social', socialRoutes);
router.use('/chat', chatRoutes);
router.use('/stories', storyRoutes);
router.use('/rooms', roomRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;