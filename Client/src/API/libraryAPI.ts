import axiosClient from "./axiosClient";
import { Song } from "./musicAPI";

export interface ListeningHistoryItem {
    _id: string;
    user_id: string;
    song_id: Song;
    action_type: string;
    duration_listened: number;
    context: string;
    timestamp: string;
}

export const getListeningHistory = async (): Promise<ListeningHistoryItem[]> => {
    const response = await axiosClient.get("/library/history");
    return response.data;
};
