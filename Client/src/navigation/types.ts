export type RootStackParamList = {
  Login: undefined;
  SignIn: undefined;
  SignUp: undefined;
  LogInSDT: undefined;
  PhoneOTP: undefined;
  LogInEmail: undefined;
  LogInNoEmail: undefined;
  ConfirmEmail: undefined;
  MainTabs: undefined;
  Liked: undefined;
  AIRecommend: undefined;
  ArtistDetail: undefined;
  PlaylistDetail: undefined;
  Playlists: undefined;
  NowPlaying: undefined;
  ChatDetail: { userId: string };
  MusicPlayer: { song?: any };

  CreateRoom: undefined;
  ListeningRoom: undefined;
  HomeMain: undefined;
  Settings: undefined;
  NewsScreen: undefined;
  RecentScreen: undefined;
  ViewProfile: undefined;
  artist: undefined;
  Welcone: undefined;
  AccountScreen: undefined;
  AppDeviceScreen: undefined;
  AboutScreen: undefined;
  AdminNavigator: undefined;
  ChatScreen: undefined;
  Register: undefined;
  EditProfile: undefined;
  NotificationScreen: undefined;
  CreateArtist: undefined;
  CreateSong: undefined;
  CreatePlaylist: undefined;
  HelpScreen: undefined;
  SystemLogsScreen: undefined;
  AdminAccount: undefined;
};
export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Library: undefined;
  Chat: undefined;
  Create: undefined;
};

export type AdminTabParamList = {
  AdminAccount: undefined;
  AboutScreen: undefined;
  HelpScreen: undefined;
  SystemLogsScreen: undefined;
};
