import axiosClient from "./axiosClient";

export interface Song {
    _id: string;
    title: string;
    artist: string;
    duration?: string | number;
    genre?: string;
    audioUrl?: string;
    coverUrl?: string;
    // API actual fields
    cover_image?: string;
    file_url?: string;
    artist_ids?: Array<{
        _id: string;
        name: string;
        avatar?: string;
    }>;
    stats?: {
        play_count: number;
        like_count: number;
    };
}

export const getRandomSongs = async (limit: number = 20): Promise<Song[]> => {
    const response = await axiosClient.get(`/music/songs/random?limit=${limit}`);
    return response.data;
};

export const getAllSongs = async (): Promise<Song[]> => {
    // Server không có endpoint /songs, sử dụng /queue thay thế
    const response = await axiosClient.get('/music/queue');
    return response.data;
};

export const searchSongs = async (query: string): Promise<Song[]> => {
    const response = await axiosClient.get(`/music/songs/search?q=${encodeURIComponent(query)}`);
    return response.data;
};

export const getSongById = async (id: string): Promise<Song> => {
    const response = await axiosClient.get(`/music/songs/${id}`);
    return response.data;
};

/**
 * Lấy queue songs (danh sách bài hát mới hoặc theo type)
 * @param type - Loại queue (vd: 'new')
 */
export const getQueueSongs = async (type?: string): Promise<Song[]> => {
    const url = type ? `/music/queue?type=${type}` : '/music/queue';
    const response = await axiosClient.get(url);
    return response.data;
};

/**
 * Tạo song mới
 * @param formData - FormData chứa thông tin bài hát và file
 */
export const createSong = async (formData: FormData): Promise<Song> => {
    const response = await axiosClient.post('/music/songs', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

/**
 * Cập nhật thông tin song
 * @param id - ID của song cần cập nhật
 * @param formData - FormData chứa các trường cần cập nhật
 */
export const updateSong = async (id: string, formData: FormData): Promise<Song> => {
    const response = await axiosClient.put(`/music/songs/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

/**
 * Xóa song
 * @param id - ID của song cần xóa
 */
export const deleteSong = async (id: string): Promise<void> => {
    await axiosClient.delete(`/music/songs/${id}`);
};
