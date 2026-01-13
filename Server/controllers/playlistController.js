const playlistService = require('../services/playlistService');
const { createPlaylistSchema, updatePlaylistSchema, addSongSchema } = require('../validations/playlistValidation');

const create = async (req, res) => {
  try {
    const { error } = createPlaylistSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const playlist = await playlistService.createPlaylist(req.user.id, req.body);
    res.status(201).json(playlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMyPlaylists = async (req, res) => {
  try {
    const playlists = await playlistService.getUserPlaylists(req.user.id);
    res.json(playlists);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getDetail = async (req, res) => {
  try {
    const playlist = await playlistService.getPlaylistById(req.params.id, req.user.id);
    res.json(playlist);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

const update = async (req, res) => {
  try {
    const { error } = updatePlaylistSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const playlist = await playlistService.updatePlaylist(req.user.id, req.params.id, req.body);
    res.json(playlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const result = await playlistService.deletePlaylist(req.user.id, req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addSong = async (req, res) => {
  try {
    const { error } = addSongSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const result = await playlistService.addSongToPlaylist(req.user.id, req.params.id, req.body.songId);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const removeSong = async (req, res) => {
  try {
    const result = await playlistService.removeSongFromPlaylist(req.user.id, req.params.id, req.params.songId);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  create,
  getMyPlaylists,
  getDetail,
  update,
  remove,
  addSong,
  removeSong
};