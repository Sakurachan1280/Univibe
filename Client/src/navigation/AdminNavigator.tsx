import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

// Screens
import MusicListScreen from "../screens/Admin/AdminSong";
import AlbumListScreen from "../screens/Admin/AdminAlbum";
import AccountScreen from "../screens/Admin/AdminSetting";
import CreateSongScreen from "../screens/Admin/song";
import CreateArtistScreen from "../screens/Admin/artist";
import ArtistManagementScreen from "../screens/Admin/ArtistManagement";
import SongManagementScreen from "../screens/Admin/SongManagement";
import AboutScreen from "../screens/Admin/AboutScreen";
import HelpScreen from "../screens/Setting/HelpScreen";
import SystemLogsScreen from "../screens/Admin/SystemLogsScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const SongStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="SongList"
      component={MusicListScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="CreateSong"
      component={CreateSongScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="CreateArtist"
      component={CreateArtistScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="ArtistManagement"
      component={ArtistManagementScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="SongManagement"
      component={SongManagementScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

const PlaylistStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="AlbumList"
      component={AlbumListScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="ArtistManagement"
      component={ArtistManagementScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="SongManagement"
      component={SongManagementScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="CreateArtist"
      component={CreateArtistScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="CreateSong"
      component={CreateSongScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

const AccountStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="AccountSettings"
      component={AccountScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="AboutScreen"
      component={AboutScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="HelpScreen"
      component={HelpScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="SystemLogsScreen"
      component={SystemLogsScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

export default function AdminNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Content') iconName = focused ? 'grid' : 'grid-outline';
          else if (route.name === 'Library') iconName = focused ? 'library' : 'library-outline';
          else if (route.name === 'Settings') iconName = focused ? 'settings' : 'settings-outline';

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#EC4899',
        tabBarInactiveTintColor: '#B3B3B3',
        tabBarStyle: {
          backgroundColor: '#000000',
          borderTopColor: '#282828',
          borderTopWidth: 1,
          paddingBottom: 12,
          paddingTop: 10,
          height: 80,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Content"
        component={SongStack}
        options={{
          tabBarLabel: 'Nội dung',
        }}
      />
      <Tab.Screen
        name="Library"
        component={PlaylistStack}
        options={{
          tabBarLabel: 'Thư viện',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={AccountStack}
        options={{
          tabBarLabel: 'Cài đặt',
        }}
      />
    </Tab.Navigator>
  );
};