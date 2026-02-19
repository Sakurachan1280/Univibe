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

export const createPlaylist = async (
    name: string,
    description?: string
): Promise<Playlist> => {
    const response = await axiosClient.post("/playlists", { name, description });
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
