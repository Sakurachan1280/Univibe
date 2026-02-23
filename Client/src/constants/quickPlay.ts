import { RootStackParamList } from "../navigation/types";

type ScreenName = keyof RootStackParamList;

export const QUICK_PLAY: {
  title: string;
  screen: ScreenName;
  playlistId?: string;  // Optional: truyền ID để fetch playlist cụ thể
}[] = [
    { title: "Liked Songs", screen: "Liked" },
    // Các item dưới có thể thêm playlistId khi bạn muốn gắn với playlist thật
    // Ví dụ: { title: "Chill", screen: "Playlists", playlistId: "67a1b2c3d4e5f6a7b8c9d0e1" }
    { title: "Nghe Gì Hôm Nay", screen: "Playlists" },
    { title: "Chipu", screen: "Playlists" },
    { title: "Chill", screen: "Playlists" },
    { title: "Playlists", screen: "Playlists" },
    { title: "Đang nghe", screen: "Playlists" },
  ];