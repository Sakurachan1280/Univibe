const Song = require('../models/Song');
const Artist = require('../models/Artist');
const ListeningHistory = require('../models/ListeningHistory');

const createArtist = async (data) => {
  return await Artist.create(data);
};

const createSong = async (data) => {
  return await Song.create(data);
};

const getSongDetail = async (id) => {
  return await Song.findById(id).populate('artist_ids', 'name avatar');
};

const getSongList = async (limit = 20, type = 'new') => {
  if (type === 'shuffle') {
  
    return await Song.aggregate([
      { $sample: { size: Number(limit) } }, 
      { 
        $lookup: {
          from: 'artists', 
          localField: 'artist_ids',
          foreignField: '_id',
          as: 'artist_info'
        }
      },
      {
        $project: {
          title: 1, file_url: 1, cover_image: 1, duration: 1, 
          artist_ids: '$artist_info', 
          stats: 1
        }
      }
    ]);
  } 
  
  else {
    return await Song.find()
      .populate('artist_ids', 'name avatar')
      .sort({ created_at: -1 })
      .limit(Number(limit));
  }
};

const logListeningAction = async (userId, songId, actionType, duration, context) => {

  await ListeningHistory.create({
    user_id: userId,
    song_id: songId,
    action_type: actionType,
    duration_listened: duration,
    context: context
  });

  if (actionType === 'listen' || actionType === 'complete') {
    await Song.findByIdAndUpdate(songId, { 
      $inc: { 'stats.play_count': 1 } 
    });
  }

  return { message: 'Action logged' };
};

module.exports = {
  createArtist,
  createSong,
  getSongDetail,
  getSongList,
  logListeningAction
};