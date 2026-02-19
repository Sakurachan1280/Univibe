const musicService = require('../services/musicService');

const createArtist = async (req, res) => {
  try {
    const data = req.body;
    if (req.files && req.files.avatar) {
      // Đảm bảo lấy secure URL từ Cloudinary
      data.avatar = req.files.avatar[0].path || req.files.avatar[0].url;
    }
    const artist = await musicService.createArtist(data);
    res.status(201).json(artist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getArtists = async (req, res) => {
  try {
    const artists = await musicService.getArtists();
    console.log('GET artists - Found', artists.length, 'artists');
    if (artists.length > 0) {
      console.log('Sample artist IDs:', artists.slice(0, 3).map(a => ({ id: a._id, name: a.name })));
    }
    res.json(artists);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getArtistById = async (req, res) => {
  try {
    const artist = await musicService.getArtistById(req.params.id);
    if (!artist) return res.status(404).json({ message: 'Artist not found' });
    res.json(artist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getSongsByArtist = async (req, res) => {
  try {
    const songs = await musicService.getSongsByArtist(req.params.id);
    res.json(songs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateArtist = async (req, res) => {
  try {
    console.log('UPDATE artist request for ID:', req.params.id);
    console.log('Update data:', req.body);
    const data = req.body;
    if (req.files && req.files.avatar) {
      // Đảm bảo lấy secure URL từ Cloudinary
      data.avatar = req.files.avatar[0].path || req.files.avatar[0].url;
      console.log('New avatar:', data.avatar);
    }
    const artist = await musicService.updateArtist(req.params.id, data);
    console.log('Updated artist:', artist);
    if (!artist) {
      console.log('Artist not found');
      return res.status(404).json({ message: 'Artist not found' });
    }
    res.json(artist);
  } catch (err) {
    console.error('Error updating artist:', err);
    res.status(500).json({ message: err.message });
  }
};

const deleteArtist = async (req, res) => {
  try {
    console.log('DELETE artist request for ID:', req.params.id);
    const artist = await musicService.deleteArtist(req.params.id);
    console.log('Deleted artist:', artist);
    if (!artist) {
      console.log('Artist not found');
      return res.status(404).json({ message: 'Artist not found' });
    }
    res.json({ message: 'Artist deleted successfully' });
  } catch (err) {
    console.error('Error deleting artist:', err);
    res.status(500).json({ message: err.message });
  }
};

const createSong = async (req, res) => {
  try {
    console.log('>> [CREATE SONG] Request received');
    console.log('>> [CREATE SONG] Body:', req.body);

    const data = req.body;

    if (req.files) {
      console.log('>> [CREATE SONG] Files received:', Object.keys(req.files));

      if (req.files.audio) {
        // Đảm bảo lấy secure URL từ Cloudinary
        data.file_url = req.files.audio[0].path || req.files.audio[0].url;
        console.log('>> [CREATE SONG] Audio file object:', JSON.stringify(req.files.audio[0], null, 2));
        console.log('>> [CREATE SONG] Audio uploaded to Cloudinary:', data.file_url);
      }

      if (req.files.cover) {
        // Đảm bảo lấy secure URL từ Cloudinary
        data.cover_image = req.files.cover[0].path || req.files.cover[0].url;
        console.log('>> [CREATE SONG] Cover file object:', JSON.stringify(req.files.cover[0], null, 2));
        console.log('>> [CREATE SONG] Cover uploaded to Cloudinary:', data.cover_image);
      }
    }

    if (data.artist_ids && typeof data.artist_ids === 'string') {
      data.artist_ids = data.artist_ids.split(',');
    }

    if (data.lyrics) {
      try { data.lyrics = JSON.parse(data.lyrics); } catch (e) { }
    }

    console.log('>> [CREATE SONG] Creating song in database...');
    const song = await musicService.createSong(data);
    console.log('>> [CREATE SONG] Song created successfully:', song._id);

    res.status(201).json(song);
  } catch (err) {
    console.error('>> [CREATE SONG] Error:', err);
    res.status(500).json({ message: err.message });
  }
};

const updateSong = async (req, res) => {
  try {
    console.log('UPDATE song request for ID:', req.params.id);
    const data = req.body;

    if (req.files) {
      // Đảm bảo lấy secure URL từ Cloudinary
      if (req.files.audio) data.file_url = req.files.audio[0].path || req.files.audio[0].url;
      if (req.files.cover) data.cover_image = req.files.cover[0].path || req.files.cover[0].url;
    }

    if (data.artist_ids && typeof data.artist_ids === 'string') {
      data.artist_ids = data.artist_ids.split(',');
    }

    const song = await musicService.updateSong(req.params.id, data);
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }
    res.json(song);
  } catch (err) {
    console.error('Error updating song:', err);
    res.status(500).json({ message: err.message });
  }
};

const deleteSong = async (req, res) => {
  try {
    console.log('DELETE song request for ID:', req.params.id);
    const song = await musicService.deleteSong(req.params.id);
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }
    res.json({ message: 'Song deleted successfully' });
  } catch (err) {
    console.error('Error deleting song:', err);
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

const getRandomSongs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const songs = await musicService.getRandomSongs(limit);
    console.log('Random songs sample:', JSON.stringify(songs[0], null, 2));
    res.json(songs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const searchSongs = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    const songs = await musicService.searchSongs(q);
    res.json(songs);
  } catch (err) {
    console.error('Error searching songs:', err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createArtist,
  getArtists,
  getArtistById,
  getSongsByArtist,
  updateArtist,
  deleteArtist,
  createSong,
  updateSong,
  deleteSong,
  playSong,
  getQueue,
  getRandomSongs,
  searchSongs,
  logAction
};