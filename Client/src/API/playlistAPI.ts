import axiosClient from "./axiosClient";
import { Song } from "./musicAPI";

export interface PlaylistTrack {
    song_id: Song;
    added_at: string;
}

export interface Playlist {
    _id: string;
    name: string;
    description?: string;
    cover_image?: string;
    owner_id: string | { _id: string; username: string };
    is_public: boolean;
    type: "user_created" | "system_mix" | "mood";
    tags: string[];
    artist_id?: string | null;
    tracks: PlaylistTrack[];
    created_at: string;
    updated_at: string;
    // Legacy compat (LibraryScreen dùng .owner và .songs)
    owner?: string;
    songs?: string[];
    isPublic?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

// Lấy tất cả playlists của user (không có tracks, chỉ meta)
export const getMyPlaylists = async (): Promise<Playlist[]> => {
    const response = await axiosClient.get("/playlists");
    return response.data;
};

// Lấy chi tiết playlist kèm danh sách bài hát đã populate
export const getPlaylistDetail = async (id: string): Promise<Playlist> => {
    const response = await axiosClient.get(`/playlists/${id}`);
    return response.data;
};

// Luôn gửi FormData (multer trên backend xử lý)
export const createPlaylist = async (
    name: string,
    description?: string
): Promise<Playlist> => {
    return createPlaylistWithCover(name, description, undefined);
};

export const createPlaylistWithCover = async (
    name: string,
    description: string | undefined,
    coverUri: string | undefined
): Promise<Playlist> => {
    const formData = new FormData();
    formData.append("name", name);
    if (description) formData.append("description", description);
    if (coverUri) {
        const filename = coverUri.split("/").pop() ?? "cover.jpg";
        const ext = filename.split(".").pop()?.toLowerCase() ?? "jpg";
        const type = `image/${ext === "jpg" ? "jpeg" : ext}`;
        formData.append("cover_image", { uri: coverUri, name: filename, type } as any);
    }
    const response = await axiosClient.post("/playlists", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
};


export const updatePlaylist = async (
    id: string,
    data: { name?: string; description?: string; is_public?: boolean }
): Promise<Playlist> => {
    const response = await axiosClient.put(`/playlists/${id}`, data);
    return response.data;
};

export const deletePlaylist = async (id: string): Promise<void> => {
    await axiosClient.delete(`/playlists/${id}`);
};

export const addSongToPlaylist = async (
    playlistId: string,
    songId: string
): Promise<Playlist> => {
    const response = await axiosClient.post(`/playlists/${playlistId}/songs`, {
        songId,
    });
    return response.data;
};

export const removeSongFromPlaylist = async (
    playlistId: string,
    songId: string
): Promise<Playlist> => {
    const response = await axiosClient.delete(
        `/playlists/${playlistId}/songs/${songId}`
    );
    return response.data;
};

// ─── Admin Album helpers (uses playlist infrastructure) ──────────────────────

/**
 * Lấy tất cả album do admin tạo (type = 'system_mix') của user hiện tại
 * Admin phải đăng nhập bằng tài khoản admin để xem.
 */
export const getAdminAlbums = async (): Promise<Playlist[]> => {
    const response = await axiosClient.get("/playlists/system");
    return response.data as Playlist[];
};

/**
 * Tạo album mới (playlist type system_mix) kèm ảnh bìa
 */
export const createAdminAlbum = async (
    name: string,
    description: string | undefined,
    tags: string[],
    coverUri: string | undefined,
    artistId?: string
): Promise<Playlist> => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("type", "system_mix");
    formData.append("is_public", "true");
    if (description) formData.append("description", description);
    tags.forEach(tag => formData.append("tags[]", tag));
    if (artistId) formData.append("artist_id", artistId);
    if (coverUri) {
        const filename = coverUri.split("/").pop() ?? "cover.jpg";
        const ext = filename.split(".").pop()?.toLowerCase() ?? "jpg";
        const type = `image/${ext === "jpg" ? "jpeg" : ext}`;
        formData.append("cover_image", { uri: coverUri, name: filename, type } as any);
    }
    const response = await axiosClient.post("/playlists", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
};

/**
 * Cập nhật thông tin album (tên, mô tả, tags)
 */
export const updateAdminAlbum = async (
    id: string,
    data: { name?: string; description?: string; tags?: string[] }
): Promise<Playlist> => {
    const response = await axiosClient.put(`/playlists/${id}`, data);
    return response.data;
};

/**
 * Xóa album
 */
export const deleteAdminAlbum = async (id: string): Promise<void> => {
    await axiosClient.delete(`/playlists/${id}`);
};

/**
 * Thêm bài hát vào album
 */
export const addSongToAlbum = async (albumId: string, songId: string): Promise<Playlist> => {
    return addSongToPlaylist(albumId, songId);
};

/**
 * Xóa bài hát khỏi album
 */
export const removeSongFromAlbum = async (albumId: string, songId: string): Promise<Playlist> => {
    return removeSongFromPlaylist(albumId, songId);
};

/**
 * Cập nhật ảnh bìa album (gửi file multipart)
 */
export const updateAdminAlbumCover = async (albumId: string, coverUri: string): Promise<Playlist> => {
    const formData = new FormData();
    const filename = coverUri.split("/").pop() ?? "cover.jpg";
    const ext = filename.split(".").pop()?.toLowerCase() ?? "jpg";
    const type = `image/${ext === "jpg" ? "jpeg" : ext}`;
    formData.append("cover_image", { uri: coverUri, name: filename, type } as any);
    const response = await axiosClient.put(`/playlists/${albumId}/cover`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
};

/**
 * Sắp xếp lại thứ tự bài hát trong album
 * @param albumId - ID của album
 * @param orderedSongIds - Mảng song IDs theo thứ tự mới
 */
export const reorderAlbumTracks = async (albumId: string, orderedSongIds: string[]): Promise<Playlist> => {
    const response = await axiosClient.put(`/playlists/${albumId}/reorder`, { orderedSongIds });
    return response.data;
};
/**
 * Toggle lưu/bỏ lưu album vào thư viện
 */
export const toggleSaveAlbum = async (albumId: string): Promise<{ status: 'added' | 'removed' }> => {
    const response = await axiosClient.post("/library/save/album", { albumId });
    return response.data;
};

/**
 * Lấy danh sách album đã lưu vào thư viện
 */
export const getSavedAlbums = async (): Promise<Playlist[]> => {
    const response = await axiosClient.get("/library/saved-albums");
    return response.data;
};

/**
 * Kiểm tra album có trong thư viện chưa
 */
export const checkAlbumSaved = async (albumId: string): Promise<boolean> => {
    const response = await axiosClient.get(`/library/saved-albums/${albumId}`);
    return response.data.saved;
};
