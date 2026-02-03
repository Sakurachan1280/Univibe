 import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

// Screens
import MusicListScreen from "../screens/Admin/AdminSong";
import AlbumListScreen from "../screens/Admin/AdminAlbum";
import AccountScreen from "../screens/Admin/AdminAccount";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const SongStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="SongList" 
      component={MusicListScreen} 
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
  </Stack.Navigator>
);

const AccountStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="AccountSettings" 
      component={AccountScreen} 
      options={{ headerShown: false }} 
    />
  </Stack.Navigator>
);

export default function AdminNavigator() { 
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Song') iconName = 'musical-notes';
          else if (route.name === 'Album') iconName = 'list';
          else if (route.name === 'Account') iconName = 'person';
          
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4fc3dc',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#e0e0e0',
          borderTopWidth: 1,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen 
        name="Song" 
        component={SongStack}
        options={{ headerShown: false }}
      />
      <Tab.Screen 
        name="Album" 
        component={PlaylistStack}
        options={{ headerShown: false }}
      />
      <Tab.Screen 
        name="Account" 
        component={AccountStack}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
};