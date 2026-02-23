import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from "react-native-safe-area-context";
import { CommonActions } from "@react-navigation/native";
import { useAppNavigation } from "../../navigation/useAppNavigation";
import { getMeAPI, User } from '../../API/userAPI';
import { BASE_URL } from '../../API/axiosClient';
import { useMusic } from '../../context/MusicContext';

export default function SettingsScreen() {
  const navigation = useAppNavigation();
  const { stopMusic } = useMusic();
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<User | null>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const data = await getMeAPI();
      setUserData(data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDisplayName = () => {
    return userData?.profile?.display_name || userData?.username || 'User';
  };

  const getAvatarSource = () => {
    if (userData?.profile?.avatar_url) {
      // If avatar_url starts with http, use it directly, otherwise prepend base URL
      if (userData.profile.avatar_url.startsWith('http')) {
        return { uri: userData.profile.avatar_url };
      }
      return { uri: `${BASE_URL}${userData.profile.avatar_url}` };
    }
    return null;
  };

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
          {isLoading ? (
            <View className="w-16 h-16 rounded-full bg-gray-800 items-center justify-center">
              <ActivityIndicator size="small" color="#EC4899" />
            </View>
          ) : (
            <View className="w-16 h-16 rounded-full overflow-hidden border-2 border-pink-500/30 bg-gray-800 items-center justify-center">
              {getAvatarSource() ? (
                <Image
                  source={getAvatarSource()!}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <Ionicons name="person" size={32} color="#666" />
              )}
            </View>
          )}

          <View className="flex-1 ml-4">
            <Text className="text-white text-lg font-semibold">
              {isLoading ? 'Loading...' : getDisplayName()}
            </Text>
            <Text className="text-gray-400 text-sm mt-0.5">Chỉnh sửa hồ sơ</Text>
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
            onPress={() => navigation.navigate("NotificationScreen")}
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
            className="flex-row items-center py-4 px-5 bg-neutral-900/30 border-b border-white/5 active:bg-neutral-800/50"
            onPress={() => navigation.navigate("AboutScreen")}
          >
            <Ionicons name="information-circle-outline" size={24} color="#9CA3AF" />
            <Text className="flex-1 text-white text-base ml-4">Giới thiệu</Text>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </TouchableOpacity>

          {/* Trợ giúp & Hỗ trợ */}
          <TouchableOpacity
            className="flex-row items-center py-4 px-5 bg-neutral-900/30 rounded-b-xl active:bg-neutral-800/50"
            onPress={() => navigation.navigate("HelpScreen")}
          >
            <Ionicons name="help-circle-outline" size={24} color="#9CA3AF" />
            <Text className="flex-1 text-white text-base ml-4">Trợ giúp & Hỗ trợ</Text>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </TouchableOpacity>

        </View>

        {/* Logout Button */}
        <View className="mx-4 mb-8">
          <TouchableOpacity
            className="bg-white rounded-full py-4 px-8 items-center active:bg-gray-200"
            onPress={async () => {
              await stopMusic();
              navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: "Welcone" }] }));
            }}
          >
            <Text className="text-black text-base font-semibold">Đăng xuất</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};
