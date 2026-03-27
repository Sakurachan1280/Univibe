import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
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
import { useAdminTheme } from '../../context/AdminThemeContext';

export default function AdminSong() {
  const navigation = useNavigation();
  const [songCount, setSongCount] = useState(0);
  const [artistCount, setArtistCount] = useState(0);
  const [albumCount, setAlbumCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const theme = useAdminTheme();

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      const [songsResponse, artistsResponse, albumsResponse] = await Promise.all([
        getAllSongs(), getAllArtists(), getAdminAlbums(),
      ]);
      setSongCount(songsResponse?.length || 0);
      setArtistCount(artistsResponse?.length || 0);
      setAlbumCount(albumsResponse?.length || 0);
    } catch {
      console.error('Error fetching stats');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchStats(); }, [fetchStats]));

  const adminFeatures = [
    { id: 'add-song', title: 'Thêm Bài Hát', description: 'Tải lên bài hát mới vào thư viện', icon: 'musical-notes', color: '#EC4899', route: 'CreateSong' },
    { id: 'add-artist', title: 'Thêm Nghệ Sĩ', description: 'Thêm nghệ sĩ mới vào hệ thống', icon: 'person-add', color: '#06B6D4', route: 'CreateArtist' },
    { id: 'add-album', title: 'Thêm Album', description: 'Thêm, sửa, xóa album hệ thống', icon: 'albums', color: '#8B5CF6', route: 'CreateAlbum' },
  ];

  const statItems = [
    { icon: 'musical-notes', color: '#EC4899', count: songCount, label: 'Bài hát' },
    { icon: 'people', color: '#06B6D4', count: artistCount, label: 'Nghệ sĩ' },
    { icon: 'albums', color: '#8B5CF6', count: albumCount, label: 'Album' },
  ];

  return (
    <Animated.View style={{ flex: 1, backgroundColor: theme.animBg }}>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />

        {/* Header */}
        <View style={{ paddingHorizontal: 24, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: theme.bgCardBorder }}>
          <Text style={{ color: theme.textPrimary, fontSize: 30, fontWeight: 'bold' }}>UniVibe</Text>
          <Text style={{ color: theme.textSecondary, fontSize: 14, marginTop: 4 }}>Admin Panel</Text>
        </View>

        <ScrollView style={{ flex: 1, paddingHorizontal: 24, paddingTop: 24 }}>
          <Text style={{ color: theme.textPrimary, fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>Quản Lý Nội Dung</Text>

          {/* Feature Cards */}
          {adminFeatures.map((feature) => (
            <TouchableOpacity key={feature.id} onPress={() => navigation.navigate(feature.route as never)} style={{ marginBottom: 16 }} activeOpacity={0.8}>
              <Animated.View style={{ backgroundColor: theme.animCard, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: theme.bgCardBorder }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: `${feature.color}20`, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                    <Ionicons name={feature.icon as any} size={28} color={feature.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: theme.textPrimary, fontSize: 18, fontWeight: 'bold', marginBottom: 4 }}>{feature.title}</Text>
                    <Text style={{ color: theme.textSecondary, fontSize: 14 }}>{feature.description}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color={theme.textSecondary} />
                </View>
              </Animated.View>
            </TouchableOpacity>
          ))}

          {/* Stats */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ color: theme.textPrimary, fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>Thống Kê</Text>
            <View style={{ flexDirection: 'row' }}>
              {statItems.map((stat, i) => (
                <Animated.View key={i} style={{ backgroundColor: theme.animCard, borderRadius: 16, padding: 20, flex: 1, marginHorizontal: 4, borderWidth: 1, borderColor: theme.bgCardBorder }}>
                  <Ionicons name={stat.icon as any} size={24} color={stat.color} />
                  <Text style={{ color: theme.textPrimary, fontSize: 24, fontWeight: 'bold', marginTop: 12 }}>
                    {isLoading ? '...' : stat.count}
                  </Text>
                  <Text style={{ color: theme.textSecondary, fontSize: 13, marginTop: 4 }}>{stat.label}</Text>
                </Animated.View>
              ))}
            </View>
          </View>

          {/* Quick Actions */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ color: theme.textPrimary, fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>Thao Tác Nhanh</Text>
            <TouchableOpacity
              style={{ backgroundColor: '#EC4899', borderRadius: 12, padding: 16, marginBottom: 12 }}
              activeOpacity={0.8}
              onPress={() => { fetchStats(); DeviceEventEmitter.emit('adminRefresh'); }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="refresh" size={20} color="white" />
                  <Text style={{ color: 'white', fontWeight: '600', marginLeft: 12 }}>Làm mới dữ liệu</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="white" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.8}>
              <Animated.View style={{ backgroundColor: theme.animCard, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: theme.bgCardBorder }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="settings-outline" size={20} color={theme.textPrimary} />
                    <Text style={{ color: theme.textPrimary, fontWeight: '600', marginLeft: 12 }}>Cài đặt hệ thống</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
                </View>
              </Animated.View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Animated.View>
  );
}