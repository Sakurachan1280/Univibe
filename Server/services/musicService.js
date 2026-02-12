const Song = require('../models/Song');
const Artist = require('../models/Artist');
const ListeningHistory = require('../models/ListeningHistory');

const createArtist = async (data) => {
  return await Artist.create(data);
};

const getArtists = async () => {
  return await Artist.find().select('name avatar bio').sort({ name: 1 });
};

const updateArtist = async (id, data) => {
  console.log('Service: updateArtist called with ID:', id);
  console.log('Service: update data:', data);

  // Validate ObjectId
  const mongoose = require('mongoose');
  if (!mongoose.Types.ObjectId.isValid(id)) {
    console.log('Service: Invalid ObjectId format');
    return null;
  }

  const artist = await Artist.findByIdAndUpdate(id, data, { new: true });
  console.log('Service: findByIdAndUpdate result:', artist);
  return artist;
};

const deleteArtist = async (id) => {
  console.log('Service: deleteArtist called with ID:', id);

  // Validate ObjectId
  const mongoose = require('mongoose');
  if (!mongoose.Types.ObjectId.isValid(id)) {
    console.log('Service: Invalid ObjectId format');
    return null;
  }

  const artist = await Artist.findByIdAndDelete(id);
  console.log('Service: findByIdAndDelete result:', artist);
  return artist;
};

const createSong = async (data) => {
  return await Song.create(data);
};

const updateSong = async (id, data) => {
  console.log('Service: updateSong called with ID:', id);
  const mongoose = require('mongoose');
  if (!mongoose.Types.ObjectId.isValid(id)) {
    console.log('Service: Invalid ObjectId format');
    return null;
  }
  const song = await Song.findByIdAndUpdate(id, data, { new: true });
  console.log('Service: findByIdAndUpdate result:', song);
  return song;
};

const deleteSong = async (id) => {
  console.log('Service: deleteSong called with ID:', id);
  const mongoose = require('mongoose');
  if (!mongoose.Types.ObjectId.isValid(id)) {
    console.log('Service: Invalid ObjectId format');
    return null;
  }
  const song = await Song.findByIdAndDelete(id);
  console.log('Service: findByIdAndDelete result:', song);
  return song;
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

const getRandomSongs = async (limit = 20) => {
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
        title: 1,
        file_url: 1,
        cover_image: 1,
        duration: 1,
        artist: {
          $cond: {
            if: { $gt: [{ $size: '$artist_info' }, 0] },
            then: {
              $reduce: {
                input: '$artist_info',
                initialValue: '',
                in: {
                  $concat: [
                    '$$value',
                    { $cond: [{ $eq: ['$$value', ''] }, '', ', '] },
                    '$$this.name'
                  ]
                }
              }
            },
            else: 'Unknown Artist'
          }
        },
        artist_ids: '$artist_info',
        stats: 1
      }
    }
  ]);
};

const searchSongs = async (query) => {
  // Search by song title or artist name
  return await Song.aggregate([
    {
      $lookup: {
        from: 'artists',
        localField: 'artist_ids',
        foreignField: '_id',
        as: 'artist_info'
      }
    },
    {
      $match: {
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { 'artist_info.name': { $regex: query, $options: 'i' } }
        ]
      }
    },
    {
      $project: {
        title: 1,
        file_url: 1,
        cover_image: 1,
        duration: 1,
        artist: {
          $cond: {
            if: { $gt: [{ $size: '$artist_info' }, 0] },
            then: {
              $reduce: {
                input: '$artist_info',
                initialValue: '',
                in: {
                  $concat: [
                    '$$value',
                    { $cond: [{ $eq: ['$$value', ''] }, '', ', '] },
                    '$$this.name'
                  ]
                }
              }
            },
            else: 'Unknown Artist'
          }
        },
        artist_ids: '$artist_info',
        stats: 1
      }
    },
    { $limit: 50 }
  ]);
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
  getArtists,
  updateArtist,
  deleteArtist,
  createSong,
  updateSong,
  deleteSong,
  getSongDetail,
  getSongList,
  getRandomSongs,
  searchSongs,
  logListeningAction
};