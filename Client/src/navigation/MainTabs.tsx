import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

import HomeScreen from "../screens/Main/HomeScreen";
import SearchScreen from "../screens/Main/SearchScreen";
import LibraryScreen from "../screens/Main/LibraryScreen";
import CreateScreen from "../screens/Main/CreateScreen";
import ChatScreen from "../screens/Main/ChatScreen";

import { MainTabParamList } from "./types";

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarStyle: {
          backgroundColor: "#000",
          borderTopColor: "#222",
          height: 80,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          marginTop: 5,
        },

        tabBarActiveTintColor: "#1DB954",
        tabBarInactiveTintColor: "#aaa",

        tabBarIcon: ({ focused, color }) => {
          let iconName: any;

          switch (route.name) {
            case "Home":
              iconName = focused ? "home" : "home-outline";
              break;
            case "Search":
              iconName = focused ? "search" : "search-outline";
              break;
            case "Library":
              iconName = focused ? "library" : "library-outline";
              break;
            case "Create":
              iconName = focused ? "add-circle" : "add-circle-outline";
              break;
            case "Chat":
              iconName = focused ? "chatbubbles" : "chatbubbles-outline";
              break;
          }

          return <Ionicons name={iconName} size={30} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: "Trang chủ" }} />
      <Tab.Screen name="Search" component={SearchScreen} options={{ title: "Tìm kiếm" }} />
      <Tab.Screen name="Library" component={LibraryScreen} options={{ title: "Thư viện" }} />
      <Tab.Screen name="Create" component={CreateScreen} options={{ title: "Tạo" }} />
      <Tab.Screen name="Chat" component={ChatScreen} options={{ title: "Chat" }} />
    </Tab.Navigator>
  );
}
