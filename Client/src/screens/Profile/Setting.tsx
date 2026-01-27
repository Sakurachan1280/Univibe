import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

export default function SettingsScreen() {
    const menuItems: Array<{ id: number; title: string; icon: React.ComponentProps<typeof Ionicons>['name'] }> = [
        { id: 1, title: 'Tài khoản', icon: 'person-outline' },
        { id: 2, title: 'Tiết kiệm dữ liệu và ngoại tuyến', icon: 'save-outline' },
        { id: 3, title: 'Phát lại', icon: 'play-circle-outline' },
        { id: 4, title: 'Nội dung và chế độ hiển thị', icon: 'color-palette-outline' },
        { id: 5, title: 'Quyền riêng tư và các tính năng xã hội', icon: 'lock-closed-outline' },
        { id: 6, title: 'Chất lượng nội dung nghe nhìn', icon: 'musical-notes-outline' },
        { id: 7, title: 'Thông báo', icon: 'notifications-outline' },
        { id: 8, title: 'Ứng dụng và thiết bị', icon: 'phone-portrait-outline' },
        { id: 9, title: 'Giới thiệu', icon: 'information-circle-outline' },
    ];
    const navigation = useNavigation();
  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-neutral-900/95">
        <TouchableOpacity 
          className="w-10 h-10 items-center justify-center rounded-full bg-white/10 active:bg-white/20"
          onPress={() => { navigation.goBack(); }}
        >
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text className="flex-1 text-white text-xl font-semibold text-center mr-10">
          Cài đặt
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <TouchableOpacity 
          className="flex-row items-center mx-4 mt-5 mb-3 p-4 bg-neutral-900/50 rounded-2xl border border-white/10 active:bg-neutral-800/70"
        >
          <View className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-pink-500 items-center justify-center">
            <Image
              source={require("../../../assets/Icon/ava.jpg")}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>
          <View className="flex-1 ml-4">
            <Text className="text-white text-lg font-semibold">Sakura</Text>
            <Text className="text-gray-400 text-sm mt-0.5">Xem Hồ sơ</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Menu Items */}
        <View className="mx-4 mb-6">
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              className={`flex-row items-center py-4 px-5 bg-neutral-900/30 active:bg-neutral-800/50 ${
                index === 0 ? 'rounded-t-xl' : ''
              } ${
                index === menuItems.length - 1 ? 'rounded-b-xl' : 'border-b border-white/5'
              }`}
            >
              <Ionicons name={item.icon} size={24} color="#9CA3AF" />
              <Text className="flex-1 text-white text-base ml-4">{item.title}</Text>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <View className="mx-4 mb-8">
          <TouchableOpacity className="bg-white rounded-full py-4 px-8 items-center active:bg-gray-200">
            <Text className="text-black text-base font-semibold">Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

