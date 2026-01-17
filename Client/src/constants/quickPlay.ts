import { RootStackParamList } from "../navigation/types";

type ScreenName = keyof RootStackParamList;

export const QUICK_PLAY: {
  title: string;
  screen: ScreenName;
}[] = [
  { title: "Liked Songs", screen: "Liked" },
  { title: "Spotichat AI", screen: "AIRecommend" },
  { title: "Anh Phan", screen: "ArtistDetail" },
  { title: "Chill", screen: "PlaylistDetail" },
  { title: "Playlists", screen: "Playlists" },
  { title: "Đang nghe", screen: "NowPlaying" },
];