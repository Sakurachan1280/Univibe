import axiosClient from "./axiosClient";
import { Song } from "./musicAPI";

export interface ListeningHistoryItem {
    _id: string;
    user_id: string;
    song_id: Song;
    action_type: string;
    duration_listened: number;
    context: string;
    timestamp: string;
}

/**
 * Lấy lịch sử nghe nhạc của user
 */
export const getListeningHistory = async (): Promise<ListeningHistoryItem[]> => {
    const response = await axiosClient.get("/library/history");
    return response.data;
};

/**
 * Lấy danh sách bài hát đã like
 */
export const getLikedSongs = async (): Promise<Song[]> => {
    const response = await axiosClient.get("/library/liked-songs");
    return response.data;
};

/**
 * Like/Unlike một bài hát
 * @param songId - ID của bài hát
 * @returns { liked: boolean, message: string }
 */
export const toggleLikeSong = async (songId: string): Promise<{ liked: boolean; message: string }> => {
    const response = await axiosClient.post("/library/like/song", { songId });
    return response.data;
};

