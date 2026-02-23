import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/Main/HomeScreen';
import LikeSongScreen from '../screens/ItemsMainMusic/LikeSongScreen';
import PlaylistsScreen from '../screens/Main/PlaylistsScreen';
import SettingsScreen from '../screens/Profile/Setting';
import { RootStackParamList } from './types';
import NewsScreen from '../screens/Profile/News';
import RecentScreen from '../screens/Profile/Recent';
import ViewProfile from '../screens/Profile/ViewProfile';
import AccountScreen from '../screens/Setting/AccountScreen';
import App from '../../App';
import AppDeviceScreen from '../screens/Setting/AppDeviceScreen';
import AboutScreen from '../screens/Setting/AboutScreen';

// We combine RootStackParamList with a local definition for Home to satisfy usage.
// Note: recursive navigation lookups allow navigating to 'Playlists' even if it's nested here.
type HomeStackParamList = RootStackParamList & {
    Home: undefined;
    Liked: undefined;
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="HomeMain" component={HomeScreen} />
            <Stack.Screen name="Playlists" component={PlaylistsScreen} />
            <Stack.Screen name="Liked" component={LikeSongScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="NewsScreen" component={NewsScreen} />
            <Stack.Screen name="RecentScreen" component={RecentScreen} />
            <Stack.Screen name="ViewProfile" component={ViewProfile} />
            <Stack.Screen name="AccountScreen" component={AccountScreen} />
            <Stack.Screen name="AppDeviceScreen" component={AppDeviceScreen} />
            <Stack.Screen name="AboutScreen" component={AboutScreen} />
        </Stack.Navigator>
    );
}
