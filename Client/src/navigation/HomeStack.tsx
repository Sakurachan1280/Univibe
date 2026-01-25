import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/Main/HomeScreen';
import ListSongScreen from '../screens/ItemsMainMusic/ListSong';
import LikeSongScreen from '../screens/ItemsMainMusic/LikeSongScreen';
import { RootStackParamList } from './types';

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
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Playlists" component={ListSongScreen} />
            <Stack.Screen name="Liked" component={LikeSongScreen} />
        </Stack.Navigator>
    );
}
