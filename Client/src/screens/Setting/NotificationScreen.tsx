import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppNavigation } from '../../navigation/useAppNavigation';
import {
  getNotificationsAPI,
  markConversationReadAPI,
  respondFriendNotifAPI,
  resolveAvatarUrl,
  formatTimeAgo,
  AppNotification,
} from '../../API/notificationAPI';
import { LinearGradient } from 'expo-linear-gradient';
import { useSocket } from '../../context/SocketContext';
import { useJamInvite, JamInviteNotif } from '../../context/JamInviteContext';

export default function NotificationScreen() {
  const navigation = useAppNavigation();
  const { setUnreadNotificationCount } = useSocket();
  const { inviteNotifs, expireInvite, onJoinJam } = useJamInvite();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  // tick để re-render mỗi giây (cập nhật đồng hồ đếm ngược)
  const [tick, setTick] = useState(0);

  // ─── Fetch ────────────────────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    try {
      const data = await getNotificationsAPI();
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error('[NotificationScreen] fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    // Reset badge khi user mở trang thông báo
    setUnreadNotificationCount(0);
  }, [fetchNotifications]);

  // Interval tick mỗi giây để cập nhật countdown
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Tự động đánh dấu expired khi đồng hồ kết thúc
  useEffect(() => {
    const now = Date.now();
    inviteNotifs.forEach(n => {
      if (!n.expired && now >= n.expiresAt) {
        expireInvite(n.id);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  // ─── Actions ──────────────────────────────────────────────────────────────

  /** Bấm vào thông báo tin nhắn → mở chat, đánh dấu đã đọc */
  const handleMessagePress = async (notif: AppNotification) => {
    // Đánh dấu đã đọc local
    setNotifications(prev =>
      prev.map(n => n.id === notif.id ? { ...n, unread: false } : n)
    );

    // Đánh dấu trên server
    if (notif.conversationId) {
      markConversationReadAPI(notif.conversationId).catch(() => {});
      // Điều hướng đến ChatDetail
      if (notif.senderId) {
        navigation.navigate('ChatDetail', {
          userId: notif.senderId,
          conversationId: notif.conversationId,
        });
      }
    }
  };

  /** Chấp nhận / từ chối kết bạn */
  const handleFriendRespond = async (
    notif: AppNotification,
    action: 'accept' | 'reject'
  ) => {
    if (!notif.friendshipId) return;
    setRespondingId(notif.id);
    try {
      await respondFriendNotifAPI(notif.friendshipId, action);
      // Xoá notification khỏi list
      setNotifications(prev => prev.filter(n => n.id !== notif.id));
      if (action === 'accept') {
        Alert.alert('Đã chấp nhận', 'Các bạn đã trở thành bạn bè! 🎉');
      }
    } catch {
      Alert.alert('Lỗi', 'Không thể thực hiện. Vui lòng thử lại.');
    } finally {
      setRespondingId(null);
    }
  };

  /** Bấm vào thông báo album → mở album */
  const handleAlbumPress = (notif: AppNotification) => {
    setNotifications(prev =>
      prev.map(n => n.id === notif.id ? { ...n, unread: false } : n)
    );
    if (notif.albumId) {
      navigation.navigate('AlbumDetail', { albumId: notif.albumId });
    }
  };

  // ─── Styling helpers ──────────────────────────────────────────────────────
  const getIconInfo = (type: string): { name: string; color: string; bg: string } => {
    switch (type) {
      case 'message':
        return { name: 'chatbubble', color: '#06B6D4', bg: '#06B6D410' };
      case 'friend_request':
        return { name: 'person-add', color: '#EC4899', bg: '#EC489910' };
      case 'new_album':
        return { name: 'musical-notes', color: '#8B5CF6', bg: '#8B5CF610' };
      default:
        return { name: 'notifications', color: '#9CA3AF', bg: '#9CA3AF10' };
    }
  };

  const activeInviteCount = inviteNotifs.filter(n => !n.expired).length;
  const unreadCount = notifications.filter(n => n.unread).length + activeInviteCount;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  // ─── Render lời mời Jam ───────────────────────────────────────────────────
  const renderJamInvite = (notif: JamInviteNotif) => {
    const remaining = Math.max(0, Math.ceil((notif.expiresAt - Date.now()) / 1000));
    const isExpired = notif.expired || remaining === 0;
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    const countdownText = `${mins}:${secs.toString().padStart(2, '0')}`;

    return (
      <View
        key={notif.id}
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          paddingHorizontal: 16,
          paddingVertical: 14,
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(255,255,255,0.05)',
          backgroundColor: isExpired ? 'transparent' : 'rgba(236,72,153,0.06)',
        }}
      >
        {/* Avatar host */}
        <View style={{ marginRight: 12 }}>
          <View style={{ position: 'relative' }}>
            {notif.hostAvatar ? (
              <Image
                source={{ uri: notif.hostAvatar }}
                style={{ width: 52, height: 52, borderRadius: 26 }}
              />
            ) : (
              <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: '#2a1325', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="musical-notes" size={26} color="#EC4899" />
              </View>
            )}
            <View style={{ position: 'absolute', bottom: -2, right: -2, width: 20, height: 20, borderRadius: 10, backgroundColor: isExpired ? '#555' : '#EC4899', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#000' }}>
              <Ionicons name="musical-notes" size={10} color="#fff" />
            </View>
          </View>
        </View>

        {/* Nội dung */}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 3 }}>
            <Text
              style={{ flex: 1, fontSize: 15, color: isExpired ? '#9CA3AF' : '#fff', fontWeight: isExpired ? '500' : '700' }}
              numberOfLines={2}
            >
              Bạn được mời vào Jam
            </Text>
            <Text style={{ fontSize: 11, color: '#6B7280', marginLeft: 8, marginTop: 2 }}>
              {formatTimeAgo(new Date(notif.receivedAt).toISOString())}
            </Text>
          </View>

          {isExpired ? (
            <Text style={{ fontSize: 13, color: '#6B7280' }}>
              Lời mời hết hạn
            </Text>
          ) : (
            <>
              <Text style={{ fontSize: 13, color: '#D1D5DB', marginBottom: 10 }}>
                {notif.hostName} mời bạn tham gia «{notif.jamName}»
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <TouchableOpacity
                  onPress={() => onJoinJam?.(notif)}
                  style={{ backgroundColor: '#EC4899', borderRadius: 20, paddingHorizontal: 18, paddingVertical: 7 }}
                >
                  <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>Tham gia</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => expireInvite(notif.id)}
                  style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 }}
                >
                  <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>Từ chối</Text>
                </TouchableOpacity>
                <Text style={{ color: '#EC4899', fontSize: 12, fontWeight: '600', marginLeft: 4 }}>
                  ⏱ {countdownText}
                </Text>
              </View>
            </>
          )}
        </View>
      </View>
    );
  };

  const renderAvatar = (notif: AppNotification) => {
    const avatarUrl = resolveAvatarUrl(notif.avatar);
    const icon = getIconInfo(notif.type);

    if (avatarUrl) {
      return (
        <View style={{ position: 'relative' }}>
          <Image
            source={{ uri: avatarUrl }}
            style={{ width: 52, height: 52, borderRadius: 26 }}
          />
          {/* Type badge */}
          <View
            style={{
              position: 'absolute',
              bottom: -2,
              right: -2,
              width: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: icon.color,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 2,
              borderColor: '#000',
            }}
          >
            <Ionicons name={icon.name as any} size={10} color="#fff" />
          </View>
          {notif.unread && (
            <View
              style={{
                position: 'absolute',
                top: -2,
                right: -2,
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: '#EC4899',
                borderWidth: 2,
                borderColor: '#000',
              }}
            />
          )}
        </View>
      );
    }

    // Album: hiển thị ảnh bìa nếu có
    if (notif.type === 'new_album' && notif.avatar) {
      const albumCover = resolveAvatarUrl(notif.avatar);
      if (albumCover) {
        return (
          <Image
            source={{ uri: albumCover }}
            style={{ width: 52, height: 52, borderRadius: 10 }}
          />
        );
      }
    }

    // Fallback icon
    return (
      <View
        style={{
          width: 52,
          height: 52,
          borderRadius: 26,
          backgroundColor: icon.bg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name={icon.name as any} size={26} color={icon.color} />
      </View>
    );
  };

  const renderNotification = (notif: AppNotification) => {
    const isResponding = respondingId === notif.id;

    return (
      <TouchableOpacity
        key={notif.id}
        activeOpacity={notif.type === 'friend_request' ? 1 : 0.75}
        onPress={() => {
          if (notif.type === 'message') handleMessagePress(notif);
          else if (notif.type === 'new_album') handleAlbumPress(notif);
        }}
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          paddingHorizontal: 16,
          paddingVertical: 14,
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(255,255,255,0.05)',
          backgroundColor: notif.unread ? 'rgba(236,72,153,0.05)' : 'transparent',
        }}
      >
        {/* Avatar / Icon */}
        <View style={{ marginRight: 12 }}>{renderAvatar(notif)}</View>

        {/* Content */}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 3 }}>
            <Text
              style={{
                flex: 1,
                fontSize: 15,
                color: notif.unread ? '#fff' : '#D1D5DB',
                fontWeight: notif.unread ? '700' : '500',
              }}
              numberOfLines={2}
            >
              {notif.title}
            </Text>
            <Text style={{ fontSize: 11, color: '#6B7280', marginLeft: 8, marginTop: 2 }}>
              {formatTimeAgo(notif.time)}
            </Text>
          </View>

          <Text
            style={{ fontSize: 13, color: notif.unread ? '#D1D5DB' : '#6B7280', lineHeight: 18 }}
            numberOfLines={2}
          >
            {notif.message}
          </Text>

          {/* Unread message count badge */}
          {notif.type === 'message' && notif.unreadCount && notif.unreadCount > 1 && (
            <Text style={{ fontSize: 11, color: '#06B6D4', marginTop: 4 }}>
              +{notif.unreadCount - 1} tin nhắn khác
            </Text>
          )}

          {/* Friend request buttons */}
          {notif.type === 'friend_request' && notif.unread && (
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
              <TouchableOpacity
                onPress={() => handleFriendRespond(notif, 'accept')}
                disabled={isResponding}
                style={{
                  backgroundColor: '#EC4899',
                  borderRadius: 20,
                  paddingHorizontal: 18,
                  paddingVertical: 7,
                  opacity: isResponding ? 0.6 : 1,
                }}
              >
                {isResponding ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>
                    Chấp nhận
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleFriendRespond(notif, 'reject')}
                disabled={isResponding}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderRadius: 20,
                  paddingHorizontal: 18,
                  paddingVertical: 7,
                  opacity: isResponding ? 0.6 : 1,
                }}
              >
                <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>
                  Từ chối
                </Text>
              </TouchableOpacity>

              {/* View profile */}
              {notif.requesterId && (
                <TouchableOpacity
                  onPress={() => navigation.navigate('UserProfile', { userId: notif.requesterId! })}
                  style={{ paddingHorizontal: 6, paddingVertical: 7 }}
                >
                  <Text style={{ color: '#EC4899', fontSize: 12 }}>Xem hồ sơ</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Album action button */}
          {notif.type === 'new_album' && notif.unread && (
            <TouchableOpacity
              onPress={() => handleAlbumPress(notif)}
              style={{ alignSelf: 'flex-start', marginTop: 8 }}
            >
              <Text style={{ color: '#8B5CF6', fontSize: 12, fontWeight: '600' }}>
                🎵 Nghe ngay →
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // ─── Main render ──────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: 'rgba(23,23,23,0.95)',
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(255,255,255,0.08)',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(255,255,255,0.1)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={{ marginLeft: 14 }}>
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700' }}>
              Thông báo
            </Text>
            {unreadCount > 0 && (
              <Text style={{ color: '#9CA3AF', fontSize: 12, marginTop: 1 }}>
                {unreadCount} chưa đọc
              </Text>
            )}
          </View>
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity
            onPress={markAllRead}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              backgroundColor: '#EC4899',
              borderRadius: 20,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>
              Đọc tất cả
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Loading */}
      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#EC4899" />
          <Text style={{ color: '#6B7280', marginTop: 12, fontSize: 14 }}>
            Đang tải thông báo...
          </Text>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#EC4899"
              colors={['#EC4899']}
            />
          }
        >
          {/* ── Section lời mời Jam ── */}
          {inviteNotifs.length > 0 && (
            <>
              <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
                <Text style={{ color: '#EC4899', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 }}>
                  LỜI MỜI JAM
                </Text>
              </View>
              {inviteNotifs.map(renderJamInvite)}
            </>
          )}

          {/* Section labels */}
          {notifications.filter(n => n.unread).length > 0 && (
            <>
              <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
                <Text style={{ color: '#EC4899', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 }}>
                  MỚI
                </Text>
              </View>
              {notifications.filter(n => n.unread).map(renderNotification)}
            </>
          )}

          {notifications.filter(n => !n.unread).length > 0 && (
            <>
              <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
                <Text style={{ color: '#6B7280', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 }}>
                  TRƯỚC ĐÂY
                </Text>
              </View>
              {notifications.filter(n => !n.unread).map(renderNotification)}
            </>
          )}

          {/* Empty state */}
          {notifications.length === 0 && (
            <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 80, paddingHorizontal: 40 }}>
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}
              >
                <Ionicons name="notifications-off-outline" size={40} color="#4B5563" />
              </View>
              <Text style={{ color: '#9CA3AF', fontSize: 17, fontWeight: '600', textAlign: 'center', marginBottom: 8 }}>
                Chưa có thông báo
              </Text>
              <Text style={{ color: '#4B5563', fontSize: 14, textAlign: 'center', lineHeight: 20 }}>
                Khi có tin nhắn mới, lời mời kết bạn hoặc album mới, bạn sẽ thấy ở đây.
              </Text>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
