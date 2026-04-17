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
    this.model = "gpt-4o";
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
        
        Available songs in DB (JSON):
        ${JSON.stringify(allSongs.map(s => ({ id: s._id, title: s.title, genres: s.genres, artist: s.artist })))}

        Task: Select 6 song IDs that:
        1. Match the current time of day vibe (${context.timeContext}).
        2. Are similar to the "loved" songs but avoid "skipped" songs.
        3. Align with their favorite genres.

        Response: Return a JSON array of 6 IDs ONLY.
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
      // Trích xuất mảng JSON từ text (đề phòng AI trả về Markdown)
      const match = content.match(/\[.*\]/s);
      return match ? JSON.parse(match[0]) : [];
    } catch (error) {
      console.error("[AI Service] Error:", error.response?.data || error.message);
      return [];
    }
  }

  /**
   * Tạo 6 Daily Mix Playlists dựa trên AI
   */
  async generateDailyMixes(userPrefs, allSongs) {
    try {
        if (!this.token) throw new Error("GITHUB_TOKEN is missing");

        const hour = new Date().getHours();
        let timeOfDataStr = hour < 12 ? "Buổi Sáng" : hour < 18 ? "Buổi Chiều" : "Buổi Tối";

        const prompt = `
          Group the songs into 6 highly creative "Daily Mix" playlists.
          The context is: ${timeOfDataStr}.
          User's interests: ${userPrefs.join(', ')}.
          Songs (JSON):
          ${JSON.stringify(allSongs.map(s => ({ id: s._id, title: s.title, genres: s.genres })))}

          Task: Return 6 playlists with:
          - 'name': Highly creative Vietnamese title (e.g. "Giai điệu bình minh", "Năng lượng tích cực", "Sâu lắng đêm khuya").
          - 'desc': Soulful description.
          - 'songIds': 3-5 matching IDs.

          Response format: Clean JSON array of 6 objects.
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
        return match ? JSON.parse(match[0]) : [];
    } catch (error) {
        console.error("[AI Service Mix] Error:", error.message);
        return [];
    }
  }
}

module.exports = new AIService();
