import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

type PlaylistItem = {
  id: number;
  title: string;
  subtitle: string;
  hasCheckmark: boolean;
  hasChevron?: boolean;
};

export default function RecentScreen() {
  const navigation = useNavigation();
  const todayPlaylists: PlaylistItem[] = [
    {
      id: 1,
      title: 'Chill guys',
      subtitle: 'Đã phát 2 bài hát • Danh sách phát • Sakura',
      hasCheckmark: false,
    },
    {
      id: 2,
      title: 'Tuyển tập nhạc thư giãn',
      subtitle: 'Đã phát 1 bài hát • Danh sách phát • Spotify',
      hasCheckmark: false,
    },
  ];

  const yesterdayPlaylists: PlaylistItem[] = [
    {
      id: 3,
      title: 'Chill guys',
      subtitle: 'Đã thêm 3 bài hát',
      hasCheckmark: true,
      hasChevron: false,
    },
    {
      id: 4,
      title: 'Chill guys',
      subtitle: 'Đã thêm danh sách phát',
      hasCheckmark: true,
      hasChevron: true,
    },
    {
      id: 5,
      title: 'My Playlist #13',
      subtitle: 'Đã phát 3 bài hát • Danh sách phát • Sakura',
      hasCheckmark: false,
    },
    {
      id: 6,
      title: 'Full',
      subtitle: 'Đã phát 5 bài hát • Danh sách phát • Sakura',
      hasCheckmark: false,
    },
    {
      id: 7,
      title: 'My Playlist #13',
      subtitle: 'Đã thêm 12 bài hát',
      hasCheckmark: true,
    },
  ];

  const renderPlaylistItem = (item: PlaylistItem) => (
    <TouchableOpacity
      key={item.id}
      className="flex-row items-center py-3 px-5 active:bg-neutral-800/50"
    >
      <View className="w-16 h-16 bg-gray-700 rounded-lg mr-4" />

      <View className="flex-1">
        <Text className="text-white text-base font-medium mb-1">
          {item.title}
        </Text>
        <View className="flex-row items-center">
          {item.hasCheckmark && (
            <Ionicons name="checkmark-circle" size={14} color="#EC4899" style={{ marginRight: 6 }} />
          )}
          <Text className="text-gray-400 text-sm flex-1" numberOfLines={1}>
            {item.subtitle}
          </Text>
        </View>
      </View>

      {item.hasChevron ? (
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      ) : (
        <TouchableOpacity className="w-10 h-10 items-center justify-center">
          <Ionicons name="checkmark-circle-outline" size={26} color="#9CA3AF" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View className="flex-row items-center px-5 py-4">
        <TouchableOpacity className="w-10 h-10 items-center justify-center mr-3" onPress={() => { navigation.goBack(); }}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-semibold">Gần đây</Text>
      </View>

      {/* Tab Buttons */}
      <View className="flex-row px-5 mb-4 gap-3">
        <TouchableOpacity className="bg-neutral-800 px-6 py-2.5 rounded-full">
          <Text className="text-white text-sm font-medium">Nhạc</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Today Section */}
        <View className="mb-6">
          <Text className="text-white text-2xl font-bold px-5 mb-3">Hôm Nay</Text>
          {todayPlaylists.map(item => renderPlaylistItem(item))}
        </View>

        {/* Yesterday Section */}
        <View className="mb-6">
          <Text className="text-white text-2xl font-bold px-5 mb-3">Hôm Qua</Text>
          {yesterdayPlaylists.map(item => renderPlaylistItem(item))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}