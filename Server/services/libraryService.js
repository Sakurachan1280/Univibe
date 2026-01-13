const Interaction = require('../models/Interaction');
const Song = require('../models/Song');
const Artist = require('../models/Artist');
const ListeningHistory = require('../models/ListeningHistory');

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

module.exports = { toggleInteraction, getLikedSongs, getListeningHistory };