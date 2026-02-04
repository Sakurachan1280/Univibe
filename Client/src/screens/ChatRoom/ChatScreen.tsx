import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { MOCK_USERS, MOCK_CHATS, User, ChatSession } from '../../data/mockData';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ChatScreen() {
  const navigation = useNavigation<NavigationProp>();

  const renderActiveUser = (user: User) => (
    <TouchableOpacity
      key={user.id}
      className="mr-4 items-center"
      onPress={() => navigation.navigate('ChatDetail', { userId: user.id })}
      activeOpacity={0.7}
    >
      <View className="relative">
        <View className="w-20 h-20 rounded-full border-2 border-pink-500 items-center justify-center p-0.5">
          <Image
            source={{ uri: user.avatar }}
            className="w-full h-full rounded-full"
          />
        </View>
        {user.isOnline && (
          <View className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-black items-center justify-center">
            <View className="w-2.5 h-2.5 bg-white rounded-full" />
          </View>
        )}
      </View>
      <Text className="text-white text-xs mt-2 text-center w-20 font-medium" numberOfLines={1}>
        {user.name}
      </Text>
    </TouchableOpacity>
  );

  const renderChatItem = ({ item, index }: { item: ChatSession; index: number }) => (
    <TouchableOpacity
      className="mb-2"
      onPress={() => navigation.navigate('ChatDetail', { userId: item.user.id })}
      activeOpacity={0.7}
    >
      <View className="bg-white/5 rounded-2xl p-4 border border-white/10 flex-row items-center">
        <View className="relative">
          <Image
            source={{ uri: item.user.avatar }}
            className="w-16 h-16 rounded-full border-2 border-pink-500/30"
          />
          {item.user.isOnline && (
            <View className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-black" />
          )}
        </View>

        <View className="flex-1 ml-4">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-white text-base font-bold">{item.user.name}</Text>
            <Text className="text-gray-500 text-xs">{item.lastMessageTime}</Text>
          </View>
          <Text className="text-gray-400 text-sm" numberOfLines={1}>
            {item.lastMessage}
          </Text>
        </View>

        <View className="ml-2">
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />

      {/* Header with Gradient */}
      <View className="px-6 py-4 border-b border-white/10">
        <View className="flex-row justify-between items-center">
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-white/10 items-center justify-center"
            activeOpacity={0.7}
          >
            <Ionicons name="search" size={20} color="white" />
          </TouchableOpacity>

          <Text className="text-white text-2xl font-bold">Trò chuyện</Text>

          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-white/10 items-center justify-center"
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Active Users Section */}
        <View className="mt-6 mb-4">
          <View className="px-6 mb-4 flex-row items-center justify-between">
            <Text className="text-white text-lg font-bold">Đang hoạt động</Text>
            <TouchableOpacity>
              <Ionicons name="ellipsis-horizontal" size={20} color="#999" />
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="px-6"
            contentContainerStyle={{ paddingRight: 24 }}
          >
            {MOCK_USERS.map(renderActiveUser)}
          </ScrollView>
        </View>

        {/* Divider */}
        <View className="h-px bg-white/10 mx-6 my-4" />

        {/* Recent Chats Section */}
        <View className="px-6 mb-4">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-white text-lg font-bold">Tin nhắn gần đây</Text>
            <TouchableOpacity className="flex-row items-center">
              <Text className="text-pink-500 text-sm font-medium mr-1">Xem tất cả</Text>
              <Ionicons name="chevron-forward" size={16} color="#EC4899" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={MOCK_CHATS}
            keyExtractor={item => item.id}
            renderItem={renderChatItem}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
