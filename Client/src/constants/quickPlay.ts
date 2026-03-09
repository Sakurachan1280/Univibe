import { RootStackParamList } from "../navigation/types";

type ScreenName = keyof RootStackParamList;

export interface QuickPlayItem {
  title: string;
  screen: ScreenName;
  playlistId?: string;
  artistId?: string;
  albumId?: string;
  icon: string;
  colors: readonly [string, string];
  type?: 'artist' | 'album'; // dùng để đánh dấu slot dynamic
}

export const QUICK_PLAY: QuickPlayItem[] = [
  { title: "Liked Songs", screen: "Liked", icon: "heart", colors: ["#8B5CF6", "#EC4899"] },
  { title: "Nghe Gì Hôm Nay", screen: "Playlists", icon: "sunny", colors: ["#F59E0B", "#EF4444"] },
  { title: "Đang tải...", screen: "ArtistDetail", icon: "person", colors: ["#06B6D4", "#3B82F6"], type: "artist" },
  { title: "Chill", screen: "Playlists", icon: "moon", colors: ["#10B981", "#06B6D4"] },
  { title: "Đang tải...", screen: "AlbumDetail", icon: "disc", colors: ["#EC4899", "#F97316"], type: "album" },
  { title: "Vừa nghe", screen: "RecentPlayed", icon: "radio", colors: ["#6366F1", "#8B5CF6"] },
];