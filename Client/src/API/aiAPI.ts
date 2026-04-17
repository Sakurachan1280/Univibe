import axiosClient from "./axiosClient";
import { Song } from "./musicAPI";

export interface AIMix {
    name: string;
    desc: string;
    tracks: Song[];
}

/**
 * Láy danh sách 6 bài hát do AI gợi ý
 */
export const getAIRecommendations = async (): Promise<Song[]> => {
    try {
        const res = await axiosClient.get("/ai/recommendations");
        return res.data.success ? res.data.data : [];
    } catch (error) {
        console.error("[aiAPI] getAIRecommendations error:", error);
        return [];
    }
};

/**
 * Lấy danh sách 6 Daily Mix do AI tạo
 */
export const getAIPlaylists = async (): Promise<AIMix[]> => {
    try {
        const res = await axiosClient.get("/ai/playlists");
        return res.data.success ? res.data.data : [];
    } catch (error) {
        console.error("[aiAPI] getAIPlaylists error:", error);
        return [];
    }
};
