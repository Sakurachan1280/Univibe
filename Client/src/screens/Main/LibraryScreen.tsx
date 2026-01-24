import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState, useRef } from "react";
import { PanResponderInstance } from "react-native";
import { PanResponder } from "react-native";
import ProfileMenu from "../../components/ProfileMenu";


export default function LibraryScreen() {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const panResponder = useRef<PanResponderInstance>(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only set responder if swipe is horizontal and significantly larger than vertical movement
        // and swipe is from left to right (dx > 0)
        // AND ONLY if swipe starts from the left edge (x0 < 40)
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
      <View className="flex-row items-center justify-between px-4 py-3">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => setShowProfileMenu(true)}>
            <Image source={require("../../../assets/Icon/ava.jpg")} className="w-10 h-10 rounded-full" />
          </TouchableOpacity>
          <Text className="text-white text-2xl font-bold ml-4">Thư viện</Text>
        </View>

        <View className="flex-row gap-4">
          <Ionicons name="notifications-outline" size={22} color="white" />
          <Ionicons name="time-outline" size={22} color="white" />
          <Ionicons name="settings-outline" size={22} color="white" />
        </View>
      </View>
      {/* PROFILE MENU (CUSTOM – KHÔNG DRAWER) */}
      <ProfileMenu isVisible={showProfileMenu} onClose={() => setShowProfileMenu(false)} />
    </SafeAreaView>
  );
}

