import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  Switch,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GuestSettingsModal from './GuessModel';
import JamInviteModal from './InviteModel';

interface JamInfoModalProps {
  isVisible: boolean;
  onClose: () => void;
  onEndJam?: () => void;
}

export default function JamInfoModal({
  isVisible,
  onClose,
  onEndJam,
}: JamInfoModalProps) {
  const [isAutoInviteEnabled, setIsAutoInviteEnabled] = React.useState(true);
  const [showGuestSettings, setShowGuestSettings] = React.useState(false);
  const [showInviteModal, setShowInviteModal] = React.useState(false);

  return (
    <>
      {/* MAIN MODAL */}
      <Modal
        animationType="slide"
        transparent
        visible={isVisible}
        onRequestClose={onClose}
      >
        {/* BACKGROUND OVERLAY */}
        <Pressable
          className="absolute inset-0 bg-black/70"
          onPress={onClose}
        />

        {/* MAIN CONTENT */}
        <View
          style={{ elevation: 20 }}
          className="absolute bottom-0 w-full bg-[#1a1a1a] rounded-t-3xl"
        >
          {/* Handle Bar */}
          <View className="items-center pt-3 pb-4">
            <View className="w-12 h-1 bg-gray-600 rounded-full" />
          </View>

          {/* Title */}
          <View className="px-6 pb-4">
            <Text className="text-white text-xl font-bold text-center">
              Thông tin về Jam
            </Text>
          </View>

          {/* MỜI NGƯỜI KHÁC */}
          <TouchableOpacity
            className="flex-row items-center px-6 py-5 border-t border-gray-800"
            onPress={() => setShowInviteModal(true)}
          >
            <View className="w-14 h-14 bg-neutral-800 rounded-full items-center justify-center mr-4">
              <Ionicons name="add" size={28} color="white" />
            </View>
            <Text className="text-white text-base font-semibold">
              Mời người khác
            </Text>
          </TouchableOpacity>

          {/* Chủ phòng */}
          <View className="flex-row items-center px-6 py-5 border-t border-gray-800">
            <View className="w-14 h-14 rounded-full overflow-hidden mr-4">
              <Image
                source={require('../../../assets/Icon/ava.jpg')}
                className="w-full h-full"
              />
            </View>
            <View className="flex-1">
              <Text className="text-white text-base font-semibold mb-1">
                Sakura
              </Text>
              <Text className="text-gray-400 text-sm">Người tổ chức</Text>
            </View>
          </View>

          {/* AUTO INVITE */}
          <View className="px-6 py-5 border-t border-gray-800">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-pink-600 rounded items-center justify-center mr-3">
                  <Ionicons name="wifi" size={18} color="white" />
                </View>
                <Text className="text-white text-base font-medium">
                  Tự động mời những người ở gần
                </Text>
              </View>

              <Switch
                value={isAutoInviteEnabled}
                onValueChange={setIsAutoInviteEnabled}
                trackColor={{ false: '#3e3e3e', true: '#34c759' }}
                thumbColor="white"
              />
            </View>

            <Text className="text-gray-400 text-sm pl-11">iPhone</Text>

            <Text className="text-gray-400 text-sm leading-5 mt-3">
              Những người kết nối với Wi-Fi của bạn hoặc ở gần đã bật Bluetooth sẽ được mời.
            </Text>
          </View>

          {/* Bottom Buttons */}
          <View className="flex-row px-4 pb-6 pt-4 gap-3 border-t border-gray-800">
            <TouchableOpacity
              className="flex-1 bg-neutral-800 items-center justify-center py-3 rounded-2xl"
              onPress={onEndJam || onClose}
            >
              <View className="flex-row items-center gap-2">
                <Ionicons name="close" size={22} color="white" />
                <Text className="text-white text-sm font-semibold">Kết thúc Jam</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 bg-neutral-800 items-center justify-center py-3 rounded-2xl"
              onPress={() => setShowGuestSettings(true)}
            >
              <View className="flex-row items-center gap-2">
                <Ionicons name="settings-outline" size={22} color="white" />
                <Text className="text-white text-sm font-semibold">Cài đặt khách</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* SUB MODALS OUTSIDE MAIN MODAL */}
      <JamInviteModal
        visible={showInviteModal}
        onClose={() => setShowInviteModal(false)}
      />

      <GuestSettingsModal
        visible={showGuestSettings}
        onClose={() => setShowGuestSettings(false)}
      />
    </>
  );
}
