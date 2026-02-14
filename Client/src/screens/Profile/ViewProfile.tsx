import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppNavigation } from "../../navigation/useAppNavigation";
import { getMeAPI, User } from "../../API/userAPI";
import ShareProfileModal from "../../components/ModalProfile/ShareProfileModal";
import { BASE_URL } from "../../API/axiosClient";

export default function ProfileScreen() {
  const navigation = useAppNavigation();
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const data = await getMeAPI();
      setUserData(data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getAvatarSource = () => {
    if (userData?.profile?.avatar_url) {
      if (userData.profile.avatar_url.startsWith('http')) {
        return { uri: userData.profile.avatar_url };
      } else if (userData.profile.avatar_url.includes('spoti_images')) {
        return { uri: userData.profile.avatar_url };
      } else {
        return { uri: `${BASE_URL}${userData.profile.avatar_url.startsWith('/') ? '' : '/'}${userData.profile.avatar_url}` };
      }
    }
    return require("../../../assets/Icon/ava.jpg");
  };

  const getCoverSource = () => {
    if (userData?.profile?.cover_url) {
      if (userData.profile.cover_url.startsWith('http')) {
        return { uri: userData.profile.cover_url };
      } else if (userData.profile.cover_url.includes('spoti_images')) {
        return { uri: userData.profile.cover_url };
      } else {
        return { uri: `${BASE_URL}${userData.profile.cover_url.startsWith('/') ? '' : '/'}${userData.profile.cover_url}` };
      }
    }
    return null;
  };

  const getDisplayName = () => {
    return userData?.profile?.display_name || userData?.username || "User";
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header with Background */}
        <View className="relative">
          {/* Background */}
          <View className="absolute inset-0 bg-gray-900 h-64">
            {userData?.profile?.cover_url ? (
              <Image
                source={getCoverSource()!}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-full bg-gray-800/60" />
            )}
            <View className="absolute inset-0 bg-black/30" />
          </View>

          {/* Back Button */}
          <TouchableOpacity className="absolute top-4 left-5 w-10 h-10 items-center justify-center z-10" onPress={() => { navigation.goBack(); }}>
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>

          {/* Profile Section */}
          <View className="pt-20 pb-6 px-5">
            {/* Avatar and Info Row */}
            <View className="flex-row items-center mb-6">
              {/* Avatar */}
              <View className="w-28 h-28 rounded-full bg-gray-700 overflow-hidden mr-4">
                {loading ? (
                  <View className="w-full h-full items-center justify-center">
                    <ActivityIndicator size="small" color="#fff" />
                  </View>
                ) : (
                  <Image
                    source={getAvatarSource()}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                )}
              </View>

              {/* Name and Stats */}
              <View className="flex-1">
                <Text className="text-white text-3xl font-bold mb-2">
                  {loading ? "Loading..." : getDisplayName()}
                </Text>
                <Text className="text-gray-300 text-sm">
                  1 người theo dõi • Đang theo dõi 38
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row items-center gap-3">
              <TouchableOpacity className="bg-transparent border border-gray-500 rounded-full px-7 py-2 active:bg-white/10" onPress={() => navigation.navigate("EditProfile")}>
                <Text className="text-white text-sm font-semibold">Chỉnh sửa</Text>
              </TouchableOpacity>

              <TouchableOpacity className="w-9 h-9 bg-transparent items-center justify-center active:bg-white/10" onPress={() => setShowShareModal(true)}>
                <Ionicons name="share-outline" size={24} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity className="w-9 h-9 bg-transparent items-center justify-center active:bg-white/10">
                <Ionicons name="settings-outline" size={24} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity className="w-9 h-9 bg-transparent items-center justify-center active:bg-white/10">
                <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Empty State Section */}
        <View className="items-center px-8 py-16">
          {/* Three Cards Icon Illustration */}
          <View className="flex-row items-center justify-center mb-8 h-32">
            {/* Left Card */}
            <View
              className="w-24 h-32 bg-neutral-800 rounded-2xl items-center justify-center -rotate-12 absolute left-16"
              style={{ transform: [{ rotate: '-15deg' }, { translateX: -20 }] }}
            >
              <Ionicons name="musical-notes" size={40} color="#6B7280" />
            </View>

            {/* Center Card */}
            <View className="w-24 h-32 bg-neutral-800 rounded-2xl items-center justify-center z-10">
              <Ionicons name="person" size={40} color="#6B7280" />
            </View>

            {/* Right Card */}
            <View
              className="w-24 h-32 bg-neutral-800 rounded-2xl items-center justify-center rotate-12 absolute right-16"
              style={{ transform: [{ rotate: '15deg' }, { translateX: 20 }] }}
            >
              <Ionicons name="heart" size={40} color="#6B7280" />
            </View>
          </View>

          {/* Title */}
          <Text className="text-white text-2xl font-bold text-center mb-4">
            Chia sẻ nội dụng bạn thích
          </Text>

          {/* Description */}
          <Text className="text-gray-400 text-base text-center leading-6 mb-8">
            Bật tính năng chia sẻ danh sách phát và nghệ sĩ trên hồ sơ để người khác có thể khám phá nội dung mà bạn thích.
          </Text>

          {/* Settings Button */}
          <TouchableOpacity className="bg-white rounded-full px-8 py-3.5 active:bg-gray-200">
            <Text className="text-black text-base font-semibold">Quản lý cài đặt</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Share Profile Modal */}
      <ShareProfileModal
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        userData={userData}
      />
    </SafeAreaView>
  );
}