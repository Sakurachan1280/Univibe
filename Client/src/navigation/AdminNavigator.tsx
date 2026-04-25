import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { AdminThemeProvider, useAdminTheme } from "../context/AdminThemeContext";

// Screens
import MusicListScreen from "../screens/Admin/AdminSong";
import LibraryScreen from "../screens/Admin/AdminLibrary";
import AccountScreen from "../screens/Admin/AdminSetting";
import CreateSongScreen from "../screens/Admin/AddSong";
import CreateArtistScreen from "../screens/Admin/AddArtist";
import ArtistManagementScreen from "../screens/Admin/ArtistManagement";
import SongManagementScreen from "../screens/Admin/SongManagement";
import AdminAlbumManagementScreen from "../screens/Admin/AdminAlbumManagement";
import CreateAlbumScreen from "../screens/Admin/AddAlbum";
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
    <Stack.Screen
      name="AlbumManagement"
      component={AdminAlbumManagementScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="CreateAlbum"
      component={CreateAlbumScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

const LibraryStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="LibraryList"
      component={LibraryScreen}
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
    <Stack.Screen
      name="AlbumManagement"
      component={AdminAlbumManagementScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="CreateAlbum"
      component={CreateAlbumScreen}
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

function AdminTabs() {
  const theme = useAdminTheme();
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
        tabBarInactiveTintColor: theme.isDark ? '#B3B3B3' : '#6B7280',
        tabBarStyle: {
          backgroundColor: theme.tabBarBg,
          borderTopColor: theme.tabBarBorder,
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
        options={{ tabBarLabel: 'Nội dung' }}
      />
      <Tab.Screen
        name="Library"
        component={LibraryStack}
        options={{ tabBarLabel: 'Thư viện' }}
      />
      <Tab.Screen
        name="Settings"
        component={AccountStack}
        options={{ tabBarLabel: 'Cài đặt' }}
      />
    </Tab.Navigator>
  );
}

export default function AdminNavigator() {
  return (
    <AdminThemeProvider>
      <AdminTabs />
    </AdminThemeProvider>
  );
}