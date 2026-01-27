import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Image,
  Pressable
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface InviteModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function JamInviteModal({ visible, onClose }: InviteModalProps) {

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* Overlay giống GuestSettingsModal */}
      <Pressable
        className="flex-1 justify-end bg-black/70"
        onPress={onClose}
      >
        {/* Content: Pressable chặn propagation */}
        <Pressable
          className="bg-[#1a1a1a] rounded-t-3xl w-full pt-4 pb-8"
          onPress={() => {}}
        >
          {/* Handle */}
          <View className="items-center mb-4">
            <View className="w-12 h-1 bg-gray-600 rounded-full" />
          </View>

          {/* Title */}
          <Text className="text-white text-xl font-bold text-center mb-4">
            Mời bạn bè tham gia Jam của bạn
          </Text>

          {/* Share Button */}
          <TouchableOpacity className="mx-6 bg-[#1DB954] py-3 rounded-full items-center justify-center mb-6 flex-row">
            <Ionicons name="share-outline" color="white" size={20} />
            <Text className="text-white font-semibold ml-2">
              Chia sẻ liên kết
            </Text>
          </TouchableOpacity>

          {/* Auto Invite Text */}
          <View className="px-6 mt-2">
            <Text className="text-white text-base font-semibold mb-1">
              Tự động mời những người ở gần
            </Text>
            <Text className="text-gray-400 text-sm mb-6">
              Những người kết nối chung Wi-Fi hoặc bật Bluetooth sẽ được mời.
            </Text>
          </View>

          {/* Image */}
          <View className="px-6 flex-row items-center justify-between">
            <View className="flex-1 mr-4">
              <Text className="text-white text-base font-semibold mb-1">
                Hình ảnh cho Jam của bạn
              </Text>
              <Text className="text-gray-400 text-sm">Nhấn để phóng to</Text>
            </View>

            <TouchableOpacity className="p-1 bg-white rounded-lg">
              <Image
                source={require("../../../assets/Icon/ava.jpg")}
                style={{ width: 100, height: 100, borderRadius: 8 }}
              />
            </TouchableOpacity>
          </View>

        </Pressable>
      </Pressable>
    </Modal>
  );
}
