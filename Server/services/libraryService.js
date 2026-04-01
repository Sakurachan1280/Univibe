const Interaction = require('../models/Interaction');
const Song = require('../models/Song');
const Artist = require('../models/Artist');
const ListeningHistory = require('../models/ListeningHistory');
const Playlist = require('../models/Playlist');

const toggleInteraction = async (userId, targetId, targetType, action) => {
  const existing = await Interaction.findOne({
    user_id: userId,
    target_id: targetId,
    action: action
  });

  if (existing) {
    await Interaction.deleteOne({ _id: existing._id });
    if (targetType === 'song' && action === 'like') {
      await Song.findByIdAndUpdate(targetId, { $inc: { 'stats.like_count': -1 } });
    }
    return { status: 'removed' };
  } else {
    await Interaction.create({
      user_id: userId,
      target_id: targetId,
      target_type: targetType,
      action: action
    });
    if (targetType === 'song' && action === 'like') {
      await Song.findByIdAndUpdate(targetId, { $inc: { 'stats.like_count': 1 } });
    }
    return { status: 'added' };
  }
};

const getLikedSongs = async (userId) => {
  const interactions = await Interaction.find({ user_id: userId, action: 'like', target_type: 'song' });
  const songIds = interactions.map(i => i.target_id);
  return await Song.find({ _id: { $in: songIds } }).populate('artist_ids', 'name avatar');
};

const getListeningHistory = async (userId) => {
  return await ListeningHistory.find({ user_id: userId })
    .sort({ timestamp: -1 }) 
    .limit(20) 
    .populate({
      path: 'song_id',
      select: 'title file_url cover_image duration artist_ids',
      populate: { path: 'artist_ids', select: 'name' }
    });
};

const toggleSaveAlbum = async (userId, albumId) => {
  const existing = await Interaction.findOne({
    user_id: userId,
    target_id: albumId,
    target_type: 'playlist',
    action: 'like',
  });

  if (existing) {
    await Interaction.deleteOne({ _id: existing._id });
    return { status: 'removed' };
  } else {
    await Interaction.create({
      user_id: userId,
      target_id: albumId,
      target_type: 'playlist',
      action: 'like',
    });
    return { status: 'added' };
  }
};

const getSavedAlbums = async (userId) => {
  const interactions = await Interaction.find({
    user_id: userId,
    target_type: 'playlist',
    action: 'like',
  }).sort({ timestamp: -1 });
  const albumIds = interactions.map(i => i.target_id);
  return await Playlist.find({ _id: { $in: albumIds } });
};

const isAlbumSaved = async (userId, albumId) => {
  const existing = await Interaction.findOne({
    user_id: userId,
    target_id: albumId,
    target_type: 'playlist',
    action: 'like',
  });
  return !!existing;
};

const getFollowedArtists = async (userId) => {
  const interactions = await Interaction.find({
    user_id: userId,
    target_type: 'artist',
    action: 'follow',
  }).sort({ timestamp: -1 });
  const artistIds = interactions.map(i => i.target_id);
  return await Artist.find({ _id: { $in: artistIds } });
};

const isArtistFollowed = async (userId, artistId) => {
  const existing = await Interaction.findOne({
    user_id: userId,
    target_id: artistId,
    target_type: 'artist',
    action: 'follow',
  });
  return !!existing;
};

module.exports = { toggleInteraction, getLikedSongs, getListeningHistory, toggleSaveAlbum, getSavedAlbums, isAlbumSaved, getFollowedArtists, isArtistFollowed };