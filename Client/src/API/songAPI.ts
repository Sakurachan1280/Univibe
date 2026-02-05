import axiosClient from "./axiosClient";

export interface Song {
    _id: string;
    title: string;
    artist: string;
    duration?: string;
    genre?: string;
    audioUrl?: string;
    coverUrl?: string;
}

export const getRandomSongs = async (limit: number = 20): Promise<Song[]> => {
    const response = await axiosClient.get(`/music/songs/random?limit=${limit}`);
    return response.data;
};

export const getAllSongs = async (): Promise<Song[]> => {
    const response = await axiosClient.get('/music/songs');
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
