import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axiosClient from '../../API/axiosClient';
import { getMeAPI } from '../../API/userAPI';

interface LogEntry {
  _id: string;
  action: string;
  entityType: 'song' | 'artist' | 'playlist';
  entityName: string;
  user: {
    username: string;
  };
  createdAt: string;
}

export default function SystemLogsScreen() {
  const navigation = useNavigation();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string>('Admin');

  useEffect(() => {
    fetchUserAndLogs();
  }, []);

  const fetchUserAndLogs = async () => {
    try {
      // Fetch current user data first
      const userData = await getMeAPI();
      const username = userData?.username || 'Admin';
      setCurrentUser(username);
      
      // Then fetch logs
      await fetchLogs(username);
    } catch (error) {
      console.error('Error fetching user data:', error);
      await fetchLogs('Admin');
    }
  };

  const fetchLogs = async (username: string) => {
    try {
      setIsLoading(true);
      // Fetch recent songs, artists, and playlists
      const [songsRes, artistsRes, playlistsRes] = await Promise.all([
        axiosClient.get('/music/queue?type=new'),
        axiosClient.get('/music/artists'),
        axiosClient.get('/playlists'),
      ]);

      const songLogs = (songsRes.data || []).slice(0, 10).map((song: any) => ({
        _id: song._id,
        action: 'created',
        entityType: 'song' as const,
        entityName: song.title,
        user: { username: `Admin • ${username}` },
        createdAt: song.createdAt || song.updatedAt || new Date().toISOString(),
      }));

      const artistLogs = (artistsRes.data || []).slice(0, 5).map((artist: any) => ({
        _id: artist._id,
        action: 'created',
        entityType: 'artist' as const,
        entityName: artist.name,
        user: { username: `Admin • ${username}` },
        createdAt: artist.createdAt || artist.updatedAt || new Date().toISOString(),
      }));

      const playlistLogs = (playlistsRes.data || []).slice(0, 5).map((playlist: any) => ({
        _id: playlist._id,
        action: 'created',
        entityType: 'playlist' as const,
        entityName: playlist.name,
        user: { username: `Admin • ${username}` },
        createdAt: playlist.createdAt || playlist.updatedAt || new Date().toISOString(),
      }));

      const allLogs = [...songLogs, ...artistLogs, ...playlistLogs]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setLogs(allLogs);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getIconName = (entityType: string) => {
    switch (entityType) {
      case 'song': return 'musical-note';
      case 'artist': return 'person';
      case 'playlist': return 'list';
      default: return 'document';
    }
  };

  const getIconColor = (entityType: string) => {
    switch (entityType) {
      case 'song': return '#8B5CF6';
      case 'artist': return '#EC4899';
      case 'playlist': return '#06B6D4';
      default: return '#666';
    }
  };

  const getActionText = (action: string, entityType: string) => {
    return `Đã thêm ${entityType === 'song' ? 'bài hát' : entityType === 'artist' ? 'nghệ sĩ' : 'playlist'}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Header */}
      <View className="px-6 py-4 border-b border-white/10 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-white text-2xl font-bold">Nhật Ký Hệ Thống</Text>
          <Text className="text-gray-400 text-sm mt-1">Theo dõi hoạt động</Text>
        </View>
        <TouchableOpacity onPress={fetchUserAndLogs}>
          <Ionicons name="refresh" size={24} color="#EC4899" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-6 py-6">
        {isLoading ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#EC4899" />
            <Text className="text-gray-400 mt-4">Đang tải nhật ký...</Text>
          </View>
        ) : logs.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Ionicons name="document-text-outline" size={64} color="#666" />
            <Text className="text-gray-400 mt-4">Chưa có hoạt động nào</Text>
          </View>
        ) : (
          <>
            {/* Stats */}
            <View className="flex-row mb-6">
              <View className="flex-1 bg-white/5 rounded-xl p-4 mr-2 border border-white/10">
                <Text className="text-gray-400 text-sm">Tổng hoạt động</Text>
                <Text className="text-white text-2xl font-bold mt-1">{logs.length}</Text>
              </View>
              <View className="flex-1 bg-white/5 rounded-xl p-4 ml-2 border border-white/10">
                <Text className="text-gray-400 text-sm">Hôm nay</Text>
                <Text className="text-white text-2xl font-bold mt-1">
                  {logs.filter(log => {
                    const logDate = new Date(log.createdAt);
                    const today = new Date();
                    return logDate.toDateString() === today.toDateString();
                  }).length}
                </Text>
              </View>
            </View>

            {/* Logs List */}
            <Text className="text-white text-xl font-bold mb-4">Hoạt Động Gần Đây</Text>
            {logs.map((log) => (
              <View
                key={log._id}
                className="bg-white/5 rounded-xl p-4 mb-3 border border-white/10"
              >
                <View className="flex-row items-center">
                  <View
                    className="w-12 h-12 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: `${getIconColor(log.entityType)}20` }}
                  >
                    <Ionicons
                      name={getIconName(log.entityType) as any}
                      size={20}
                      color={getIconColor(log.entityType)}
                    />
                  </View>

                  <View className="flex-1">
                    <Text className="text-white font-semibold mb-1">
                      {getActionText(log.action, log.entityType)}
                    </Text>
                    <Text className="text-gray-400 text-sm mb-1">
                      {log.entityName}
                    </Text>
                    <View className="flex-row items-center">
                      <Ionicons name="person-outline" size={12} color="#666" />
                      <Text className="text-gray-500 text-xs ml-1">
                        {log.user.username}
                      </Text>
                      <Text className="text-gray-500 text-xs mx-2">•</Text>
                      <Ionicons name="time-outline" size={12} color="#666" />
                      <Text className="text-gray-500 text-xs ml-1">
                        {formatDate(log.createdAt)}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
