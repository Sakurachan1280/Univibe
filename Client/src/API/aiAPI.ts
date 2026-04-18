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
export const getAIRecommendations = async (refresh = false): Promise<Song[]> => {
    try {
        const res = await axiosClient.get(`/ai/recommendations${refresh ? '?refresh=true' : ''}`);
        if (res?.data?.success && Array.isArray(res.data.data)) {
            return res.data.data;
        }
        return [];
    } catch (error) {
        return [];
    }
};

/**
 * Lấy danh sách 6 Daily Mix do AI tạo
 */
export const getAIPlaylists = async (refresh = false): Promise<AIMix[]> => {
    try {
        const res = await axiosClient.get(`/ai/playlists${refresh ? '?refresh=true' : ''}`);
        if (res?.data?.success && Array.isArray(res.data.data)) {
            return res.data.data;
        }
        return [];
    } catch (error) {
        return [];
    }
};
