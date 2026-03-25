const Song = require('../models/Song');
const Artist = require('../models/Artist');
const ListeningHistory = require('../models/ListeningHistory');

const createArtist = async (data) => {
  return await Artist.create(data);
};

const getArtists = async () => {
  return await Artist.find().select('name avatar bio').sort({ name: 1 });
};

const getArtistById = async (id) => {
  return await Artist.findById(id).select('name avatar bio');
};

const getSongsByArtist = async (artistId) => {
  const mongoose = require('mongoose');
  if (!mongoose.Types.ObjectId.isValid(artistId)) return [];

  return await Song.find({ artist_ids: artistId })
    .populate('artist_ids', 'name avatar')
    .sort({ created_at: -1 });
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

// Lấy TẤT CẢ bài hát (dùng cho admin, không giới hạn)
const getAllSongs = async () => {
  return await Song.find()
    .populate('artist_ids', 'name avatar')
    .sort({ created_at: -1 });
};

// Lấy queue bài hát (dùng khi phát nhạc)
const getSongList = async (type = 'new') => {
  if (type === 'shuffle') {
    // Shuffle: lấy ngẫu nhiên tối đa 200 bài
    return await Song.aggregate([
      { $sample: { size: 500 } },
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
  } else {
    // Không giới hạn số bài, lấy tất cả sort mới nhất
    return await Song.find()
      .populate('artist_ids', 'name avatar')
      .sort({ created_at: -1 });
  }
};

const getSongsByGenre = async (genre, limit = 30) => {
  const songs = await Song.find({
    genres: { $elemMatch: { $regex: genre, $options: 'i' } }
  })
    .populate('artist_ids', 'name avatar')
    .select('title file_url cover_image duration genres stats artist_ids')
    .lean();

  // Shuffle và giới hạn số lượng
  const shuffled = songs.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Number(limit));
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

  // Kiểm tra bài hát cuối cùng trong lịch sử của user
  const lastEntry = await ListeningHistory.findOne({ user_id: userId })
    .sort({ timestamp: -1 })
    .select('song_id');

  // Nếu bài cuối cùng trùng bài đang phát → chỉ cập nhật timestamp, không tạo thêm bản ghi
  if (lastEntry && lastEntry.song_id.toString() === songId.toString()) {
    await ListeningHistory.findByIdAndUpdate(lastEntry._id, {
      timestamp: new Date(),
      action_type: actionType,
      duration_listened: duration,
    });
  } else {
    await ListeningHistory.create({
      user_id: userId,
      song_id: songId,
      action_type: actionType,
      duration_listened: duration,
      context: context
    });
  }

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
  getArtistById,
  getSongsByArtist,
  updateArtist,
  deleteArtist,
  createSong,
  updateSong,
  deleteSong,
  getSongDetail,
  getAllSongs,
  getSongList,
  getRandomSongs,
  getSongsByGenre,
  searchSongs,
  logListeningAction
};
