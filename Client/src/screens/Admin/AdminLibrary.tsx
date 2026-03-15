import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Alert,
  DeviceEventEmitter,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { getAllSongs } from '../../API/songAPI';
import { getAllArtists } from '../../API/artistAPI';
import { getAdminAlbums } from '../../API/playlistAPI';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';

export default function AdminAlbum() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSongs: 0,
    totalPlaylists: 0,
    totalArtists: 0,
  });

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      const [songsResponse, playlistsResponse, artistsResponse] = await Promise.all([
        getAllSongs(),
        getAdminAlbums(),
        getAllArtists(),
      ]);
      setStats({
        totalSongs: songsResponse?.length || 0,
        totalPlaylists: playlistsResponse?.length || 0,
        totalArtists: artistsResponse?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      Alert.alert('Error', 'Failed to load library statistics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Tự động load lại mỗi khi tab này được focus
  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [fetchStats])
  );

  // Lắng nghe sự kiện 'adminRefresh' từ AdminSong
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('adminRefresh', () => {
      fetchStats();
    });
    return () => sub.remove();
  }, [fetchStats]);


  const libraryFeatures = [
    {
      id: 'artists',
      title: 'Nghệ Sĩ',
      description: 'Quản lý danh sách nghệ sĩ',
      icon: 'person',
      color: '#EC4899',
      count: stats.totalArtists,
      screen: 'ArtistManagement',
    },
    {
      id: 'songs',
      title: 'Bài Hát',
      description: 'Quản lý danh sách bài hát',
      icon: 'musical-notes',
      color: '#8B5CF6',
      count: stats.totalSongs,
      screen: 'SongManagement',
    },
    {
      id: 'Album',
      title: 'Album & Playlist',
      description: 'Quản lý Album và Playlist hệ thống',
      icon: 'albums',
      color: '#06B6D4',
      count: stats.totalPlaylists,
      screen: 'AlbumManagement',
    },
  ];

  const handleNavigate = (screen: string | null) => {
    if (screen) {
      navigation.navigate(screen as any);
    } else {
      Alert.alert('Thông báo', 'Tính năng đang phát triển');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Header */}
      <View className="px-6 py-4 border-b border-white/10">
        <Text className="text-white text-3xl font-bold">Thư Viện</Text>
        <Text className="text-gray-400 text-sm mt-1">Quản lý nội dung</Text>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-6 py-6">
        {isLoading ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#EC4899" />
            <Text className="text-gray-400 mt-4">Đang tải dữ liệu...</Text>
          </View>
        ) : (
          <>
            {/* Library Stats */}
            <View className="mb-6">
              <Text className="text-white text-xl font-bold mb-4">Tổng Quan</Text>

              <View className="bg-gradient-to-br from-pink-500 to-cyan-500 rounded-2xl p-6 mb-4" style={{ backgroundColor: '#EC4899' }}>
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className="text-white/80 text-sm mb-1">Tổng số bài hát</Text>
                    <Text className="text-white text-4xl font-bold">{stats.totalSongs}</Text>
                  </View>
                  <View className="bg-white/20 rounded-full p-4">
                    <Ionicons name="musical-notes" size={32} color="white" />
                  </View>
                </View>
              </View>

              <View className="flex-row justify-between">
                <View className="bg-white/5 rounded-2xl p-5 flex-1 mr-2 border border-white/10">
                  <Ionicons name="person" size={24} color="#EC4899" />
                  <Text className="text-white text-2xl font-bold mt-3">{stats.totalArtists}</Text>
                  <Text className="text-gray-400 text-sm mt-1">Nghệ sĩ</Text>
                </View>

                <View className="bg-white/5 rounded-2xl p-5 flex-1 ml-2 border border-white/10">
                  <Ionicons name="list" size={24} color="#06B6D4" />
                  <Text className="text-white text-2xl font-bold mt-3">{stats.totalPlaylists}</Text>
                  <Text className="text-gray-400 text-sm mt-1">Album / Playlist</Text>
                </View>
              </View>
            </View>

            {/* Library Categories */}
            <View className="mb-6">
              <Text className="text-white text-xl font-bold mb-4">Danh Mục</Text>

              {libraryFeatures.map((feature) => (
                <TouchableOpacity
                  key={feature.id}
                  className="bg-white/5 rounded-2xl p-5 mb-3 border border-white/10"
                  activeOpacity={0.8}
                  onPress={() => handleNavigate(feature.screen)}
                >
                  <View className="flex-row items-center">
                    <View
                      className="w-14 h-14 rounded-full items-center justify-center mr-4"
                      style={{ backgroundColor: `${feature.color}20` }}
                    >
                      <Ionicons name={feature.icon as any} size={24} color={feature.color} />
                    </View>

                    <View className="flex-1">
                      <Text className="text-white text-lg font-bold mb-1">
                        {feature.title}
                      </Text>
                      <Text className="text-gray-400 text-sm">
                        {feature.description}
                      </Text>
                    </View>

                    <View className="bg-white/10 rounded-full px-4 py-2">
                      <Text className="text-white font-bold">{feature.count}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}