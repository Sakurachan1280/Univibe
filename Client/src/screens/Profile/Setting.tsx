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
import { useAppNavigation } from "../../navigation/useAppNavigation";

export default function SettingsScreen() {
  const navigation = useAppNavigation();

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-neutral-900/95">
        <TouchableOpacity
          className="w-10 h-10 items-center justify-center rounded-full bg-white/10 active:bg-white/20"
          onPress={() => navigation.goBack()}
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
          onPress={() => navigation.navigate("ViewProfile")}
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

        <View className="mx-4 mb-6">

          {/* Tài khoản */}
          <TouchableOpacity
            className="flex-row items-center py-4 px-5 bg-neutral-900/30 rounded-t-xl border-b border-white/5 active:bg-neutral-800/50"
            onPress={() => navigation.navigate("AccountScreen")}
          >
            <Ionicons name="person-outline" size={24} color="#9CA3AF" />
            <Text className="flex-1 text-white text-base ml-4">Tài khoản</Text>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </TouchableOpacity>

          {/* Thông báo */}
          <TouchableOpacity
            className="flex-row items-center py-4 px-5 bg-neutral-900/30 border-b border-white/5 active:bg-neutral-800/50"
            onPress={() => navigation.navigate("")}
          >
            <Ionicons name="notifications-outline" size={24} color="#9CA3AF" />
            <Text className="flex-1 text-white text-base ml-4">Thông báo</Text>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </TouchableOpacity>

          {/* Ứng dụng & thiết bị */}
          <TouchableOpacity
            className="flex-row items-center py-4 px-5 bg-neutral-900/30 border-b border-white/5 active:bg-neutral-800/50"
            onPress={() => navigation.navigate("AppDeviceScreen")}
          >
            <Ionicons name="phone-portrait-outline" size={24} color="#9CA3AF" />
            <Text className="flex-1 text-white text-base ml-4">Ứng dụng và thiết bị</Text>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </TouchableOpacity>

          {/* Giới thiệu */}
          <TouchableOpacity
            className="flex-row items-center py-4 px-5 bg-neutral-900/30 rounded-b-xl active:bg-neutral-800/50"
            onPress={() => navigation.navigate("AboutScreen")}
          >
            <Ionicons name="information-circle-outline" size={24} color="#9CA3AF" />
            <Text className="flex-1 text-white text-base ml-4">Giới thiệu</Text>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </TouchableOpacity>

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
