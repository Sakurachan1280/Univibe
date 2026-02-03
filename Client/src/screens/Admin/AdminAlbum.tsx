import React from 'react';
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

export default function AdminAlbum() {
  const navigation = useNavigation();

  const libraryFeatures = [
    {
      id: 'albums',
      title: 'Albums',
      description: 'Quản lý danh sách album',
      icon: 'albums',
      color: '#EC4899',
      count: 0,
    },
    {
      id: 'playlists',
      title: 'Playlists',
      description: 'Quản lý danh sách phát',
      icon: 'list',
      color: '#06B6D4',
      count: 0,
    },
    {
      id: 'genres',
      title: 'Thể Loại',
      description: 'Phân loại theo thể loại nhạc',
      icon: 'musical-note',
      color: '#EC4899',
      count: 0,
    },
  ];

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
        {/* Library Stats */}
        <View className="mb-6">
          <Text className="text-white text-xl font-bold mb-4">Tổng Quan</Text>

          <View className="bg-gradient-to-br from-pink-500 to-cyan-500 rounded-2xl p-6 mb-4" style={{ backgroundColor: '#EC4899' }}>
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-white/80 text-sm mb-1">Tổng số bài hát</Text>
                <Text className="text-white text-4xl font-bold">0</Text>
              </View>
              <View className="bg-white/20 rounded-full p-4">
                <Ionicons name="musical-notes" size={32} color="white" />
              </View>
            </View>
          </View>

          <View className="flex-row justify-between">
            <View className="bg-white/5 rounded-2xl p-5 flex-1 mr-2 border border-white/10">
              <Ionicons name="albums" size={24} color="#EC4899" />
              <Text className="text-white text-2xl font-bold mt-3">0</Text>
              <Text className="text-gray-400 text-sm mt-1">Albums</Text>
            </View>

            <View className="bg-white/5 rounded-2xl p-5 flex-1 ml-2 border border-white/10">
              <Ionicons name="list" size={24} color="#06B6D4" />
              <Text className="text-white text-2xl font-bold mt-3">0</Text>
              <Text className="text-gray-400 text-sm mt-1">Playlists</Text>
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

        {/* Quick Actions */}
        <View className="mb-6">
          <Text className="text-white text-xl font-bold mb-4">Thao Tác</Text>

          <TouchableOpacity
            className="bg-white/5 rounded-xl p-4 mb-3 border border-white/10"
            activeOpacity={0.8}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="add-circle" size={20} color="#EC4899" />
                <Text className="text-white font-semibold ml-3">Tạo Album mới</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white/5 rounded-xl p-4 border border-white/10"
            activeOpacity={0.8}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="add-circle" size={20} color="#EC4899" />
                <Text className="text-white font-semibold ml-3">Tạo Playlist mới</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}