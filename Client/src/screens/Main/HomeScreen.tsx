import React, { useState } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import { QUICK_PLAY } from "../../constants/quickPlay";
import ProfileMenu from "../../components/ModalProfile/ProfileMenu";
import { useRef } from "react";
import { PanResponder, PanResponderInstance } from "react-native";

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const panResponder = useRef<PanResponderInstance>(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return (
          Math.abs(gestureState.dx) > 30 &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) &&
          gestureState.dx > 0 &&
          gestureState.x0 < 25);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > 50) {
          setShowProfileMenu(true);
        }
      },
    })
  ).current;

  return (
    <SafeAreaView className="flex-1 bg-black" edges={["top"]}>
      <View {...panResponder.panHandlers} style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 20, zIndex: 50, }} />
      {/* HEADER */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => setShowProfileMenu(true)}>
            <Image source={require("../../../assets/Icon/ava.jpg")} className="w-10 h-10 rounded-full" />
          </TouchableOpacity>
          <Text className="text-white text-2xl font-bold ml-4"> Welcome back</Text>
        </View>

        <View className="flex-row gap-4">
          <Ionicons name="notifications-outline" size={22} color="white" />
          <Ionicons name="time-outline" size={22} color="white" />
          <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
            <Ionicons name="settings-outline" size={22} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* CONTENT */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* QUICK PLAY */}
        <View className="flex-row flex-wrap px-4 gap-3 justify-between">
          {QUICK_PLAY.map((item, index) => (
            <TouchableOpacity
              key={index}
              activeOpacity={0.7}
              onPress={() => navigation.navigate(item.screen)}
              className="w-[48%] bg-neutral-800 rounded-md flex-row items-center"
            >
              <View className="w-14 h-14 bg-green-500 rounded-l-md" />
              <Text className="text-white ml-3 font-semibold">
                {item.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* SECTIONS */}
        {[
          {
            title: "Nghe lại",
            desc: "Spotichat AI chọn nhạc theo gu của bạn",
          },
          {
            title: "Đề xuất cho bạn",
            desc: "Spotichat AI tạo playlist theo gu của bạn",
          },
          {
            title: "AI gợi ý nhạc cho bạn",
            desc: "Spotichat AI chọn nhạc theo năm",
          },
          {
            title: "AI tạo playlist cho bạn",
            desc: "Spotichat AI chọn nhạc theo gu của bạn",
          },
          {
            title: "Playlist thịnh hành trong năm",
            desc: "Spotichat AI chọn nhạc theo gu của bạn",
          },
        ].map((section, idx) => (
          <View key={idx} className="mt-6">
            <Text className="text-white text-2xl font-bold px-4 mb-3">
              {section.title}
            </Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-4 px-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <View
                    key={i}
                    className="w-44 bg-neutral-900 rounded-lg p-3"
                  >
                    <View className="w-full h-36 bg-neutral-700 rounded-md mb-2" />
                    <Text
                      className="text-white font-semibold"
                      numberOfLines={1}
                    >
                      Daily Mix {i}
                    </Text>
                    <Text
                      className="text-gray-400 text-xs"
                      numberOfLines={2}
                    >
                      {section.desc}
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        ))}
      </ScrollView>

      {/* PROFILE MENU (CUSTOM – KHÔNG DRAWER) */}
      <ProfileMenu isVisible={showProfileMenu} onClose={() => setShowProfileMenu(false)} />
    </SafeAreaView>
  );
}
