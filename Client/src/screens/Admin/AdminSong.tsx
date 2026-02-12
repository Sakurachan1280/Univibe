import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getQueueSongs } from '../../API/songAPI';
import { getAllArtists } from '../../API/artistAPI';

export default function AdminSong() {
  const navigation = useNavigation();
  const [songCount, setSongCount] = useState(0);
  const [artistCount, setArtistCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const [songsResponse, artistsResponse] = await Promise.all([
        getQueueSongs('new'),
        getAllArtists(),
      ]);

      setSongCount(songsResponse?.length || 0);
      setArtistCount(artistsResponse?.length || 0);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const adminFeatures = [
    {
      id: 'add-song',
      title: 'Thêm Bài Hát',
      description: 'Tải lên bài hát mới vào thư viện',
      icon: 'musical-notes',
      color: '#EC4899',
      route: 'CreateSong',
    },

    {
      id: 'add-artist',
      title: 'Thêm Nghệ Sĩ',
      description: 'Thêm nghệ sĩ mới vào hệ thống',
      icon: 'person-add',
      color: '#06B6D4',
      route: 'CreateArtist',
    },
    {
      id: 'manage-artists',
      title: 'Thêm Playlist',
      description: 'Xem, sửa và xóa Playlist',
      icon: 'people',
      color: '#06B6D4',
      route: 'ArtistManagement',
    },
  ];

  const handleFeaturePress = (route: string) => {
    navigation.navigate(route as never);
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Header */}
      <View className="px-6 py-4 border-b border-white/10">
        <Text className="text-white text-3xl font-bold">Spotichat</Text>
        <Text className="text-gray-400 text-sm mt-1">Admin Panel</Text>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-6 py-6">
        <Text className="text-white text-xl font-bold mb-4">Quản Lý Nội Dung</Text>

        {/* Feature Cards */}
        <View className="space-y-4">
          {adminFeatures.map((feature, index) => (
            <TouchableOpacity
              key={feature.id}
              onPress={() => handleFeaturePress(feature.route)}
              className="mb-4"
              activeOpacity={0.8}
            >
              <View className="bg-white/5 rounded-2xl p-5 border border-white/10">
                <View className="flex-row items-center">
                  {/* Icon Container */}
                  <View
                    className="w-16 h-16 rounded-full items-center justify-center mr-4"
                    style={{ backgroundColor: `${feature.color}20` }}
                  >
                    <Ionicons name={feature.icon as any} size={28} color={feature.color} />
                  </View>

                  {/* Text Content */}
                  <View className="flex-1">
                    <Text className="text-white text-lg font-bold mb-1">
                      {feature.title}
                    </Text>
                    <Text className="text-gray-400 text-sm">
                      {feature.description}
                    </Text>
                  </View>

                  {/* Arrow Icon */}
                  <Ionicons name="chevron-forward" size={24} color="#666" />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats Section */}
        <View className="mt-8 mb-6">
          <Text className="text-white text-xl font-bold mb-4">Thống Kê</Text>

          <View className="flex-row justify-between">
            <View className="bg-white/5 rounded-2xl p-5 flex-1 mr-2 border border-white/10">
              <Ionicons name="musical-notes" size={24} color="#EC4899" />
              <Text className="text-white text-2xl font-bold mt-3">
                {isLoading ? '...' : songCount}
              </Text>
              <Text className="text-gray-400 text-sm mt-1">Bài hát</Text>
            </View>

            <View className="bg-white/5 rounded-2xl p-5 flex-1 ml-2 border border-white/10">
              <Ionicons name="people" size={24} color="#06B6D4" />
              <Text className="text-white text-2xl font-bold mt-3">
                {isLoading ? '...' : artistCount}
              </Text>
              <Text className="text-gray-400 text-sm mt-1">Nghệ sĩ</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="mt-4 mb-6">
          <Text className="text-white text-xl font-bold mb-4">Thao Tác Nhanh</Text>

          <TouchableOpacity
            style={{ backgroundColor: '#EC4899' }}
            className="rounded-xl p-4 mb-3"
            activeOpacity={0.8}
            onPress={fetchStats}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="refresh" size={20} color="white" />
                <Text className="text-white font-semibold ml-3">Làm mới dữ liệu</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="white" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white/5 rounded-xl p-4 border border-white/10"
            activeOpacity={0.8}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="settings-outline" size={20} color="#ffffff" />
                <Text className="text-white font-semibold ml-3">Cài đặt hệ thống</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}