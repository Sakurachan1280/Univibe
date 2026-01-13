const libraryService = require('../services/libraryService');

const toggleLikeSong = async (req, res) => {
  try {
    const { songId } = req.body;
    const result = await libraryService.toggleInteraction(req.user.id, songId, 'song', 'like');
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const toggleFollowArtist = async (req, res) => {
  try {
    const { artistId } = req.body;
    const result = await libraryService.toggleInteraction(req.user.id, artistId, 'artist', 'follow');
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMyLikedSongs = async (req, res) => {
  try {
    const songs = await libraryService.getLikedSongs(req.user.id);
    res.json(songs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getHistory = async (req, res) => {
  try {
    const history = await libraryService.getListeningHistory(req.user.id);
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { toggleLikeSong, toggleFollowArtist, getMyLikedSongs, getHistory };