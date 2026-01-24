import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from '../screens/Auth/Welcone';
import SignIn from "../screens/Auth/SignIn";
import SignUp from "../screens/Auth/SignUp";
import LogInSDT from "../screens/Auth/LogInSDT";
import PhoneOTP from '../screens/Auth/PhoneOTP';
import LogInEmail from '../screens/Auth/LogInEmail';
import LogInNoEmail from '../screens/Auth/LogInNoEmail';
import ConfirmEmail from '../screens/Auth/ComfirmEmail';
import { RootStackParamList } from "./types";
import MainTabNavigator from './MainTabs';
import LikeSongScreen from '../screens/ItemsMainMusic/LikeSongScreen';
import ChatDetailScreen from '../screens/ChatRoom/ChatDetailScreen';
import MusicPlayerScreen from '../screens/ListeningRoom/MusicPlayerScreen';
import CreateRoomScreen from '../screens/ListeningRoom/CreateListenRoom';
import ListeningRoomScreen from '../screens/ListeningRoom/ListeningRoom';
import ListSongScreen from '../screens/ItemsMainMusic/ListSong';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="SignIn" component={SignIn} />
          <Stack.Screen name="SignUp" component={SignUp} />
          <Stack.Screen name="LogInSDT" component={LogInSDT}/>
          <Stack.Screen name="PhoneOTP" component={PhoneOTP}/>
          <Stack.Screen name="LogInEmail" component={LogInEmail}/>
          <Stack.Screen name="LogInNoEmail" component={LogInNoEmail}/>
          <Stack.Screen name="ConfirmEmail" component={ConfirmEmail}/>
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />
          <Stack.Screen name="Liked" component={LikeSongScreen} />
          <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
          <Stack.Screen name="MusicPlayer" component={MusicPlayerScreen}/>
          <Stack.Screen name="CreateRoom" component={CreateRoomScreen} />
          <Stack.Screen name="ListeningRoom" component={ListeningRoomScreen} />
          <Stack.Screen name="Playlists" component={ListSongScreen} />

          {/* <Stack.Screen name="AIRecommend" component={AIRecommendScreen} />
          <Stack.Screen name="ArtistDetail" component={ArtistDetailScreen} />
          <Stack.Screen name="PlaylistDetail" component={PlaylistDetailScreen} />
          <Stack.Screen name="Playlists" component={PlaylistsScreen} />
          <Stack.Screen name="NowPlaying" component={NowPlayingScreen} /> */}
        </Stack.Navigator>
      </NavigationContainer>
  );
}
