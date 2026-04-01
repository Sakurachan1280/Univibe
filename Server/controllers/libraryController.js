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

const toggleSaveAlbum = async (req, res) => {
  try {
    const { albumId } = req.body;
    const result = await libraryService.toggleSaveAlbum(req.user.id, albumId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getSavedAlbums = async (req, res) => {
  try {
    const albums = await libraryService.getSavedAlbums(req.user.id);
    res.json(albums);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const checkAlbumSaved = async (req, res) => {
  try {
    const { albumId } = req.params;
    const saved = await libraryService.isAlbumSaved(req.user.id, albumId);
    res.json({ saved });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getFollowedArtists = async (req, res) => {
  try {
    const artists = await libraryService.getFollowedArtists(req.user.id);
    res.json(artists);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const checkArtistFollowed = async (req, res) => {
  try {
    const { artistId } = req.params;
    const followed = await libraryService.isArtistFollowed(req.user.id, artistId);
    res.json({ followed });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { toggleLikeSong, toggleFollowArtist, getMyLikedSongs, getHistory, toggleSaveAlbum, getSavedAlbums, checkAlbumSaved, getFollowedArtists, checkArtistFollowed };