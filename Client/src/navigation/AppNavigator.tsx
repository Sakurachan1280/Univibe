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
import ChatDetailScreen from '../screens/ChatRoom/ChatDetailScreen';
import ChatScreen from '../screens/ChatRoom/ChatScreen';
import MusicPlayerScreen from '../screens/ListeningRoom/MusicPlayerScreen';
import CreateRoomScreen from '../screens/ListeningRoom/CreateListenRoom';
import ListeningRoomScreen from '../screens/ListeningRoom/ListeningRoom';
import Welcone from '../screens/Auth/Welcone';
import artist from '../screens/Admin/artist';
import ArtistDetailScreen from '../screens/ListeningRoom/ArtistDetailScreen';
import AccountScreen from '../screens/Setting/AccountScreen';
import AdminNavigator from './AdminNavigator';
import RegisterScreen from '../screens/Auth/Register';
import EditProfileScreen from '../screens/Profile/EditProfile';
import NotificationScreen from '../screens/Setting/NotificationScreen';
import HistoryScreen from '../screens/Main/HistoryScreen';
import SettingsScreen from '../screens/Profile/Setting';
import PlaylistsScreen from '../screens/Main/PlaylistsScreen';
import GenrePlaylistScreen from '../screens/ItemsMainMusic/GenrePlaylistScreen';
import AlbumDetailScreen from '../screens/ItemsMainMusic/AlbumDetailScreen';
import UserProfileScreen from '../screens/ChatRoom/UserProfileScreen';


const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="SignIn" component={SignIn} />
        <Stack.Screen name="SignUp" component={SignUp} />
        <Stack.Screen name="LogInSDT" component={LogInSDT} />
        <Stack.Screen name="PhoneOTP" component={PhoneOTP} />
        <Stack.Screen name="LogInEmail" component={LogInEmail} />
        <Stack.Screen name="LogInNoEmail" component={LogInNoEmail} />
        <Stack.Screen name="ConfirmEmail" component={ConfirmEmail} />
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Welcone" component={Welcone} />
        <Stack.Screen name="ChatScreen" component={ChatScreen} />
        <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
        <Stack.Screen
          name="MusicPlayer"
          component={MusicPlayerScreen}
          options={{ presentation: 'transparentModal', animation: 'none' }}
        />
        <Stack.Screen name="CreateRoom" component={CreateRoomScreen} />
        <Stack.Screen name="ListeningRoom" component={ListeningRoomScreen} />
        <Stack.Screen name="artist" component={artist} />
        <Stack.Screen name="ArtistDetail" component={ArtistDetailScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="NotificationScreen" component={NotificationScreen} />
        <Stack.Screen name="AdminNavigator" component={AdminNavigator} />
        <Stack.Screen name="History" component={HistoryScreen} />
        <Stack.Screen name="Playlists" component={PlaylistsScreen} />
        <Stack.Screen name="GenrePlaylist" component={GenrePlaylistScreen} />
        <Stack.Screen name="AlbumDetail" component={AlbumDetailScreen} />
        <Stack.Screen name="UserProfile" component={UserProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
