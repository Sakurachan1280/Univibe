import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Image,
  Pressable,
  TextInput,
  FlatList,
  Share,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getFriendsAPI, searchUsersAPI, SearchUser } from "../../API/socialAPI";
import { useSocket } from "../../context/SocketContext";
import { getMeAPI } from "../../API/userAPI";

interface InviteModalProps {
  visible: boolean;
  onClose: () => void;
  /** Room ID để tạo invite link */
  roomId?: string;
  /** Jam image URI (optional) */
  jamImageUri?: string;
  /** Tên Jam hiển thị trong thông báo */
  jamName?: string;
}

export default function JamInviteModal({
  visible,
  onClose,
  roomId,
  jamImageUri,
  jamName = 'Jam',
}: InviteModalProps) {
  const { socket, currentUserId } = useSocket();

  // ── State ────────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [friends, setFriends] = useState<SearchUser[]>([]);
  const [filteredFriends, setFilteredFriends] = useState<SearchUser[]>([]);
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());
  const [hostName, setHostName] = useState('');
  const [hostAvatar, setHostAvatar] = useState<string | undefined>();

  // ── Load danh sách bạn bè khi mở modal ──────────────────────────────────
  useEffect(() => {
    if (!visible) return;
    let mounted = true;

    const loadFriends = async () => {
      setLoadingFriends(true);
      try {
        const [data, me] = await Promise.all([getFriendsAPI(), getMeAPI()]);
        if (!mounted) return;
        setFriends(data);
        setFilteredFriends(data);
        if (me) {
          setHostName(me.profile?.display_name || me.username || '');
          setHostAvatar(me.profile?.avatar_url);
        }
      } catch (err) {
        console.error('[InviteModal] load friends error:', err);
      } finally {
        if (mounted) setLoadingFriends(false);
      }
    };

    loadFriends();
    setSearchQuery('');
    setInvitedIds(new Set());
    setSearchResults([]);

    return () => { mounted = false; };
  }, [visible]);

  // ── Search với debounce ──────────────────────────────────────────────────
  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setSearchResults([]);
      setFilteredFriends(friends);
      return;
    }

    // Filter bạn bè local trước
    const local = friends.filter(f =>
      f.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.profile?.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredFriends(local);

    // Nếu không tìm thấy trong bạn bè → tìm kiếm toàn bộ user
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length < 2) return;
      setSearchLoading(true);
      try {
        const results = await searchUsersAPI(searchQuery.trim());
        // Loại bỏ bản thân và bạn bè đã có
        const friendIds = new Set(friends.map(f => f._id));
        const others = results.filter(
          u => u._id !== currentUserId && !friendIds.has(u._id)
        );
        setSearchResults(others);
      } catch (err) {
        console.error('[InviteModal] search error:', err);
      } finally {
        setSearchLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // ── Mời bạn bè ──────────────────────────────────────────────────────────
  const handleInvite = useCallback((user: SearchUser) => {
    if (!socket || !roomId || !currentUserId) {
      Alert.alert('Lỗi', 'Không thể gửi lời mời lúc này.');
      return;
    }
    socket.emit('jam_invite', {
      roomId,
      inviteeId: user._id,
      hostName,
      jamName,
      hostAvatar,
    });
    setInvitedIds(prev => new Set(prev).add(user._id));
    Alert.alert('Đã gửi lời mời!', `Đã mời ${user.profile?.display_name || user.username} tham gia Jam.`);
  }, [socket, roomId, currentUserId, hostName, jamName, hostAvatar]);

  // ── Chia sẻ liên kết ────────────────────────────────────────────────────
  const handleShareLink = async () => {
    const link = roomId
      ? `spotichat://jam/${roomId}`
      : 'spotichat://jam';

    try {
      await Share.share({
        message: `Tham gia Jam của mình trên Spotichat!\n${link}`,
        title: 'Mời tham gia Jam',
      });
    } catch (err) {
      console.error('[InviteModal] share error:', err);
    }
  };

  // ── Render 1 user row ────────────────────────────────────────────────────
  const renderUserRow = (user: SearchUser, isOther = false) => {
    const isInvited = invitedIds.has(user._id);
    const displayName = user.profile?.display_name || user.username;
    const avatarUri = user.profile?.avatar_url;

    return (
      <View key={user._id} className="flex-row items-center px-6 py-3">
        {/* Avatar */}
        <View className="w-12 h-12 rounded-full overflow-hidden mr-3 bg-neutral-700">
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} className="w-full h-full" />
          ) : (
            <Image
              source={require('../../../assets/Icon/ava.jpg')}
              className="w-full h-full"
            />
          )}
        </View>

        {/* Name */}
        <View className="flex-1">
          <Text className="text-white text-base font-semibold" numberOfLines={1}>
            {displayName}
          </Text>
          <Text className="text-gray-400 text-sm" numberOfLines={1}>
            @{user.username}
            {isOther && ' • Không phải bạn bè'}
          </Text>
        </View>

        {/* Invite button */}
        <TouchableOpacity
          onPress={() => handleInvite(user)}
          disabled={isInvited}
          className={`px-4 py-2 rounded-full ${isInvited ? 'bg-neutral-700' : 'bg-[#EC4899]'}`}
        >
          <Text className="text-white text-sm font-semibold">
            {isInvited ? 'Đã mời' : 'Mời'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 justify-end bg-black/70"
        onPress={onClose}
      >
        <Pressable
          className="bg-[#1a1a1a] rounded-t-3xl w-full pt-4 pb-8"
          style={{ maxHeight: '85%' }}
          onPress={() => { }}
        >
          {/* Handle */}
          <View className="items-center mb-4">
            <View className="w-12 h-1 bg-gray-600 rounded-full" />
          </View>

          {/* Title */}
          <Text className="text-white text-xl font-bold text-center mb-4">
            Mời bạn bè tham gia Jam của bạn
          </Text>

          {/* Share Link Button */}
          <TouchableOpacity
            onPress={handleShareLink}
            className="mx-6 bg-[#EC4899] py-3 rounded-full items-center justify-center mb-6 flex-row"
          >
            <Ionicons name="share-outline" color="white" size={20} />
            <Text className="text-white font-semibold ml-2">
              Chia sẻ liên kết
            </Text>
          </TouchableOpacity>

          {/* Search Bar */}
          <View className="mx-6 mb-4">
            <View className="flex-row items-center bg-[#2a2a2a] rounded-xl px-3 py-2">
              <Ionicons name="search" size={18} color="#AAA" />
              <TextInput
                placeholder="Tìm kiếm bạn bè..."
                placeholderTextColor="#888"
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="text-white ml-2 flex-1"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={18} color="#888" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Friends / Search Results */}
          <View style={{ maxHeight: 300 }}>
            {loadingFriends ? (
              <View className="items-center py-6">
                <ActivityIndicator color="#EC4899" />
              </View>
            ) : (
              <>
                {/* Bạn bè (filtered) */}
                {filteredFriends.length > 0 && (
                  <>
                    <Text className="text-gray-400 text-xs font-semibold px-6 mb-2 uppercase tracking-wider">
                      Bạn bè
                    </Text>
                    {filteredFriends.map(u => renderUserRow(u))}
                  </>
                )}

                {/* Kết quả tìm kiếm ngoài bạn bè */}
                {searchLoading && (
                  <View className="items-center py-3">
                    <ActivityIndicator size="small" color="#EC4899" />
                  </View>
                )}
                {!searchLoading && searchResults.length > 0 && (
                  <>
                    <Text className="text-gray-400 text-xs font-semibold px-6 mb-2 mt-2 uppercase tracking-wider">
                      Người dùng khác
                    </Text>
                    {searchResults.map(u => renderUserRow(u, true))}
                  </>
                )}

                {/* Empty friends */}
                {filteredFriends.length === 0 && searchResults.length === 0 && !searchLoading && (
                  <View className="items-center py-8 gap-2">
                    <Ionicons name="people-outline" size={36} color="#555" />
                    <Text className="text-gray-500 text-sm">
                      {searchQuery.length > 0
                        ? 'Không tìm thấy người dùng'
                        : 'Chưa có bạn bè nào'}
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>

          {/* Jam Image */}
          {jamImageUri && (
            <View className="px-6 mt-4 flex-row items-center justify-between">
              <View className="flex-1 mr-4">
                <Text className="text-white text-base font-semibold mb-1">
                  Hình ảnh cho Jam của bạn
                </Text>
                <Text className="text-gray-400 text-sm">Nhấn để phóng to</Text>
              </View>
              <TouchableOpacity className="p-1 bg-white rounded-lg">
                <Image
                  source={{ uri: jamImageUri }}
                  style={{ width: 100, height: 100, borderRadius: 8 }}
                />
              </TouchableOpacity>
            </View>
          )}

        </Pressable>
      </Pressable>
    </Modal>
  );
}
