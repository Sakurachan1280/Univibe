import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  TextInput,
  ActivityIndicator,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from "expo-secure-store";
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import {
  SearchUser,
  Conversation,
  searchUsersAPI,
  getFriendsAPI,
  getConversationsAPI,
} from '../../API/socialAPI';
import { BASE_URL } from '../../API/axiosClient';
import { getMeAPI } from '../../API/userAPI';
import { useSocket } from '../../context/SocketContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Helper lấy image source từ avatar_url
const getAvatarUri = (url?: string) => {
  if (!url) return require('../../../assets/Icon/ava.jpg');
  if (url.startsWith('http')) return { uri: url };
  return { uri: `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}` };
};

export default function ChatScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { onlineUserIds, socket } = useSocket();

  const [searchText, setSearchText] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);

  const [friends, setFriends] = useState<SearchUser[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);

  const [loadingFriends, setLoadingFriends] = useState(true);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchBarAnim = useRef(new Animated.Value(0)).current;

  // Lấy ID của user đang đăng nhập để filter conversation
  useEffect(() => {
    getMeAPI().then(me => {
      if (me?._id) setCurrentUserId(me._id);
    }).catch(() => { });
  }, []);

  // Load friends và conversations 1 lần khi mở màn hình
  // Conversations sẽ được cập nhật realtime qua socket 'conversation_updated'
  useEffect(() => {
    fetchFriends();
    fetchConversations();
  }, []);

  // Cập nhật conversation list realtime khi có tin nhắn mới
  useEffect(() => {
    if (!socket) return;
    const handleConversationUpdated = () => {
      fetchConversations();
    };
    socket.on('conversation_updated', handleConversationUpdated);
    return () => {
      socket.off('conversation_updated', handleConversationUpdated);
    };
  }, [socket]);

  const fetchFriends = async () => {
    try {
      setLoadingFriends(true);
      const data = await getFriendsAPI();
      setFriends(data);
    } catch (e) {
      console.error('Fetch friends error:', e);
    } finally {
      setLoadingFriends(false);
    }
  };

  const fetchConversations = async () => {
    try {
      setLoadingConversations(true);
      const data = await getConversationsAPI();
      setConversations(data);
    } catch (e) {
      console.error('Fetch conversations error:', e);
    } finally {
      setLoadingConversations(false);
    }
  };

  const handleSearchChange = (text: string) => {
    setSearchText(text);
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    if (!text.trim()) {
      setSearchResults([]);
      setLoadingSearch(false);
      return;
    }
    setLoadingSearch(true);
    searchDebounce.current = setTimeout(async () => {
      try {
        const results = await searchUsersAPI(text.trim());
        setSearchResults(results);
      } catch (e) {
        console.error('Search error:', e);
        setSearchResults([]);
      } finally {
        setLoadingSearch(false);
      }
    }, 400);
  };

  const activateSearch = async () => {
    const token = await SecureStore.getItemAsync("accessToken");
    if (!token) {
      Alert.alert(
        "Thông báo",
        "Vui lòng đăng nhập để dùng chức năng này.",
        [
          { text: "Tôi biết rồi", style: "cancel" },
          { text: "Quay về trang home", onPress: () => navigation.navigate("Home" as any) }
        ]
      );
      return;
    }

    setIsSearchActive(true);
    Animated.timing(searchBarAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const deactivateSearch = () => {
    setIsSearchActive(false);
    setSearchText('');
    setSearchResults([]);
    Animated.timing(searchBarAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const getDisplayName = (user: SearchUser) =>
    user.profile?.display_name || user.username;

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return 'Vừa xong';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} phút`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} giờ`;
    return `${Math.floor(diff / 86400000)} ngày`;
  };

  // Lấy người còn lại trong conversation (không phải mình)
  const getOtherParticipant = (conv: Conversation) => {
    // Server đã filter sẵn otherParticipants
    if (conv.otherParticipants && conv.otherParticipants.length > 0) {
      return conv.otherParticipants[0];
    }
    // Client-side fallback: filter dựa vào currentUserId
    if (currentUserId && conv.participants?.length > 0) {
      const other = conv.participants.find(
        (p) => (p._id || (p as any).id) !== currentUserId
      );
      return other || conv.participants[0];
    }
    return conv.participants?.[0] || null;
  };

  // ===================== RENDER COMPONENTS =====================

  const renderSearchResult = ({ item }: { item: SearchUser }) => (
    <TouchableOpacity
      className="flex-row items-center px-6 py-3 active:bg-white/5"
      onPress={() => navigation.navigate('UserProfile', { userId: item._id })}
      activeOpacity={0.7}
    >
      <View className="w-12 h-12 rounded-full overflow-hidden bg-gray-700 mr-4">
        <Image
          source={getAvatarUri(item.profile?.avatar_url)}
          className="w-full h-full"
          resizeMode="cover"
        />
      </View>
      <View className="flex-1">
        <Text className="text-white text-base font-semibold">
          {getDisplayName(item)}
        </Text>
        <Text className="text-gray-400 text-sm">@{item.username}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#666" />
    </TouchableOpacity>
  );

  const renderActiveFriend = (user: SearchUser) => {
    const isOnline = onlineUserIds.has(user._id);
    return (
      <TouchableOpacity
        key={user._id}
        className="mr-5 items-center"
        onPress={() => navigation.navigate('UserProfile', { userId: user._id })}
        activeOpacity={0.7}
      >
        <View className="relative">
          <View className="w-[72px] h-[72px] rounded-full border-2 border-pink-500 p-0.5">
            <Image
              source={getAvatarUri(user.profile?.avatar_url)}
              className="w-full h-full rounded-full"
              resizeMode="cover"
            />
          </View>
          <View
            className={`absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full border-2 border-black ${isOnline ? 'bg-green-500' : 'bg-red-500'
              }`}
          />
        </View>
        <Text
          className="text-white text-xs mt-2 text-center font-medium"
          style={{ width: 72 }}
          numberOfLines={1}
        >
          {getDisplayName(user)}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderConversationItem = ({ item }: { item: Conversation }) => {
    const other = getOtherParticipant(item);
    const lastMsg = item.last_message?.content || 'Bắt đầu cuộc trò chuyện';

    return (
      <TouchableOpacity
        className="mb-2"
        onPress={() =>
          navigation.navigate('ChatDetail', {
            userId: other?._id || '',
            conversationId: item._id,
          })
        }
        activeOpacity={0.7}
      >
        <View className="bg-white/5 rounded-2xl p-4 border border-white/10 flex-row items-center">
          <View className="relative">
            <Image
              source={getAvatarUri(other?.profile?.avatar_url)}
              className="w-14 h-14 rounded-full border border-pink-500/30"
              resizeMode="cover"
            />
            {other && (
              <View
                className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-black ${onlineUserIds.has(other._id) ? 'bg-green-500' : 'bg-red-500'
                  }`}
              />
            )}
          </View>
          <View className="flex-1 ml-4">
            <View className="mb-1">
              <Text className="text-white text-base font-bold" numberOfLines={1}>
                {other ? (other.profile?.display_name || other.username) : 'Người dùng'}
              </Text>
            </View>
            <Text className="text-gray-400 text-sm" numberOfLines={1}>
              {lastMsg}
            </Text>
          </View>
          <View className="ml-2">
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // ===================== EMPTY STATES =====================

  const EmptyConversations = () => (
    <View className="items-center py-10 px-6">
      <View className="w-20 h-20 rounded-full bg-white/5 items-center justify-center mb-4">
        <Ionicons name="chatbubbles-outline" size={36} color="#666" />
      </View>
      <Text className="text-gray-400 text-center text-sm leading-5">
        Chưa có tin nhắn để hiển thị.{'\n'}Hãy tìm bạn để bắt đầu trò chuyện!
      </Text>
    </View>
  );

  const EmptyFriends = () => (
    <View className="items-center py-6 px-6">
      <Text className="text-gray-500 text-sm text-center">
        Chưa có bạn bè. Hãy bắt đầu tìm bạn! 👋
      </Text>
    </View>
  );

  const EmptySearchResults = () => (
    <View className="items-center py-10 px-6">
      <Ionicons name="search-outline" size={40} color="#666" />
      <Text className="text-gray-500 text-sm mt-3 text-center">
        Không tìm thấy người dùng nào cho "{searchText}"
      </Text>
    </View>
  );

  // ===================== MAIN RENDER =====================

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View className="px-5 py-3 border-b border-white/10">
        {isSearchActive ? (
          /* Search Bar Active */
          <View className="flex-row items-center">
            <View className="flex-1 flex-row items-center bg-white/10 rounded-full px-4 py-2.5 mr-3">
              <Ionicons name="search" size={18} color="#9CA3AF" />
              <TextInput
                className="flex-1 text-white text-base ml-2"
                placeholder="Tìm kiếm người dùng..."
                placeholderTextColor="#6B7280"
                value={searchText}
                onChangeText={handleSearchChange}
                autoFocus
              />
              {searchText.length > 0 && (
                <TouchableOpacity onPress={() => handleSearchChange('')}>
                  <Ionicons name="close-circle" size={18} color="#6B7280" />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity onPress={deactivateSearch}>
              <Text className="text-pink-500 font-medium text-sm">Hủy</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Normal Header */
          <View className="flex-row justify-between items-center">
            <TouchableOpacity
              className="w-10 h-10 rounded-full bg-white/10 items-center justify-center"
              activeOpacity={0.7}
              onPress={activateSearch}
            >
              <Ionicons name="search" size={20} color="white" />
            </TouchableOpacity>

            <Text className="text-white text-xl font-bold">Trò chuyện</Text>

            <TouchableOpacity
              className="w-10 h-10 rounded-full bg-white/10 items-center justify-center"
              activeOpacity={0.7}
              onPress={activateSearch}
            >
              <Ionicons name="person-add-outline" size={20} color="white" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Search Results */}
      {isSearchActive ? (
        <View className="flex-1">
          {loadingSearch ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="small" color="#EC4899" />
            </View>
          ) : searchText.trim().length === 0 ? (
            <View className="flex-1 items-center justify-center">
              <Ionicons name="search" size={48} color="#374151" />
              <Text className="text-gray-600 text-base mt-3">Nhập tên để tìm bạn bè</Text>
            </View>
          ) : searchResults.length === 0 ? (
            <EmptySearchResults />
          ) : (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item._id}
              renderItem={renderSearchResult}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingTop: 8 }}
              ItemSeparatorComponent={() => <View className="h-px bg-white/5 mx-6" />}
            />
          )}
        </View>
      ) : (
        /* Main Content */
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>

          {/* Active Friends Section */}
          <View className="mt-5 mb-3">
            <View className="px-5 mb-3 flex-row items-center justify-between">
              <Text className="text-white text-base font-bold">Đang hoạt động</Text>
              <TouchableOpacity onPress={activateSearch}>
                <Text className="text-pink-500 text-xs font-medium">Tìm bạn +</Text>
              </TouchableOpacity>
            </View>

            {loadingFriends ? (
              <View className="px-5 py-4">
                <ActivityIndicator size="small" color="#EC4899" />
              </View>
            ) : friends.length === 0 ? (
              <EmptyFriends />
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="px-5"
                contentContainerStyle={{ paddingRight: 20 }}
              >
                {friends.map(renderActiveFriend)}
              </ScrollView>
            )}
          </View>

          {/* Divider */}
          <View className="h-px bg-white/10 mx-5 my-3" />

          {/* Recent Conversations Section */}
          <View className="px-5 mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-white text-base font-bold">Tin nhắn gần đây</Text>
            </View>

            {loadingConversations ? (
              <View className="py-8 items-center">
                <ActivityIndicator size="small" color="#EC4899" />
              </View>
            ) : conversations.length === 0 ? (
              <EmptyConversations />
            ) : (
              <FlatList
                data={conversations}
                keyExtractor={(item) => item._id}
                renderItem={renderConversationItem}
                scrollEnabled={false}
                extraData={currentUserId}
              />
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
