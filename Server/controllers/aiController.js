const aiService = require('../services/aiService');
const Song = require('../models/Song');
const ListeningHistory = require('../models/ListeningHistory');
const User = require('../models/User');

/**
 * Controller xử lý các yêu cầu AI từ Client
 */
const getAIRecommendations = async (req, res) => {
  try {
    console.log('>> [AI ROUTE] Hit Recommendations for user:', req.user.id);
    const userId = req.user.id;
    const user = await User.findById(userId);

    // 1. Lấy lịch sử nghe rộng hơn (20 bản ghi) để thấy xu hướng
    const history = await ListeningHistory.find({ user_id: userId })
      .sort({ timestamp: -1 })
      .limit(20)
      .populate('song_id');

    // Phân loại: bài nào nghe hết (complete), bài nào bỏ qua (skip)
    const completedSongs = history.filter(h => h.action_type === 'complete').map(h => h.song_id?.title).filter(Boolean);
    const skippedSongs = history.filter(h => h.action_type === 'skip').map(h => h.song_id?.title).filter(Boolean);

    // 2. Xác định thời gian trong ngày (Sáng, Trưa, Chiều, Tối)
    const hour = new Date().getHours();
    let timeContext = "Evening";
    if (hour >= 5 && hour < 11) timeContext = "Morning (Fresh & Energetic)";
    else if (hour >= 11 && hour < 16) timeContext = "Afternoon (Focused & Calming)";
    else if (hour >= 16 && hour < 21) timeContext = "Late Afternoon/Evening (Chill & Relax)";
    else timeContext = "Late Night (Deep & Soothing)";

    // 3. Lấy kho nhạc ngẫu nhiên
    const allSongs = await Song.aggregate([{ $sample: { size: 50 } }]);

    // 4. Gọi AI với bối cảnh nâng cao
    const recommendedIds = await aiService.getRecommendations({
      genres: user.profile?.genres_interest || [],
      completedSongs,
      skippedSongs,
      timeContext
    }, allSongs);

    // 4. Lấy thông tin chi tiết bài hát từ IDs mà AI trả về
    const recommendations = await Song.find({ _id: { $in: recommendedIds } })
      .populate('artist_ids', 'name');

    res.json({ success: true, data: recommendations });
  } catch (error) {
    console.error("[AI Controller] Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAIPlaylists = async (req, res) => {
  try {
    console.log('>> [AI ROUTE] Hit Playlists for user:', req.user.id);
    const userId = req.user.id;
    const user = await User.findById(userId);

    // Lấy kho nhạc ngẫu nhiên (50 bài)
    const allSongs = await Song.aggregate([{ $sample: { size: 50 } }]);

    // Gọi AI để tạo 6 Daily Mix
    const aiMixes = await aiService.generateDailyMixes(
        user.profile?.genres_interest || [],
        allSongs
    );

    // Map dữ liệu bài hát thật vào các Mix mà AI gợi ý
    // Vì AI chỉ trả về IDs, chúng ta cần fetch bài hát
    const allIdsInMixes = aiMixes.reduce((acc, mix) => [...acc, ...mix.songIds], []);
    const songDataMap = await Song.find({ _id: { $in: allIdsInMixes } })
        .populate('artist_ids', 'name');

    const finalMixes = aiMixes.map(mix => ({
        ...mix,
        tracks: mix.songIds.map(id => songDataMap.find(s => s._id.toString() === id)).filter(Boolean)
    }));

    res.json({ success: true, data: finalMixes });
  } catch (error) {
    console.error("[AI Playlist Controller] Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAIRecommendations, getAIPlaylists };
