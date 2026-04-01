const express = require('express');
const router = express.Router();
const libraryController = require('../controllers/libraryController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.post('/like/song', libraryController.toggleLikeSong);
router.get('/liked-songs', libraryController.getMyLikedSongs);
router.post('/follow/artist', libraryController.toggleFollowArtist);
router.get('/history', libraryController.getHistory);
router.post('/save/album', libraryController.toggleSaveAlbum);
router.get('/saved-albums', libraryController.getSavedAlbums);
router.get('/saved-albums/:albumId', libraryController.checkAlbumSaved);
router.get('/followed-artists', libraryController.getFollowedArtists);
router.get('/followed-artists/:artistId', libraryController.checkArtistFollowed);
module.exports = router;