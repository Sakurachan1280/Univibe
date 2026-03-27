const playlistService = require('../services/playlistService');
const { createPlaylistSchema, updatePlaylistSchema, addSongSchema } = require('../validations/playlistValidation');

const create = async (req, res) => {
  try {
    const { error } = createPlaylistSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    // Cloudinary upload: file.path chứa URL đầy đủ
    const coverFile = req.files?.cover_image?.[0];
    const coverImageUrl = coverFile?.path ?? undefined;

    const playlist = await playlistService.createPlaylist(req.user.id, {
      ...req.body,
      ...(coverImageUrl && { cover_image: coverImageUrl }),
    });
    res.status(201).json(playlist);
  } catch (err) {
    console.error('[CREATE PLAYLIST ERROR]', err.message);
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

const getSystemAlbums = async (req, res) => {
  try {
    const albums = await playlistService.getSystemAlbums();
    res.json(albums);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getDetail = async (req, res) => {
  try {
    const playlist = await playlistService.getPlaylistById(req.params.id, req.user?.id ?? null);
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

const updateCover = async (req, res) => {
  try {
    const coverFile = req.files?.cover_image?.[0];
    if (!coverFile) return res.status(400).json({ message: 'cover_image file is required' });
    const coverUrl = coverFile.path; // Cloudinary returns full URL in path
    const playlist = await playlistService.updatePlaylistCover(req.user.id, req.params.id, coverUrl);
    res.json(playlist);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const reorderTracks = async (req, res) => {
  try {
    const { orderedSongIds } = req.body;
    if (!Array.isArray(orderedSongIds)) {
      return res.status(400).json({ message: 'orderedSongIds must be an array' });
    }
    const result = await playlistService.reorderPlaylistTracks(req.user.id, req.params.id, orderedSongIds);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  create,
  getMyPlaylists,
  getSystemAlbums,
  getDetail,
  update,
  remove,
  addSong,
  removeSong,
  updateCover,
  reorderTracks
};
