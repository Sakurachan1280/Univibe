const axios = require('axios');
const Song = require('../models/Song');
const Artist = require('../models/Artist');

/**
 * Service xử lý các logic liên quan đến AI (GitHub Models - GPT-4o)
 */
class AIService {
  constructor() {
    this.token = process.env.GITHUB_TOKEN;
    this.endpoint = "https://models.inference.ai.azure.com/chat/completions";
    this.model = "gpt-4o-mini";
  }

  /**
   * Hỏi AI để lấy danh sách ID bài hát dựa trên sở thích và lịch sử
   */
  async getRecommendations(context, allSongs) {
    try {
      if (!this.token) throw new Error("GITHUB_TOKEN is missing");

      const prompt = `
        You are a elite music curator. It is currently ${context.timeContext}.
        User's favorite genres: ${context.genres.join(', ')}.
        Songs they loved (completed): ${context.completedSongs.join(', ')}.
        Songs they disliked (skipped): ${context.skippedSongs.join(', ')}.
        
        Available songs (JSON):
        ${JSON.stringify(allSongs.map(s => ({ id: s._id, t: s.title, g: s.genres.slice(0, 2) })))}

        Task: Select 6 song IDs that:
        1. Match the current time of day vibe (${context.timeContext}).
        2. Are similar to the "loved" songs but avoid "skipped" songs.
        3. Align with their favorite genres.

        Response: Return a JSON array of 6 IDs ONLY. 
        Variety hint: ${context.seed}. Please be creative and ensure different results from previous sessions if possible.
      `;

      const response = await axios.post(this.endpoint, {
        messages: [
          { role: "system", content: "You are a helpful assistant that only returns JSON arrays of IDs." },
          { role: "user", content: prompt }
        ],
        model: this.model,
        temperature: 0.7
      }, {
        headers: { "Authorization": `Bearer ${this.token}`, "Content-Type": "application/json" }
      });

      const content = response.data.choices[0].message.content;
      const match = content.match(/\[.*\]/s);
      let ids = match ? JSON.parse(match[0]) : [];

      // VALIDATE: Đảm bảo các ID trả về tồn tại trong list DB gửi đi
      const validDbIds = new Set(allSongs.map(s => s._id.toString()));
      let finalIds = ids.filter(id => validDbIds.has(id.toString()));

      // Nếu thiếu bài, lấy bù từ list hot songs
      if (finalIds.length < 6 && allSongs.length > 0) {
        const extra = allSongs
          .map(s => s._id.toString())
          .filter(id => !finalIds.includes(id))
          .sort(() => 0.5 - Math.random())
          .slice(0, 6 - finalIds.length);
        finalIds = [...finalIds, ...extra];
      }

      return finalIds;
    } catch (error) {
      console.error("[AI Service] Error:", error.response?.data || error.message);
      // Fallback: Lấy 6 bài ngẫu nhiên từ list DB để UI không bao giờ trống
      if (allSongs && allSongs.length > 0) {
        return allSongs.sort(() => 0.5 - Math.random()).slice(0, 6).map(s => s._id.toString());
      }
      return [];
    }
  }

  /**
   * Tạo 6 Daily Mix Playlists dựa trên AI
   */
  async generateDailyMixes(userPrefs, allSongs, seed) {
    try {
        if (!this.token) throw new Error("GITHUB_TOKEN is missing");

        const hour = new Date().getHours();
        let timeOfDataStr = hour < 12 ? "Buổi Sáng" : hour < 18 ? "Buổi Chiều" : "Buổi Tối";

        const prompt = `
          Group the songs into 6 creative "Daily Mix" (Danh sách phát hàng ngày) playlists.
          Context: ${timeOfDataStr}.
          Interests: ${userPrefs.join(', ')}.
          Songs (JSON list):
          ${JSON.stringify(allSongs.map(s => ({ id: s._id, title: s.title, genres: s.genres.slice(0, 2) })))}
 
          Task: Return 6 playlists with:
          - 'name': Creative title in Vietnamese.
          - 'desc': Description in Vietnamese explaining why these songs were chosen. MUST include the EXACT phrase "Những bài hát này có thể bạn sẽ thích" at the end.
          - 'songIds': 6 matching IDs from the "id" field above (MUST BE ObjectIds, NOT titles).

          Variety hint: ${seed}. Be creative and vary the mix names and song selections.

          Response format: JSON array of 6 objects.
        `;

        const response = await axios.post(this.endpoint, {
          messages: [
            { role: "system", content: "You are a music curator. Return ONLY a valid JSON array." },
            { role: "user", content: prompt }
          ],
          model: this.model
        }, {
          headers: { "Authorization": `Bearer ${this.token}` }
        });

        const content = response.data.choices[0].message.content;
        const match = content.match(/\[.*\]/s);
        const mixes = match ? JSON.parse(match[0]) : [];

        // VALIDATE & FILL: Đảm bảo playlist không bao giờ trống
        const validDbIds = new Set(allSongs.map(s => s._id.toString()));
        
        return mixes.map(mix => {
            // Lọc ID vớ vẩn (AI ảo giác)
            let filteredIds = (mix.songIds || []).filter(id => validDbIds.has(id.toString()));
            
            // Nếu trống hoặc thiếu, lấy bù ngẫu nhiên
            if (filteredIds.length < 4 && allSongs.length > 0) {
                const extra = allSongs
                    .map(s => s._id.toString())
                    .filter(id => !filteredIds.includes(id))
                    .sort(() => 0.5 - Math.random())
                    .slice(0, 6 - filteredIds.length);
                filteredIds = [...filteredIds, ...extra];
            }
            
            return {
                ...mix,
                songIds: filteredIds.slice(0, 10) // Giới hạn số bài mỗi playlist
            };
        });
    } catch (error) {
        console.error("[AI Service Mix] Error:", error.message);
        // Fallback: Tạo playlist giả từ các bài hát có sẵn
        if (allSongs && allSongs.length > 0) {
            return [{
                name: "Gợi ý cho bạn",
                desc: "Tuyển tập những bài hát hay nhất. Những bài hát này có thể bạn sẽ thích",
                songIds: allSongs.sort(() => 0.5 - Math.random()).slice(0, 6).map(s => s._id.toString())
            }];
        }
        return [];
    }
  }
}

module.exports = new AIService();
