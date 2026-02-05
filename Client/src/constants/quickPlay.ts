import { RootStackParamList } from "../navigation/types";

type ScreenName = keyof RootStackParamList;

export const QUICK_PLAY: {
  title: string;
  screen: ScreenName;
}[] = [
  { title: "Liked Songs", screen: "Liked" },
  { title: "Nghe Gì Hôm Nay", screen: "Playlists" },
  { title: "Anh Phan", screen: "Playlists" },
  { title: "Chill", screen: "Playlists" },
  { title: "Playlists", screen: "Playlists" },
  { title: "Đang nghe", screen: "Playlists" },
];