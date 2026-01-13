const Playlist = require('../models/Playlist');
const Song = require('../models/Song');

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

const getPlaylistById = async (playlistId, userId) => {
  const playlist = await Playlist.findById(playlistId)
    .populate('owner_id', 'username profile.display_name profile.avatar_url')
    .populate({
      path: 'tracks.song_id',
      select: 'title file_url cover_image duration artist_ids',
      populate: { path: 'artist_ids', select: 'name' }
    });

  if (!playlist) throw new Error('Playlist not found');

  if (!playlist.is_public && playlist.owner_id._id.toString() !== userId) {
    throw new Error('This playlist is private');
  }

  return playlist;
};

const updatePlaylist = async (userId, playlistId, updateData) => {
  const playlist = await Playlist.findOne({ _id: playlistId, owner_id: userId });
  if (!playlist) throw new Error('Playlist not found or you are not the owner');

  if (updateData.name) playlist.name = updateData.name;
  if (updateData.description !== undefined) playlist.description = updateData.description;
  if (updateData.is_public !== undefined) playlist.is_public = updateData.is_public;
  if (updateData.tags) playlist.tags = updateData.tags;

  await playlist.save();
  return playlist;
};

const deletePlaylist = async (userId, playlistId) => {
  const playlist = await Playlist.findOneAndDelete({ _id: playlistId, owner_id: userId });
  if (!playlist) throw new Error('Playlist not found or you are not the owner');
  return { message: 'Playlist deleted successfully' };
};

const addSongToPlaylist = async (userId, playlistId, songId) => {
  const playlist = await Playlist.findOne({ _id: playlistId, owner_id: userId });
  if (!playlist) throw new Error('Playlist not found or you are not the owner');

  const song = await Song.findById(songId);
  if (!song) throw new Error('Song not found');

  const isExists = playlist.tracks.some(track => track.song_id.toString() === songId);
  if (isExists) throw new Error('Song already exists in this playlist');

  playlist.tracks.push({ song_id: songId });
  await playlist.save();
  return playlist;
};

const removeSongFromPlaylist = async (userId, playlistId, songId) => {
  const playlist = await Playlist.findOne({ _id: playlistId, owner_id: userId });
  if (!playlist) throw new Error('Playlist not found or you are not the owner');

  playlist.tracks = playlist.tracks.filter(track => track.song_id.toString() !== songId);
  
  await playlist.save();
  return playlist;
};

module.exports = {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist
};