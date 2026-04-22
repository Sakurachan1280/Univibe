const aiService = require('../services/aiService');
const Song = require('../models/Song');
const ListeningHistory = require('../models/ListeningHistory');
const User = require('../models/User');
const mongoose = require('mongoose');

// Cache đơn giản để lưu kết quả cấu trúc từ AI (để tiết kiệm lượt gọi LLM)
const aiCache = new Map();
const CACHE_DURATION = 20 * 1000; // Giảm xuống 20 giây để mượt mà nhất

// Hàm kiểm tra ID hợp lệ
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// Cache cho danh sách bài hát candidate (giảm tải DB)
let cachedSongsCandidate = null;
let lastSongsFetchTime = 0;
const SONGS_CACHE_TTL = 5 * 60 * 1000; // 5 phút

const getCandidateSongs = async () => {
  if (cachedSongsCandidate && (Date.now() - lastSongsFetchTime < SONGS_CACHE_TTL)) {
    return cachedSongsCandidate;
  }
  // Lấy TẤT CẢ bài hát trong hệ thống để AI có cái nhìn tổng quan nhất
  const songs = await Song.find().sort({ 'stats.play_count': -1 });
  cachedSongsCandidate = songs;
  lastSongsFetchTime = Date.now();
  return songs;
};

/**
 * Controller xử lý các yêu cầu AI từ Client
 */
const getAIRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const cacheKey = `recs_${userId}`;
    const isRefresh = req.query.refresh === 'true';
    let recommendedIds;
    const cachedData = aiCache.get(cacheKey);

    if (!isRefresh && cachedData && (Date.now() - cachedData.timestamp < CACHE_DURATION)) {
      console.log('>> [AI CACHE] Hit recommendations:', userId);
      recommendedIds = cachedData.ids;
    } else {
      console.log('>> [AI ROUTE] Hit Recommendations for user:', userId, isRefresh ? '(FORCED REFRESH)' : '');
      const user = await User.findById(userId);

      // 1. Lấy lịch sử nghe
      const history = await ListeningHistory.find({ user_id: userId })
        .sort({ timestamp: -1 })
        .limit(20)
        .populate('song_id');

      const completedSongs = history.filter(h => h.action_type === 'complete').map(h => h.song_id?.title).filter(Boolean);
      const skippedSongs = history.filter(h => h.action_type === 'skip').map(h => h.song_id?.title).filter(Boolean);

      // 2. Xác định bối cảnh thời gian
      const hour = new Date().getHours();
      let timeContext = "Evening";
      if (hour >= 5 && hour < 11) timeContext = "Morning (Fresh & Energetic)";
      else if (hour >= 11 && hour < 16) timeContext = "Afternoon (Focused & Calming)";
      else if (hour >= 16 && hour < 21) timeContext = "Late Afternoon/Evening (Chill & Relax)";
      else timeContext = "Late Night (Deep & Soothing)";

      // 3. Lấy bài hát hot
      const allSongs = await getCandidateSongs();

      // 4. Gọi AI
      recommendedIds = await aiService.getRecommendations({
        genres: user.profile?.genres_interest || [],
        completedSongs,
        skippedSongs,
        timeContext,
        seed: Math.random() // Thêm seed để đa dạng hóa
      }, allSongs);

      // Lọc các ID hợp lệ
      recommendedIds = recommendedIds.filter(isValidId);

      // Lưu cache ID
      aiCache.set(cacheKey, { ids: recommendedIds, timestamp: Date.now() });
    }

    // LUÔN lấy data mới nhất và check trạng thái đã nghe
    const freshHistory = await ListeningHistory.find({ user_id: userId }).distinct('song_id');
    const listenedIdSet = new Set(freshHistory.map(id => id.toString()));

    const recommendations = await Song.find({ _id: { $in: recommendedIds } })
      .populate('artist_ids', 'name');

    const finalData = recommendations.map(s => {
      const obj = s.toObject();
      obj.isListened = listenedIdSet.has(s._id.toString());
      return obj;
    });

    res.json({ success: true, data: finalData });
  } catch (error) {
    console.error("[AI Controller] Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAIPlaylists = async (req, res) => {
  try {
    const userId = req.user.id;
    const cacheKey = `mixes_${userId}`;
    const isRefresh = req.query.refresh === 'true';
    let aiMixes;
    const cachedData = aiCache.get(cacheKey);

    if (!isRefresh && cachedData && (Date.now() - cachedData.timestamp < CACHE_DURATION)) {
      console.log('>> [AI CACHE] Hit playlists:', userId);
      aiMixes = cachedData.mixes;
    } else {
      console.log('>> [AI ROUTE] Hit Playlists for user:', userId, isRefresh ? '(FORCED REFRESH)' : '');
      const user = await User.findById(userId);
      const allSongs = await getCandidateSongs();

      aiMixes = await aiService.generateDailyMixes(
        user.profile?.genres_interest || [],
        allSongs,
        Math.random() // Thêm seed cho playlist
      );

      // Lưu cache cấu trúc playlist
      aiCache.set(cacheKey, { mixes: aiMixes, timestamp: Date.now() });
    }

    // LUÔN Lấy data fresh và check trạng thái đã nghe (ngoài cache)
    const history = await ListeningHistory.find({ user_id: userId }).distinct('song_id');
    const listenedIdSet = new Set(history.map(id => id.toString()));

    const allIdsInMixes = aiMixes.reduce((acc, mix) => [...acc, ...mix.songIds], []).filter(isValidId);
    const songDataMap = await Song.find({ _id: { $in: allIdsInMixes } })
      .populate('artist_ids', 'name');

    const finalMixes = aiMixes.map(mix => ({
      ...mix,
      tracks: mix.songIds.map(id => {
        const s = songDataMap.find(item => item._id.toString() === id);
        if (!s) return null;
        const songObj = s.toObject();
        songObj.isListened = listenedIdSet.has(id.toString());
        return songObj;
      }).filter(Boolean)
    }));

    res.json({ success: true, data: finalMixes });
  } catch (error) {
    console.error("[AI Playlist Controller] Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAIRecommendations, getAIPlaylists };
