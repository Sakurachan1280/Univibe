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
  Animated,
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
import { useAdminTheme } from '../../context/AdminThemeContext';

export default function AdminAlbum() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ totalSongs: 0, totalPlaylists: 0, totalArtists: 0 });
  const theme = useAdminTheme();

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      const [songsResponse, playlistsResponse, artistsResponse] = await Promise.all([
        getAllSongs(), getAdminAlbums(), getAllArtists(),
      ]);
      setStats({
        totalSongs: songsResponse?.length || 0,
        totalPlaylists: playlistsResponse?.length || 0,
        totalArtists: artistsResponse?.length || 0,
      });
    } catch {
      Alert.alert('Error', 'Failed to load library statistics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchStats(); }, [fetchStats]));
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('adminRefresh', () => fetchStats());
    return () => sub.remove();
  }, [fetchStats]);

  const libraryFeatures = [
    { id: 'artists', title: 'Nghệ Sĩ', description: 'Quản lý danh sách nghệ sĩ', icon: 'person', color: '#EC4899', count: stats.totalArtists, screen: 'ArtistManagement' },
    { id: 'songs', title: 'Bài Hát', description: 'Quản lý danh sách bài hát', icon: 'musical-notes', color: '#8B5CF6', count: stats.totalSongs, screen: 'SongManagement' },
    { id: 'Album', title: 'Album & Playlist', description: 'Quản lý Album và Playlist hệ thống', icon: 'albums', color: '#06B6D4', count: stats.totalPlaylists, screen: 'AlbumManagement' },
  ];

  return (
    <Animated.View style={{ flex: 1, backgroundColor: theme.animBg }}>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />

        {/* Header */}
        <View style={{ paddingHorizontal: 24, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: theme.bgCardBorder }}>
          <Text style={{ color: theme.textPrimary, fontSize: 30, fontWeight: 'bold' }}>Thư Viện</Text>
          <Text style={{ color: theme.textSecondary, fontSize: 14, marginTop: 4 }}>Quản lý nội dung</Text>
        </View>

        <ScrollView style={{ flex: 1, paddingHorizontal: 24, paddingTop: 24 }}>
          {isLoading ? (
            <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 80 }}>
              <ActivityIndicator size="large" color="#EC4899" />
              <Text style={{ color: theme.textSecondary, marginTop: 16 }}>Đang tải dữ liệu...</Text>
            </View>
          ) : (
            <>
              <View style={{ marginBottom: 24 }}>
                <Text style={{ color: theme.textPrimary, fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>Tổng Quan</Text>

                {/* Hero */}
                <View style={{ backgroundColor: '#EC4899', borderRadius: 16, padding: 24, marginBottom: 16 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View>
                      <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 4 }}>Tổng số bài hát</Text>
                      <Text style={{ color: 'white', fontSize: 40, fontWeight: 'bold' }}>{stats.totalSongs}</Text>
                    </View>
                    <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 999, padding: 16 }}>
                      <Ionicons name="musical-notes" size={32} color="white" />
                    </View>
                  </View>
                </View>

                {/* Mini stats */}
                <View style={{ flexDirection: 'row' }}>
                  <Animated.View style={{ backgroundColor: theme.animCard, borderRadius: 16, padding: 20, flex: 1, marginRight: 8, borderWidth: 1, borderColor: theme.bgCardBorder }}>
                    <Ionicons name="person" size={24} color="#EC4899" />
                    <Text style={{ color: theme.textPrimary, fontSize: 24, fontWeight: 'bold', marginTop: 12 }}>{stats.totalArtists}</Text>
                    <Text style={{ color: theme.textSecondary, fontSize: 14, marginTop: 4 }}>Nghệ sĩ</Text>
                  </Animated.View>
                  <Animated.View style={{ backgroundColor: theme.animCard, borderRadius: 16, padding: 20, flex: 1, marginLeft: 8, borderWidth: 1, borderColor: theme.bgCardBorder }}>
                    <Ionicons name="list" size={24} color="#06B6D4" />
                    <Text style={{ color: theme.textPrimary, fontSize: 24, fontWeight: 'bold', marginTop: 12 }}>{stats.totalPlaylists}</Text>
                    <Text style={{ color: theme.textSecondary, fontSize: 14, marginTop: 4 }}>Album / Playlist</Text>
                  </Animated.View>
                </View>
              </View>

              {/* Categories */}
              <View style={{ marginBottom: 24 }}>
                <Text style={{ color: theme.textPrimary, fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>Danh Mục</Text>
                {libraryFeatures.map((feature) => (
                  <TouchableOpacity
                    key={feature.id}
                    activeOpacity={0.8}
                    onPress={() => feature.screen ? navigation.navigate(feature.screen as any) : Alert.alert('Thông báo', 'Tính năng đang phát triển')}
                    style={{ marginBottom: 12 }}
                  >
                    <Animated.View style={{ backgroundColor: theme.animCard, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: theme.bgCardBorder }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: `${feature.color}20`, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                          <Ionicons name={feature.icon as any} size={24} color={feature.color} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: theme.textPrimary, fontSize: 18, fontWeight: 'bold', marginBottom: 4 }}>{feature.title}</Text>
                          <Text style={{ color: theme.textSecondary, fontSize: 14 }}>{feature.description}</Text>
                        </View>
                        <View style={{ backgroundColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)', borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8 }}>
                          <Text style={{ color: theme.textPrimary, fontWeight: 'bold' }}>{feature.count}</Text>
                        </View>
                      </View>
                    </Animated.View>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </Animated.View>
  );
}