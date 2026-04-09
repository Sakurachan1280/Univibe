import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { BASE_URL } from '../../API/axiosClient';
import { useSocket } from '../../context/SocketContext';
import {
  UserProfileData,
  FriendshipStatus,
  getUserProfileAPI,
  getFriendshipStatusAPI,
  sendFriendRequestAPI,
  respondFriendRequestAPI,
  modifyRelationAPI,
  startChatAPI,
} from '../../API/socialAPI';

type Props = NativeStackScreenProps<RootStackParamList, 'UserProfile'>;

export default function UserProfileScreen({ route, navigation }: Props) {
  const { userId } = route.params;
  const { onlineUserIds } = useSocket();

  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [friendshipStatus, setFriendshipStatus] = useState<FriendshipStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showFriendMenu, setShowFriendMenu] = useState(false);

  useEffect(() => {
    fetchAll();
  }, [userId]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [profile, status] = await Promise.all([
        getUserProfileAPI(userId),
        getFriendshipStatusAPI(userId),
      ]);
      setProfileData(profile);
      setFriendshipStatus(status);
    } catch (e) {
      console.error('Fetch profile error:', e);
      Alert.alert('Lỗi', 'Không thể tải thông tin người dùng.');
    } finally {
      setLoading(false);
    }
  };

  // ===================== AVATAR / COVER =====================

  const getAvatarSource = () => {
    const url = profileData?.profile?.profile?.avatar_url;
    if (!url) return require('../../../assets/Icon/ava.jpg');
    if (url.startsWith('http')) return { uri: url };
    return { uri: `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}` };
  };

  const getCoverSource = () => {
    const url = profileData?.profile?.profile?.cover_url;
    if (!url) return null;
    if (url.startsWith('http')) return { uri: url };
    return { uri: `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}` };
  };

  const getDisplayName = () => {
    return (
      profileData?.profile?.profile?.display_name ||
      profileData?.profile?.username ||
      'Người dùng'
    );
  };

  // Tính thời gian offline
  const formatLastSeen = (lastActiveStr?: string): string => {
    if (!lastActiveStr) return 'Không rõ';
    const diff = Date.now() - new Date(lastActiveStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Vừa xong';
    if (mins < 60) return `${mins} phút trước`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} ngày trước`;
    return `${Math.floor(days / 7)} tuần trước`;
  };

  const isOnline = onlineUserIds.has(userId);
  const lastSeen = profileData?.profile?.status?.last_active;

  // ===================== ACTIONS =====================

  const handleSendRequest = async () => {
    try {
      setActionLoading(true);
      await sendFriendRequestAPI(userId);
      setFriendshipStatus({ status: 'pending_sent', friendshipId: null });
    } catch (e: any) {
      Alert.alert('Lỗi', e?.response?.data?.message || 'Không thể gửi lời mời kết bạn.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    try {
      setActionLoading(true);
      await modifyRelationAPI(userId, 'cancel_request');
      setFriendshipStatus({ status: 'none', friendshipId: null });
    } catch (e: any) {
      Alert.alert('Lỗi', e?.response?.data?.message || 'Không thể hủy lời mời.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!friendshipStatus?.friendshipId) return;
    try {
      setActionLoading(true);
      await respondFriendRequestAPI(friendshipStatus.friendshipId, 'accept');
      setFriendshipStatus({ status: 'friends', friendshipId: friendshipStatus.friendshipId });
    } catch (e: any) {
      Alert.alert('Lỗi', e?.response?.data?.message || 'Không thể chấp nhận lời mời.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!friendshipStatus?.friendshipId) return;
    try {
      setActionLoading(true);
      await respondFriendRequestAPI(friendshipStatus.friendshipId, 'reject');
      setFriendshipStatus({ status: 'none', friendshipId: null });
    } catch (e: any) {
      Alert.alert('Lỗi', e?.response?.data?.message || 'Không thể từ chối lời mời.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnfriend = async () => {
    setShowFriendMenu(false);
    Alert.alert(
      'Hủy kết bạn',
      `Bạn có chắc muốn hủy kết bạn với ${getDisplayName()}?`,
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Hủy kết bạn',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(true);
              await modifyRelationAPI(userId, 'unfriend');
              setFriendshipStatus({ status: 'none', friendshipId: null });
            } catch (e: any) {
              Alert.alert('Lỗi', e?.response?.data?.message || 'Không thể hủy kết bạn.');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleMessage = async () => {
    try {
      setActionLoading(true);
      const { conversationId } = await startChatAPI(userId);
      navigation.navigate('ChatDetail', { userId, conversationId });
    } catch (e: any) {
      Alert.alert('Lỗi', e?.response?.data?.message || 'Không thể mở cuộc trò chuyện.');
    } finally {
      setActionLoading(false);
    }
  };

  // ===================== FRIENDSHIP ACTION SECTION =====================

  const renderFriendshipSection = () => {
    if (!friendshipStatus) return null;
    const { status } = friendshipStatus;

    if (status === 'none') {
      return (
        <View className="items-start">
          <TouchableOpacity
            className="bg-pink-600 rounded-full px-7 py-2.5 active:bg-pink-700"
            onPress={handleSendRequest}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white text-sm font-semibold">Kết bạn</Text>
            )}
          </TouchableOpacity>
        </View>
      );
    }

    if (status === 'pending_sent') {
      return (
        <View className="gap-2">
          <View className="flex-row items-center gap-2">
            <Ionicons name="time-outline" size={16} color="#9CA3AF" />
            <Text className="text-gray-400 text-sm">
              Đã gửi lời mời kết bạn, vui lòng chờ phản hồi
            </Text>
          </View>
          <TouchableOpacity
            className="bg-white/10 border border-white/20 rounded-full px-5 py-2 self-start active:bg-white/20"
            onPress={handleCancelRequest}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white text-sm font-medium">Hủy lời mời</Text>
            )}
          </TouchableOpacity>
        </View>
      );
    }

    if (status === 'pending_received') {
      return (
        <View className="gap-2">
          <View className="flex-row items-center gap-2">
            <Ionicons name="person-add-outline" size={16} color="#EC4899" />
            <Text className="text-pink-400 text-sm font-medium">
              Người này đã gửi lời mời kết bạn với bạn
            </Text>
          </View>
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="bg-pink-600 rounded-full px-6 py-2.5 active:bg-pink-700"
              onPress={handleAccept}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white text-sm font-semibold">Đồng ý</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-white/10 border border-white/20 rounded-full px-6 py-2.5 active:bg-white/20"
              onPress={handleReject}
              disabled={actionLoading}
            >
              <Text className="text-white text-sm font-medium">Từ chối</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (status === 'friends') {
      return (
        <View className="flex-row gap-3 flex-wrap">
          {/* Friends button with dropdown */}
          <View className="relative">
            <TouchableOpacity
              className="bg-white/10 border border-white/20 rounded-full px-5 py-2.5 flex-row items-center gap-2 active:bg-white/20"
              onPress={() => setShowFriendMenu(true)}
              disabled={actionLoading}
            >
              <Ionicons name="people" size={16} color="white" />
              <Text className="text-white text-sm font-medium">Bạn bè</Text>
              <Ionicons name="chevron-down" size={14} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Message button */}
          <TouchableOpacity
            className="bg-pink-600 rounded-full px-5 py-2.5 flex-row items-center gap-2 active:bg-pink-700"
            onPress={handleMessage}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Ionicons name="chatbubble-outline" size={16} color="white" />
                <Text className="text-white text-sm font-semibold">Nhắn tin</Text>
              </>
            )}
          </TouchableOpacity>

          {/* "Đã là bạn bè" label */}
          <View className="w-full flex-row items-center gap-1.5 mt-1">
            <Ionicons name="checkmark-circle" size={14} color="#10B981" />
            <Text className="text-emerald-400 text-xs">Đã là bạn bè</Text>
          </View>
        </View>
      );
    }

    return null;
  };

  // ===================== MAIN RENDER =====================

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>

        {/* Cover Photo + Back Button */}
        <View className="relative">
          <View className="h-52 bg-gray-900">
            {(() => {
              const coverSrc = getCoverSource();
              return coverSrc ? (
                <Image source={coverSrc} className="w-full h-full" resizeMode="cover" />
              ) : (
                // Gradient-like bg
                <View className="w-full h-full bg-gradient-to-b from-gray-800 to-black" />
              );
            })()}
            {/* Overlay */}
            <View className="absolute inset-0 bg-black/30" />
          </View>

          {/* Back Button */}
          <TouchableOpacity
            className="absolute top-4 left-4 w-10 h-10 bg-black/50 rounded-full items-center justify-center z-10"
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Profile Info */}
        <View className="px-5 -mt-14">
          {/* Avatar */}
          <View className="w-28 h-28 rounded-full border-4 border-black overflow-hidden bg-gray-700 mb-4">
            {loading ? (
              <View className="w-full h-full items-center justify-center bg-gray-800">
                <ActivityIndicator size="small" color="#EC4899" />
              </View>
            ) : (
              <Image
                source={getAvatarSource()}
                className="w-full h-full"
                resizeMode="cover"
              />
            )}
          </View>

          {loading ? (
            <View className="py-8 items-center">
              <ActivityIndicator size="large" color="#EC4899" />
            </View>
          ) : (
            <>
              {/* Name & Username */}
              <View className="mb-4">
                <Text className="text-white text-2xl font-bold mb-0.5">
                  {getDisplayName()}
                </Text>
                <Text className="text-gray-400 text-sm mb-2">
                  @{profileData?.profile?.username}
                </Text>
                {/* Online / Offline status */}
                <View className="flex-row items-center gap-1.5">
                  <View
                    className={`w-2.5 h-2.5 rounded-full ${
                      isOnline ? 'bg-green-400' : 'bg-red-500'
                    }`}
                  />
                  <Text
                    className={`text-xs font-medium ${
                      isOnline ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {isOnline
                      ? 'Đang hoạt động'
                      : `Offline · ${formatLastSeen(lastSeen)}`}
                  </Text>
                </View>
              </View>

              {/* Bio */}
              {profileData?.profile?.profile?.bio ? (
                <Text className="text-gray-300 text-sm leading-5 mb-5">
                  {profileData?.profile?.profile?.bio}
                </Text>
              ) : null}

              {/* Friendship Action Section */}
              <View className="mb-6">
                {renderFriendshipSection()}
              </View>

              {/* Divider */}
              <View className="h-px bg-white/10 mb-5" />

              {/* Stats row */}
              <View className="flex-row gap-6 mb-6">
                <View className="items-center">
                  <Text className="text-white text-lg font-bold">
                    {profileData?.playlists?.length || 0}
                  </Text>
                  <Text className="text-gray-500 text-xs">Playlist</Text>
                </View>
              </View>

              {/* Public Playlists */}
              {profileData?.playlists && profileData.playlists.length > 0 && (
                <View>
                  <Text className="text-white text-base font-bold mb-3">
                    Playlist công khai
                  </Text>
                  {profileData.playlists.map((pl: any) => (
                    <View
                      key={pl._id}
                      className="flex-row items-center p-3 bg-white/5 rounded-xl mb-2 border border-white/10"
                    >
                      <View className="w-12 h-12 rounded-lg bg-gray-700 mr-3 items-center justify-center">
                        {pl.cover_image ? (
                          <Image
                            source={{ uri: pl.cover_image }}
                            className="w-full h-full rounded-lg"
                            resizeMode="cover"
                          />
                        ) : (
                          <Ionicons name="musical-notes" size={22} color="#6B7280" />
                        )}
                      </View>
                      <View className="flex-1">
                        <Text className="text-white text-sm font-semibold" numberOfLines={1}>
                          {pl.name}
                        </Text>
                        <Text className="text-gray-400 text-xs mt-0.5">
                          {pl.tracks?.length || 0} bài hát
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Friend Dropdown Menu Modal */}
      <Modal
        visible={showFriendMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFriendMenu(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50"
          activeOpacity={1}
          onPress={() => setShowFriendMenu(false)}
        >
          <View
            className="absolute bg-gray-900 rounded-xl border border-white/10 shadow-xl"
            style={{ top: 200, left: 20, right: 20 }}
          >
            <View className="p-4 border-b border-white/10">
              <Text className="text-gray-400 text-xs font-semibold uppercase tracking-widest">
                Tùy chọn bạn bè
              </Text>
            </View>
            <TouchableOpacity
              className="flex-row items-center gap-3 p-4 active:bg-white/5"
              onPress={handleUnfriend}
            >
              <View className="w-9 h-9 rounded-full bg-red-500/10 items-center justify-center">
                <Ionicons name="person-remove-outline" size={18} color="#EF4444" />
              </View>
              <Text className="text-red-400 text-base font-medium">Hủy kết bạn</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-row items-center gap-3 p-4 active:bg-white/5 rounded-b-xl"
              onPress={() => setShowFriendMenu(false)}
            >
              <View className="w-9 h-9 rounded-full bg-white/5 items-center justify-center">
                <Ionicons name="close" size={18} color="#9CA3AF" />
              </View>
              <Text className="text-gray-300 text-base">Đóng</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
