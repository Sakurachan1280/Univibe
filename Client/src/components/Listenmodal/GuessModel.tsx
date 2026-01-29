import React from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface GuestSettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function GuestSettingsModal({ visible, onClose }: GuestSettingsModalProps) {
  const [enabled, setEnabled] = React.useState(true);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* Overlay */}
      <Pressable className="flex-1 justify-end bg-black/70" onPress={onClose}>
        <Pressable
          className="bg-[#1a1a1a] rounded-t-3xl w-full pt-4 pb-8"
          onPress={() => {}}
        >
          {/* Handle bar */}
          <View className="items-center mb-4">
            <View className="w-12 h-1 bg-gray-600 rounded-full" />
          </View>

          {/* Title */}
          <Text className="text-white text-xl font-bold text-center mb-6">
            Cài đặt khách
          </Text>

          {/* Option Row */}
          <TouchableOpacity
            className="flex-row justify-between items-center px-6 py-5 border-t border-gray-800"
            onPress={() => setEnabled(!enabled)}
          >
            <View className="flex-1 pr-4">
              <Text className="text-white text-base font-semibold mb-1">
                Khách có thể thay đổi thứ tự Hàng đợi, phát, tạm dừng và chuyển bài.
              </Text>
            </View>

            {enabled ? (
              <Ionicons name="checkmark-circle" size={28} color="#30D158" />
            ) : (
              <Ionicons name="checkmark-circle-outline" size={28} color="#555" />
            )}
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
