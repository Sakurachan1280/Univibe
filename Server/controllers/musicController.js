const musicService = require('../services/musicService');

const createArtist = async (req, res) => {
  try {
    const data = req.body;
    if (req.files && req.files.avatar) {
      data.avatar = `/uploads/${req.files.avatar[0].filename}`;
    }
    const artist = await musicService.createArtist(data);
    res.status(201).json(artist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createSong = async (req, res) => {
  try {
    const data = req.body;
    
    if (req.files) {
      if (req.files.audio) data.file_url = `/uploads/${req.files.audio[0].filename}`;
      if (req.files.cover) data.cover_image = `/uploads/${req.files.cover[0].filename}`;
    }

    if (data.artist_ids && typeof data.artist_ids === 'string') {
        data.artist_ids = data.artist_ids.split(',');
    }
    
    if (data.lyrics) {
        try { data.lyrics = JSON.parse(data.lyrics); } catch(e) {}
    }

    const song = await musicService.createSong(data);
    res.status(201).json(song);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const playSong = async (req, res) => {
  try {
    const song = await musicService.getSongDetail(req.params.id);
    if (!song) return res.status(404).json({ message: 'Song not found' });
    res.json(song);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getQueue = async (req, res) => {
  try {
    const { type } = req.query; 
    
    const songs = await musicService.getSongList(20, type);
    res.json(songs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const logAction = async (req, res) => {
  try {
    const { song_id, action_type, duration_listened, context } = req.body;
    
    await musicService.logListeningAction(req.user.id, song_id, action_type, duration_listened, context);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createArtist,
  createSong,
  playSong,
  getQueue,
  logAction
};