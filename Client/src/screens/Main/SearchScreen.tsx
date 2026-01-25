import { View, Text, TextInput, Image, Keyboard, Pressable, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState, useRef } from "react";
import { PanResponderInstance } from "react-native";
import { PanResponder } from "react-native";
import ProfileMenu from "../../components/ModelProfile/ProfileMenu";

export default function SearchScreen() {
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
    <Pressable onPress={Keyboard.dismiss} style={{ flex: 1 }}>
      <SafeAreaView className="flex-1 bg-black" edges={["top"]}>
        {/* HEADER */}
        <View className="flex-row items-center justify-between px-4 py-3">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => setShowProfileMenu(true)}>
              <Image source={require("../../../assets/Icon/ava.jpg")} className="w-10 h-10 rounded-full" />
            </TouchableOpacity>
            <Text className="text-white text-2xl font-bold ml-4">
              Tìm kiếm
            </Text>
          </View>

          <View className="flex-row gap-4">
            <Ionicons name="notifications-outline" size={22} color="white" />
            <Ionicons name="time-outline" size={22} color="white" />
            <Ionicons name="settings-outline" size={22} color="white" />
          </View>
        </View>

        {/* SEARCH INPUT */}
        <View className="px-5 mt-4">
          <View className="flex-row items-center bg-neutral-800 rounded-md px-3 py-4">
            <Ionicons name="search-outline" size={20} color="#aaa" />

            <TextInput
              placeholder="Bạn muốn nghe gì?"
              placeholderTextColor="#aaa"
              className=" text-white ml-3 text-xl flex-1 leading-tight"
              returnKeyType="search"
            />
          </View>
        </View>
        {/* PROFILE MENU (CUSTOM – KHÔNG DRAWER) */}
        <ProfileMenu isVisible={showProfileMenu} onClose={() => setShowProfileMenu(false)} />
      </SafeAreaView>
    </Pressable>
  );
}
