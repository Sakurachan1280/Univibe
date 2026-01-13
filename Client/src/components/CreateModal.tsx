import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function CreateModal({ visible, onClose }: Props) {
  if (!visible) return null;

  return (
    <View className="absolute left-0 right-0 items-center z-[999]" style={{ bottom: 90 }}>
      {/* Khối modal */}
      <View className="w-[400px] bg-[#181818] rounded-2xl px-4 pt-4 pb-6 shadow-lg z-[2]">
        <TouchableOpacity className="flex-row items-center mb-6">
          <View className="w-12 h-12 rounded-full bg-neutral-700 items-center justify-center">
            <Ionicons name="musical-notes-outline" size={24} color="white" />
          </View>
          <View className="ml-4">
            <Text className="text-white text-lg font-semibold">Danh sách phát</Text>
            <Text className="text-gray-400">Tạo danh sách phát gồm bài hát</Text>
          </View>

        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center mb-6">
          <View className="w-12 h-12 rounded-full bg-neutral-700 items-center justify-center">
            <Ionicons name="people-outline" size={24} color="white" />
          </View>
          <View className="ml-4">
            <Text className="text-white text-lg font-semibold">Danh sách phát cộng tác</Text>
            <Text className="text-gray-400">Tạo cùng bạn bè</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center mb-6">
          <View className="w-12 h-12 rounded-full bg-neutral-700 items-center justify-center">
            <Ionicons name="sync-outline" size={24} color="white" />
          </View>
          <View className="ml-4">
            <Text className="text-white text-lg font-semibold">Giai điệu chung</Text>
            <Text className="text-gray-400">Ghép gu nhạc của bạn bè</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center">
          <View className="w-12 h-12 rounded-full bg-neutral-700 items-center justify-center">
            <Ionicons name="radio-outline" size={24} color="white" />
          </View>
          <View className="ml-4">
            <Text className="text-white text-lg font-semibold">Jam</Text>
            <Text className="text-gray-400">Cùng nghe nhạc ở bất cứ đâu</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Click outside để đóng */}
      <TouchableOpacity className="absolute left-0 right-0 z-[1]"
        style={{ top: -500, bottom: 0 }}
        activeOpacity={1}
        onPress={onClose}
      />
    </View>
  );
}
