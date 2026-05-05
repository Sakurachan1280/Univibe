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

type SongItem = {
  id: number;
  title: string;
  artist: string;
  timeAgo: string;
  label: string;
};

export default function NewsScreen() {
    const navigation = useNavigation();
  const newReleases: SongItem[] = [
    {
      id: 1,
      title: 'Tết Tấn Tới',
      artist: 'Trúc Nhân, DTAP',
      timeAgo: '22 giờ trước',
      label: 'Địa đơn',
    },
  ];

  const previousReleases: SongItem[] = [
    {
      id: 2,
      title: 'HỒN NGÀN MÙA XUÂN',
      artist: 'Isaac',
      timeAgo: '1 ngày trước',
      label: 'Địa đơn',
    },
    {
      id: 3,
      title: 'TRONG MẮT EM CÓ',
      artist: 'Anh Quân Idol, Đạt G',
      timeAgo: '5 ngày trước',
      label: 'Địa đơn',
    },
  ];

  const renderSongItem = (song: SongItem, isNew = false) => (
    <View key={song.id} className="mb-6">
      <View className="flex-row items-center">
        <View className="w-36 h-36 bg-gray-700 rounded-lg" />
        <View className="flex-1 ml-4">
          <Text className="text-gray-400 text-xs mb-1">{song.timeAgo}</Text>
          <Text className="text-white text-lg font-bold mb-1" numberOfLines={2}>
            {song.title}
          </Text>
          <Text className="text-gray-400 text-sm mb-3" numberOfLines={1}>
            {song.artist}
          </Text>
        </View>
      </View>
      
      <Text className="text-gray-400 text-xs mt-3 mb-2">{song.label}</Text>
      
      <View className="flex-row items-center gap-4">
        <TouchableOpacity className="w-11 h-11 rounded-full bg-neutral-800 items-center justify-center active:bg-neutral-700">
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
        


        <TouchableOpacity className="w-11 h-11 rounded-full bg-neutral-800 items-center justify-center active:bg-neutral-700">
          <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
        </TouchableOpacity>
        
        <View className="flex-1" />
        
        <TouchableOpacity className="w-14 h-14 rounded-full bg-white items-center justify-center active:bg-gray-200">
          <Ionicons name="play" size={28} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View className="px-5 pt-4 pb-6">
        <TouchableOpacity 
          className="w-10 h-10 items-center justify-center mb-6"
          onPress={() => { navigation.goBack(); }}
        >
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        
        <Text className="text-white text-4xl font-bold mb-3">
          Có gì mới
        </Text>
        
        <Text className="text-gray-400 text-base leading-6">
          Nội dung phát hành mới nhất từ nghệ sĩ, podcast và chương trình bạn theo dõi.
        </Text>
      </View>

      {/* Tab Buttons */}
      <View className="flex-row px-5 mb-6 gap-3">
        <TouchableOpacity className="bg-neutral-800 px-6 py-2.5 rounded-full">
          <Text className="text-white text-sm font-medium">Nhạc</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* New Section */}
        <View className="mb-8">
          <Text className="text-white text-2xl font-bold mb-5">Mới</Text>
          {newReleases.map(song => renderSongItem(song, true))}
        </View>

        {/* Previous Section */}
        <View className="mb-8">
          <Text className="text-white text-2xl font-bold mb-5">Trước đây</Text>
          {previousReleases.map(song => renderSongItem(song))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
