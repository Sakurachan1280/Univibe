import axiosClient from "./axiosClient";

export interface Playlist {
    _id: string;
    name: string;
    description?: string;
    owner: string;
    songs: string[];
    isPublic: boolean;
    createdAt: string;
    updatedAt: string;
}

export const getMyPlaylists = async (): Promise<Playlist[]> => {
    const response = await axiosClient.get('/playlists');
    return response.data;
};

export const getPlaylistDetail = async (id: string): Promise<Playlist> => {
    const response = await axiosClient.get(`/playlists/${id}`);
    return response.data;
};

export const createPlaylist = async (name: string, description?: string): Promise<Playlist> => {
    const response = await axiosClient.post('/playlists', { name, description });
    return response.data;
};

export const updatePlaylist = async (id: string, data: { name?: string; description?: string; isPublic?: boolean }): Promise<Playlist> => {
    const response = await axiosClient.put(`/playlists/${id}`, data);
    return response.data;
};

export const deletePlaylist = async (id: string): Promise<void> => {
    await axiosClient.delete(`/playlists/${id}`);
};

export const addSongToPlaylist = async (playlistId: string, songId: string): Promise<Playlist> => {
    const response = await axiosClient.post(`/playlists/${playlistId}/songs`, { songId });
    return response.data;
};

export const removeSongFromPlaylist = async (playlistId: string, songId: string): Promise<Playlist> => {
    const response = await axiosClient.delete(`/playlists/${playlistId}/songs/${songId}`);
    return response.data;
};
