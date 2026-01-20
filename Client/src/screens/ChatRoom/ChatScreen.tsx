import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import { SafeAreaFrameContext } from 'react-native-safe-area-context';
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
    >
      <View className="relative">
        <Image 
          source={{ uri: user.avatar }} 
          className="w-16 h-16 rounded-full border-2 border-transparent" // Add border for selection state if needed
        />
        {user.isOnline && (
          <View className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-black" />
        )}
      </View>
      <Text className="text-white text-xs mt-1 text-center w-16" numberOfLines={1}>
        {user.name}
      </Text>
    </TouchableOpacity>
  );

  const renderChatItem = ({ item }: { item: ChatSession }) => (
    <TouchableOpacity 
      className="flex-row items-center py-3"
      onPress={() => navigation.navigate('ChatDetail', { userId: item.user.id })}
    >
      <View className="relative">
        <Image source={{ uri: item.user.avatar }} className="w-14 h-14 rounded-full" />
        {item.user.isOnline && (
          <View className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-black" />
        )}
      </View>
      <View className="flex-1 ml-4 justify-center">
        <Text className="text-white text-base font-bold">{item.user.name}</Text>
        <Text className="text-gray-400 text-sm mt-1" numberOfLines={1}>
          {item.lastMessage} • {item.lastMessageTime}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-black pt-8">
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-2">
        <View className="w-8 h-8 bg-blue-400 rounded-full items-center justify-center">
             <Ionicons name="search" size={20} color="white" />
        </View>
        <Text className="text-white text-xl font-bold">Trò chuyện</Text>
        <View className="w-8" /> 
        {/* Placeholder for right icon to center title. Or can use absolute positioning */}
      </View>

      <ScrollView className="flex-1 px-4">
        {/* Active Users Horizontal List */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          className="mt-6 mb-6"
        >
          {MOCK_USERS.map(renderActiveUser)}
        </ScrollView>

        {/* Recent Chats List */}
        <FlatList
          data={MOCK_CHATS}
          keyExtractor={item => item.id}
          renderItem={renderChatItem}
          scrollEnabled={false} // Disable scrolling for FlatList since it's nested in ScrollView
        />
      </ScrollView>
    </SafeAreaView>
  );
}
