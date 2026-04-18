const Playlist = require('../models/Playlist');
const Song = require('../models/Song');
const User = require('../models/User'); // Import User model

const createPlaylist = async (userId, data) => {
  const playlist = await Playlist.create({
    ...data,
    owner_id: userId,
    tracks: []
  });
  return playlist;
};

const getUserPlaylists = async (userId) => {
  return await Playlist.find({ owner_id: userId })
    .sort({ created_at: -1 })
    .select('-tracks');
};

// Lấy tất cả album hệ thống (system_mix, public) do admin tạo - mọi user đều xem được
const getSystemAlbums = async () => {
  return await Playlist.find({ type: 'system_mix', is_public: true })
    .sort({ created_at: -1 })
    .select('-tracks');
};

const getPlaylistById = async (playlistId, userId) => {
  const playlist = await Playlist.findById(playlistId)
    .populate('owner_id', 'username profile.display_name profile.avatar_url')
    .populate({
      path: 'tracks.song_id',
      select: 'title file_url cover_image duration artist_ids',
      populate: { path: 'artist_ids', select: 'name' }
    });

  if (!playlist) throw new Error('Playlist not found');

  // Guest (chưa đăng nhập) chỉ xem được playlist public
  if (!playlist.is_public) {
    if (!userId || playlist.owner_id._id.toString() !== userId) {
      throw new Error('This playlist is private');
    }
  }

  return playlist;
};

const updatePlaylist = async (userId, playlistId, updateData) => {
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) throw new Error('Playlist not found');

  const user = await User.findById(userId);
  const isOwner = playlist.owner_id.toString() === userId.toString();
  const isAdminAndSystem = user?.role === 'admin' && playlist.type === 'system_mix';

  if (!isOwner && !isAdminAndSystem) throw new Error('You do not have permission to modify this playlist');

  if (updateData.name) playlist.name = updateData.name;
  if (updateData.description !== undefined) playlist.description = updateData.description;
  if (updateData.is_public !== undefined) playlist.is_public = updateData.is_public;
  if (updateData.tags) playlist.tags = updateData.tags;

  await playlist.save();
  return playlist;
};

const deletePlaylist = async (userId, playlistId) => {
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) throw new Error('Playlist not found');

  const user = await User.findById(userId);
  const isOwner = playlist.owner_id.toString() === userId.toString();
  const isAdminAndSystem = user?.role === 'admin' && playlist.type === 'system_mix';

  if (!isOwner && !isAdminAndSystem) throw new Error('You do not have permission to delete this playlist');

  await Playlist.findByIdAndDelete(playlistId);
  return { message: 'Playlist deleted successfully' };
};

const addSongToPlaylist = async (userId, playlistId, songId) => {
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) throw new Error('Playlist not found');

  const user = await User.findById(userId);
  const isOwner = playlist.owner_id.toString() === userId.toString();
  const isAdminAndSystem = user?.role === 'admin' && playlist.type === 'system_mix';

  if (!isOwner && !isAdminAndSystem) throw new Error('You do not have permission to modify this playlist');

  const songIds = Array.isArray(songId) ? songId : [songId];
  
  for (const id of songIds) {
    const song = await Song.findById(id);
    if (!song) continue; // Skip missing songs

    // Nếu album gắn với một ca sĩ cụ thể, kiểm tra bài hát có thuộc ca sĩ đó không
    if (playlist.artist_id) {
      const belongsToArtist = song.artist_ids.some(
        artistId => artistId.toString() === playlist.artist_id.toString()
      );
      if (!belongsToArtist) continue;
    }

    const isExists = playlist.tracks.some(track => track.song_id.toString() === id);
    if (!isExists) {
      playlist.tracks.push({ song_id: id });
    }
  }

  await playlist.save();
  return playlist;
};

const removeSongFromPlaylist = async (userId, playlistId, songId) => {
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) throw new Error('Playlist not found');

  const user = await User.findById(userId);
  const isOwner = playlist.owner_id.toString() === userId.toString();
  const isAdminAndSystem = user?.role === 'admin' && playlist.type === 'system_mix';

  if (!isOwner && !isAdminAndSystem) throw new Error('You do not have permission to modify this playlist');

  playlist.tracks = playlist.tracks.filter(track => track.song_id.toString() !== songId);

  await playlist.save();
  return playlist;
};

const updatePlaylistCover = async (userId, playlistId, coverImageUrl) => {
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) throw new Error('Playlist not found');

  const user = await User.findById(userId);
  const isOwner = playlist.owner_id.toString() === userId.toString();
  const isAdminAndSystem = user?.role === 'admin' && playlist.type === 'system_mix';

  if (!isOwner && !isAdminAndSystem) throw new Error('You do not have permission to modify this playlist');
  playlist.cover_image = coverImageUrl;
  await playlist.save();
  return playlist;
};

const reorderPlaylistTracks = async (userId, playlistId, orderedSongIds) => {
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) throw new Error('Playlist not found');

  const user = await User.findById(userId);
  const isOwner = playlist.owner_id.toString() === userId.toString();
  const isAdminAndSystem = user?.role === 'admin' && playlist.type === 'system_mix';

  if (!isOwner && !isAdminAndSystem) throw new Error('You do not have permission to modify this playlist');

  // Rebuild tracks array in the new order (keep original added_at)
  const trackMap = new Map(playlist.tracks.map(t => [t.song_id.toString(), t]));
  const reordered = orderedSongIds
    .map(id => trackMap.get(id))
    .filter(Boolean);

  playlist.tracks = reordered;
  await playlist.save();
  return playlist;
};

module.exports = {
  createPlaylist,
  getUserPlaylists,
  getSystemAlbums,
  getPlaylistById,
  updatePlaylist,
  updatePlaylistCover,
  reorderPlaylistTracks,
  deletePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist
};
