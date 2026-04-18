import axiosClient from "./axiosClient";

export interface Artist {
    _id: string;
    name: string;
    avatar?: string;
}

export interface Song {
    _id: string;
    title: string;
    file_url: string;
    cover_image?: string;
    duration?: number;
    artist_ids: Artist[];
    lyrics?: any;
    created_at?: string;
    isListened?: boolean;
}

export interface LogActionPayload {
    song_id: string;
    action_type: "play" | "pause" | "seek" | "complete" | "skip";
    duration_listened?: number;
    context?: any;
}

const musicAPI = {
    // Lấy thông tin chi tiết bài hát
    getSongDetail: async (songId: string): Promise<Song> => {
        const response = await axiosClient.get(`/music/songs/${songId}`);
        return response.data;
    },

    // Lấy danh sách bài hát ngẫu nhiên
    getRandomSongs: async (limit: number = 20): Promise<Song[]> => {
        const response = await axiosClient.get(`/music/songs/random?limit=${limit}`);
        return response.data;
    },

    // Lấy queue bài hát
    getQueue: async (type?: string): Promise<Song[]> => {
        const response = await axiosClient.get(`/music/queue${type ? `?type=${type}` : ""}`);
        return response.data;
    },

    // Ghi nhận hành động nghe nhạc
    logAction: async (payload: LogActionPayload): Promise<void> => {
        await axiosClient.post("/music/log", payload);
    },

    // Lấy bài hát của nghệ sĩ
    getSongsByArtist: async (artistId: string): Promise<Song[]> => {
        const response = await axiosClient.get(`/music/artists/${artistId}/songs`);
        return response.data;
    },
};

export default musicAPI;
