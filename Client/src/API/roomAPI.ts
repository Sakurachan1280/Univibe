import axiosClient from "./axiosClient";

export interface JamRoom {
  _id: string;
  name: string;
  host_id: string;
  participants: string[];
  current_song?: {
    song_id?: string;
    title?: string;
    cover_url?: string;
    file_url?: string;
    artist?: string;
  };
  playback_state?: {
    status: 'playing' | 'paused';
    current_time: number;
  };
  settings?: {
    guest_can_control: boolean;
  };
  queue?: Array<{
    _id?: string;
    title: string;
    cover_image?: string;
    file_url?: string;
    artist_ids?: Array<{ _id: string; name: string }>;
  }>;
  is_active: boolean;
  created_at: string;
}

/**
 * Tạo phòng Jam mới (host)
 * @param name  - Tên phòng (hiển thị)
 * @param songId - (optional) bài đang phát để seed current_song
 */
export const createRoomAPI = async (
  name: string,
  songId?: string
): Promise<JamRoom> => {
  const res = await axiosClient.post("/rooms", { name, songId });
  return res.data;
};

/**
 * Lấy chi tiết phòng Jam
 */
export const getRoomAPI = async (roomId: string): Promise<JamRoom> => {
  const res = await axiosClient.get(`/rooms/${roomId}`);
  return res.data;
};

/**
 * Mời bạn bè vào phòng qua REST (gửi push notification)
 */
export const inviteToRoomAPI = async (
  roomId: string,
  friendId: string
): Promise<void> => {
  await axiosClient.post(`/rooms/${roomId}/invite`, { friendId });
};
