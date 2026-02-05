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
