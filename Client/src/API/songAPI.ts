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

export const getSongsByGenre = async (genre: string, limit: number = 30): Promise<Song[]> => {
    const response = await axiosClient.get(`/music/songs/genre?genre=${encodeURIComponent(genre)}&limit=${limit}`);
    return response.data;
};

export const getAllSongs = async (): Promise<Song[]> => {
    // /songs/all trả về toàn bộ bài hát không giới hạn (dùng cho admin)
    const response = await axiosClient.get('/music/songs/all');
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

/**
 * Kiểm tra xem bài hát đã tồn tại chưa (dựa trên title và artist_ids)
 * So sánh title (case-insensitive, trim spaces) và artist IDs
 * @param title - Tên bài hát cần kiểm tra
 * @param artistIds - Mảng ID của các ca sĩ
 * @returns Object chứa isDuplicate (true nếu trùng) và existingSong (bài hát trùng nếu có)
 */
export const checkDuplicateSong = async (
    title: string,
    artistIds: string[]
): Promise<{ isDuplicate: boolean; existingSong?: Song }> => {
    try {
        // Lấy tất cả bài hát từ server
        const allSongs = await getAllSongs();

        // Chuẩn hóa title để so sánh (lowercase, trim spaces)
        const normalizedTitle = title.trim().toLowerCase();

        // Sắp xếp artistIds để so sánh chính xác
        const sortedArtistIds = [...artistIds].sort();

        // Tìm bài hát trùng
        const duplicateSong = allSongs.find((song) => {
            // So sánh title (case-insensitive)
            const songTitleMatch = song.title.trim().toLowerCase() === normalizedTitle;

            if (!songTitleMatch) return false;

            // Lấy artist IDs từ song
            const songArtistIds = song.artist_ids?.map(a => a._id) || [];
            const sortedSongArtistIds = [...songArtistIds].sort();

            // So sánh artist IDs (phải giống hệt)
            const artistsMatch =
                sortedArtistIds.length === sortedSongArtistIds.length &&
                sortedArtistIds.every((id, index) => id === sortedSongArtistIds[index]);

            return artistsMatch;
        });

        return {
            isDuplicate: !!duplicateSong,
            existingSong: duplicateSong,
        };
    } catch (error) {
        console.error('Error checking duplicate song:', error);
        // Nếu có lỗi khi check, cho phép tạo bài hát (fail-safe)
        return { isDuplicate: false };
    }
};
