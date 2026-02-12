import axiosClient from "./axiosClient";

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
