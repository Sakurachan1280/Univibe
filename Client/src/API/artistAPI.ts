import axiosClient from "./axiosClient";
import { Song } from "./musicAPI";

export interface Artist {
    _id: string;
    name: string;
    bio?: string;
    avatar?: string;
    createdAt?: string;
    updatedAt?: string;
}

/**
 * Lấy danh sách tất cả artists
 */
export const getAllArtists = async (): Promise<Artist[]> => {
    const response = await axiosClient.get('/music/artists');
    return response.data;
};

/**
 * Lấy thông tin một artist theo ID
 */
export const getArtistById = async (artistId: string): Promise<Artist> => {
    const response = await axiosClient.get(`/music/artists/${artistId}`);
    return response.data;
};

/**
 * Lấy danh sách bài hát theo artist ID
 */
export const getSongsByArtist = async (artistId: string): Promise<Song[]> => {
    const response = await axiosClient.get(`/music/artists/${artistId}/songs`);
    return response.data;
};

/**
 * Tạo artist mới
 * @param formData - FormData chứa name, bio, và avatar (file)
 */
export const createArtist = async (formData: FormData): Promise<Artist> => {
    const response = await axiosClient.post('/music/artists', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

/**
 * Cập nhật thông tin artist
 * @param id - ID của artist cần cập nhật
 * @param formData - FormData chứa các trường cần cập nhật
 */
export const updateArtist = async (id: string, formData: FormData): Promise<Artist> => {
    const response = await axiosClient.put(`/music/artists/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

/**
 * Xóa artist
 * @param id - ID của artist cần xóa
 */
export const deleteArtist = async (id: string): Promise<void> => {
    await axiosClient.delete(`/music/artists/${id}`);
};
/**
 * Toggle theo dõi / bỏ theo dõi artist
 */
export const toggleFollowArtist = async (artistId: string): Promise<{ status: 'added' | 'removed' }> => {
    const response = await axiosClient.post('/library/follow/artist', { artistId });
    return response.data;
};

/**
 * Lấy danh sách artist đang theo dõi
 */
export const getFollowedArtists = async (): Promise<Artist[]> => {
    const response = await axiosClient.get('/library/followed-artists');
    return response.data;
};

/**
 * Kiểm tra đã theo dõi artist chưa
 */
export const checkArtistFollowed = async (artistId: string): Promise<boolean> => {
    const response = await axiosClient.get(`/library/followed-artists/${artistId}`);
    return response.data.followed;
};
