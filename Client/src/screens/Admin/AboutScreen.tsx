import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function AboutScreen() {
  const navigation = useNavigation();

  const features = [
    { icon: 'musical-notes', title: 'Thư viện nhạc', desc: 'Hàng triệu bài hát chất lượng cao' },
    { icon: 'people', title: 'Phòng nghe nhạc', desc: 'Nghe nhạc cùng bạn bè real-time' },
    { icon: 'chatbubbles', title: 'Trò chuyện', desc: 'Chat và chia sẻ âm nhạc' },
    { icon: 'sparkles', title: 'AI gợi ý', desc: 'Khám phá nhạc theo sở thích' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Header */}
      <View className="px-6 py-4 border-b border-white/10 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-2xl font-bold">Về UniVibe</Text>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-6 py-6">
        {/* App Logo */}
        <View className="items-center mb-8">
          <View className="w-24 h-24 rounded-3xl bg-gradient-to-br from-pink-500 to-cyan-500 items-center justify-center mb-4" style={{ backgroundColor: '#EC4899' }}>
            <Ionicons name="musical-notes" size={48} color="white" />
          </View>
          <Text className="text-white text-3xl font-bold">UniVibe</Text>
          <Text className="text-gray-400 text-sm mt-2">Phiên bản 1.0.0</Text>
        </View>

        {/* Description */}
        <View className="bg-white/5 rounded-2xl p-6 mb-6 border border-white/10">
          <Text className="text-white text-lg font-bold mb-3">Giới Thiệu</Text>
          <Text className="text-gray-300 leading-6">
            UniVibe là nền tảng nghe nhạc và kết nối xã hội, nơi bạn có thể khám phá âm nhạc, 
            tạo phòng nghe nhạc cùng bạn bè, và trò chuyện trong khi thưởng thức những giai điệu yêu thích.
          </Text>
        </View>

        {/* Features */}
        <View className="mb-6">
          <Text className="text-white text-xl font-bold mb-4">Tính Năng Nổi Bật</Text>
          {features.map((feature, index) => (
            <View
              key={index}
              className="bg-white/5 rounded-xl p-4 mb-3 border border-white/10 flex-row items-center"
            >
              <View className="w-12 h-12 rounded-full bg-pink-600/20 items-center justify-center mr-4">
                <Ionicons name={feature.icon as any} size={24} color="#EC4899" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold mb-1">{feature.title}</Text>
                <Text className="text-gray-400 text-sm">{feature.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Tech Stack */}
        <View className="bg-white/5 rounded-2xl p-6 mb-6 border border-white/10">
          <Text className="text-white text-lg font-bold mb-3">Công Nghệ</Text>
          <View className="flex-row flex-wrap">
            {['React Native', 'Node.js', 'MongoDB', 'Socket.io', 'AI/ML'].map((tech, i) => (
              <View key={i} className="bg-white/10 rounded-full px-4 py-2 mr-2 mb-2">
                <Text className="text-white text-sm">{tech}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Contact */}
        <View className="bg-white/5 rounded-2xl p-6 mb-6 border border-white/10">
          <Text className="text-white text-lg font-bold mb-3">Liên Hệ</Text>
          <TouchableOpacity className="flex-row items-center mb-3">
            <Ionicons name="mail" size={20} color="#EC4899" />
            <Text className="text-gray-300 ml-3">support@univibe.com</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center mb-3">
            <Ionicons name="globe" size={20} color="#EC4899" />
            <Text className="text-gray-300 ml-3">www.univibe.com</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center">
            <Ionicons name="logo-github" size={20} color="#EC4899" />
            <Text className="text-gray-300 ml-3">github.com/univibe</Text>
          </TouchableOpacity>
        </View>

        {/* Copyright */}
        <Text className="text-gray-500 text-center text-sm mb-8">
          © 2026 UniVibe. All rights reserved.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
