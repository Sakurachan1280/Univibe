import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSocket } from '../../context/SocketContext';

interface GuestSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  /** Room ID để emit cài đặt lên socket */
  roomId?: string;
  /**
   * Giá trị khởi tạo từ parent (JamInfo giữ state và truyền xuống).
   * DEFAULT = false (khách không được điều khiển theo mặc định).
   */
  initialGuestCanControl?: boolean;
  /** Callback để parent cập nhật state khi giá trị thay đổi */
  onChanged?: (value: boolean) => void;
}

export default function GuestSettingsModal({
  visible,
  onClose,
  roomId,
  initialGuestCanControl = false,   // ← mặc định TẮT
  onChanged,
}: GuestSettingsModalProps) {
  const { socket, currentUserId } = useSocket();

  // ── State ─────────────────────────────────────────────────────────────
  const [guestCanControl, setGuestCanControl] = useState(initialGuestCanControl);

  // Sync với prop CHỈ KHI prop thay đổi (không reset khi đóng/mở lại)
  useEffect(() => {
    setGuestCanControl(initialGuestCanControl);
  }, [initialGuestCanControl]);

  // ── Toggle + emit cài đặt lên server ──────────────────────────────────
  const handleToggle = () => {
    const newValue = !guestCanControl;
    setGuestCanControl(newValue);
    onChanged?.(newValue); // báo parent lưu lại

    if (socket && roomId && currentUserId) {
      socket.emit('room_update_settings', {
        roomId,
        hostId: currentUserId,
        settings: { guestCanControl: newValue },
      });
      console.log(
        `[GuestSettings] guestCanControl → ${newValue} (room: ${roomId})`
      );
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* Overlay */}
      <Pressable
        className="flex-1 justify-end bg-black/70"
        onPress={onClose}
      >
        <Pressable
          className="bg-[#1a1a1a] rounded-t-3xl w-full pt-4 pb-8"
          onPress={() => { }}
        >
          {/* Handle bar */}
          <View className="items-center mb-4">
            <View className="w-12 h-1 bg-gray-600 rounded-full" />
          </View>

          {/* Title */}
          <Text className="text-white text-xl font-bold text-center mb-6">
            Cài đặt khách
          </Text>

          {/* Option: Khách kiểm soát nhạc */}
          <TouchableOpacity
            className="flex-row justify-between items-center px-6 py-5 border-t border-gray-800"
            onPress={handleToggle}
            activeOpacity={0.7}
          >
            <View className="flex-1 pr-4">
              <Text className="text-white text-base font-semibold mb-1">
                Khách có thể thay đổi thứ tự Hàng đợi, phát, tạm dừng và chuyển bài.
              </Text>
              <Text className="text-gray-400 text-sm">
                {guestCanControl
                  ? 'Khách có thể điều khiển nhạc'
                  : 'Chỉ người tổ chức điều khiển'}
              </Text>
            </View>

            {guestCanControl ? (
              <Ionicons name="checkmark-circle" size={28} color="#30D158" />
            ) : (
              <Ionicons name="checkmark-circle-outline" size={28} color="#555" />
            )}
          </TouchableOpacity>

          {/* Info row */}
          <View className="px-6 py-4 border-t border-gray-800">
            <View className="flex-row items-start gap-3">
              <Ionicons
                name="information-circle-outline"
                size={20}
                color="#888"
                style={{ marginTop: 2 }}
              />
              <Text className="text-gray-400 text-sm flex-1 leading-5">
                Khi bật, tất cả thành viên trong Jam đều có thể phát, tạm dừng
                và chuyển bài. Khi tắt, chỉ người tổ chức có quyền điều khiển.
              </Text>
            </View>
          </View>

          {/* Done button */}
          <View className="px-6 pt-2">
            <TouchableOpacity
              onPress={onClose}
              className="bg-[#EC4899] py-3 rounded-full items-center"
            >
              <Text className="text-white font-bold text-base">Xong</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
