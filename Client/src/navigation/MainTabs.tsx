import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import HomeScreen from "../screens/Main/HomeScreen";
import HomeStack from "./HomeStack";
import SearchScreen from "../screens/Main/SearchScreen";
import LibraryScreen from "../screens/Main/LibraryScreen";
import ChatScreen from "../screens/ChatRoom/ChatScreen";
import { useState } from "react";
import CreateModal from "../components/CreatePopUp/CreateModal";
import ListenModal from "../components/Listenmodal/ModalList";
import JamInfoModal from "../components/Listenmodal/JamInfo";
import { MainTabParamList } from "./types";


const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
  const [showCreate, setShowCreate] = useState(false);
  const [showListenModal, setShowListenModal] = useState(false);
  const [showJamInfo, setShowJamInfo] = useState(false);

  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,

          tabBarStyle: {
            backgroundColor: "#000",
            borderTopColor: "#222",
            height: 80,
          },
          tabBarLabelStyle: {
            fontSize: 12,
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
              case "Chat":
                iconName = focused ? "chatbubbles" : "chatbubbles-outline";
                break;

              case "Create":
                // icon đổi thành X khi mở modal
                iconName = showCreate
                  ? "close-circle"
                  : focused
                    ? "add-circle"
                    : "add-circle-outline";
                break;
            }

            return <Ionicons name={iconName} size={30} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeStack} listeners={{ tabPress: () => setShowCreate(false), }} />
        <Tab.Screen name="Search" component={SearchScreen} listeners={{ tabPress: () => setShowCreate(false), }} />
        <Tab.Screen name="Library" component={LibraryScreen} listeners={{ tabPress: () => setShowCreate(false), }} />
        <Tab.Screen name="Chat" component={ChatScreen} listeners={{ tabPress: () => setShowCreate(false), }} />



        <Tab.Screen
          name="Create"
          component={HomeScreen} // dummy
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              setShowCreate((prev) => !prev); // toggle mở/đóng
            },
          }}
        />
      </Tab.Navigator>

      <CreateModal
        visible={showCreate}
        onClose={() => setShowCreate(false)}
        onJamPress={() => {
          setShowCreate(false);
          setShowListenModal(true);
        }}
      />

      <ListenModal
        isVisible={showListenModal}
        onClose={() => setShowListenModal(false)}
        onPressAdd={() => setShowJamInfo(true)}
      />

      <JamInfoModal
        isVisible={showJamInfo}
        onClose={() => setShowJamInfo(false)}
        onEndJam={() => {
          setShowJamInfo(false);
          setShowListenModal(false);
        }}
      />
    </>
  );
}
