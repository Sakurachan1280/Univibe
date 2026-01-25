import React, { useEffect, useRef } from "react";
import { View, TouchableOpacity, Text, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  visible: boolean;
  onClose: () => void;
  onJamPress?: () => void;
}

export default function CreateModal({ visible, onClose, onJamPress }: Props) {
  const slideAnim = useRef(new Animated.Value(200)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // mở
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // đóng
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 200,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 120,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <View
      className="absolute left-0 right-0 z-[999]"
      style={{ bottom: 90 }}
      pointerEvents={visible ? "auto" : "none"} // ngăn chặn chặn tab
    >
      {/* overlay click outside */}
      <Animated.View
        style={{
          opacity: fadeAnim,
        }}
        pointerEvents={visible ? "auto" : "none"}
      >
        <TouchableOpacity
          className="absolute left-0 right-0 top-0 bottom-0"
          activeOpacity={1}
          onPress={onClose}
        />
      </Animated.View>

      {/* modal */}
      <Animated.View
        style={{
          transform: [{ translateY: slideAnim }],
          opacity: fadeAnim,
        }}
        className="mx-auto w-[96%] bg-[#181818] rounded-3xl px-5 pt-5 pb-8 shadow-lg"
      >
        <TouchableOpacity className="flex-row items-center mb-7">
          <View className="w-14 h-14 rounded-full bg-neutral-700 items-center justify-center">
            <Ionicons name="musical-notes-outline" size={28} color="white" />
          </View>
          <View className="ml-4">
            <Text className="text-white text-lg font-semibold">Danh sách phát</Text>
            <Text className="text-gray-400">Tạo danh sách phát gồm bài hát</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center mb-7">
          <View className="w-14 h-14 rounded-full bg-neutral-700 items-center justify-center">
            <Ionicons name="people-outline" size={28} color="white" />
          </View>
          <View className="ml-4">
            <Text className="text-white text-lg font-semibold">Danh sách phát cộng tác</Text>
            <Text className="text-gray-400">Tạo cùng bạn bè</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center mb-7">
          <View className="w-14 h-14 rounded-full bg-neutral-700 items-center justify-center">
            <Ionicons name="sync-outline" size={28} color="white" />
          </View>
          <View className="ml-4">
            <Text className="text-white text-lg font-semibold">Giai điệu chung</Text>
            <Text className="text-gray-400">Ghép gu nhạc của bạn bè</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center" onPress={onJamPress}>
          <View className="w-14 h-14 rounded-full bg-neutral-700 items-center justify-center">
            <Ionicons name="radio-outline" size={28} color="white" />
          </View>
          <View className="ml-4">
            <Text className="text-white text-lg font-semibold">Jam</Text>
            <Text className="text-gray-400">Cùng nghe nhạc ở bất cứ đâu</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
