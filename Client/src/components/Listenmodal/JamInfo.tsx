import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  Pressable,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GuestSettingsModal from './GuessModel';
import JamInviteModal from './InviteModel';
import { useSocket } from '../../context/SocketContext';
import { getMeAPI } from '../../API/userAPI';
import { getRoomAPI } from '../../API/roomAPI';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Participant {
  _id: string;
  username: string;
  avatar_url?: string;
  is_host?: boolean;
}

interface JamInfoModalProps {
  isVisible: boolean;
  onClose: () => void;
  onEndJam?: () => void;
  /** Socket room ID của phòng Jam hiện tại */
  roomId?: string;
  /** true nếu user hiện tại là người tạo phòng */
  isHost?: boolean;
}

export default function JamInfoModal({
  isVisible,
  onClose,
  onEndJam,
  roomId,
  isHost = true,
}: JamInfoModalProps) {
  const { socket, currentUserId } = useSocket();
  const insets = useSafeAreaInsets();

  // ── Local state ─────────────────────────────────────────────────────────
  const [showGuestSettings, setShowGuestSettings] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [hostInfo, setHostInfo] = useState<Participant | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loadingHost, setLoadingHost] = useState(false);
  /**
   * Quản lý quyền khách ở cấp JamInfo để state tồn tại qua các lần đóng/mở GuessModel.
   * Mặc định = false (đồng ý rằng khách KHÔNG được điều khiển theo mặc định).
   */
  const [guestCanControl, setGuestCanControl] = useState(false);

  // Reset chỉ khi roomId thay đổi (phòng mới hoàn toàn)
  useEffect(() => {
    setHostInfo(null);
    setParticipants([]);
  }, [roomId]);

  // ── Fetch host + toàn bộ participants mỗi khi modal mở ──────────────────
  useEffect(() => {
    if (!isVisible || !roomId) return;
    let mounted = true;

    const fetchInfo = async () => {
      setLoadingHost(true);
      try {
        const [me, room] = await Promise.all([getMeAPI(), getRoomAPI(roomId)]);
        if (!mounted || !me) return;

        // ── Xác định và set host info ─────────────────────────────────────
        if (isHost) {
          setHostInfo({
            _id: me._id,
            username: me.username,
            avatar_url: me.profile?.avatar_url,
            is_host: true,
          });
        } else {
          // Guest: lấy thông tin host từ populated host_id
          const h = room?.host_id as any;
          if (h) {
            setHostInfo({
              _id: h._id ?? h,
              username: h.username ?? 'Host',
              avatar_url: h.profile?.avatar_url,
              is_host: true,
            });
          }
        }

        // ── Dùng room.participants (đã populated) để build guests list ────
        // participants giờ là array objects { _id, username, profile }
        const hostId = isHost
          ? me._id
          : ((room?.host_id as any)?._id ?? room?.host_id);

        const guests: Participant[] = ((room?.participants ?? []) as any[])
          .filter(p => {
            const pid = p._id ?? p;          // populated object hoặc ObjectId string
            return String(pid) !== String(hostId);
          })
          .map(p => ({
            _id: p._id ?? p,
            username: p.username ?? 'Khách',
            avatar_url: p.profile?.avatar_url,
            is_host: false,
          }));

        // ── ĐọC settings của phòng (guest_can_control) ─────────────────────
        const settings = (room as any)?.settings;
        if (settings && typeof settings.guest_can_control === 'boolean') {
          setGuestCanControl(settings.guest_can_control);
        } else if (settings && typeof settings.guestCanControl === 'boolean') {
          setGuestCanControl(settings.guestCanControl);
        }

        if (mounted) setParticipants(guests);

      } catch (err) {
        console.error('[JamInfo] fetch info error:', err);
      } finally {
        if (mounted) setLoadingHost(false);
      }
    };

    fetchInfo();
    return () => { mounted = false; };
  }, [isVisible, isHost, roomId]);

  // ── Socket: lắng nghe participants join/leave realtime ──────────────────
  useEffect(() => {
    if (!socket || !roomId) return;

    const onJoined = (user: { _id: string; username: string; profile?: { avatar_url?: string } }) => {
      // Lấy avatar từ cả 2 format: flat hoặc nested
      const avatarUrl = (user as any).avatar_url ?? user.profile?.avatar_url;

      // Nếu user join là host đang giữ placeholder → cập nhật thông tin thực
      setHostInfo(prev => {
        if (prev && prev._id === user._id) {
          return { ...prev, username: user.username, avatar_url: avatarUrl };
        }
        return prev;
      });

      // Thêm vào participants nếu chưa có
      setParticipants(prev => {
        if (prev.find(p => p._id === user._id)) return prev;
        return [...prev, { _id: user._id, username: user.username, avatar_url: avatarUrl }];
      });
    };

    const onLeft = ({ userId }: { userId: string }) => {
      setParticipants(prev => prev.filter(p => p._id !== userId));
    };

    socket.on('room_participant_joined', onJoined);
    socket.on('room_participant_left', onLeft);

    return () => {
      socket.off('room_participant_joined', onJoined);
      socket.off('room_participant_left', onLeft);
    };
  }, [socket, roomId]);

  // ── Socket: lắng nghe thay đổi cài đặt khách ──────────────────────────────
  useEffect(() => {
    if (!socket || !roomId) return;
    const onSettings = (data: any) => {
      const val = data?.settings?.guestCanControl ?? data?.settings?.guest_can_control;
      if (typeof val === 'boolean') setGuestCanControl(val);
    };
    socket.on('room_settings_updated', onSettings);
    return () => { socket.off('room_settings_updated', onSettings); };
  }, [socket, roomId]);

  // ── Rời / Kết thúc Jam ─────────────────────────────────────────────────────
  // Tất cả lógic socket được ủy quyền cho MainTabs qua onEndJam()
  const handleLeaveOrEnd = () => {
    onEndJam ? onEndJam() : onClose();
  };

  // ── Tất cả participants (host đầu tiên, sau đó guests) ──────────────────
  const allParticipants: Participant[] = [
    ...(hostInfo ? [hostInfo] : []),
    ...participants.filter(p => p._id !== hostInfo?._id),
  ];

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      {/* MAIN MODAL */}
      <Modal
        animationType="slide"
        transparent
        visible={isVisible}
        onRequestClose={onClose}
      >
        {/* BACKGROUND OVERLAY */}
        <Pressable
          className="absolute inset-0 bg-black/70"
          onPress={onClose}
        />

        {/* MAIN CONTENT */}
        <View
          style={{ elevation: 20 }}
          className="absolute bottom-0 w-full bg-[#1a1a1a] rounded-t-3xl"
        >
          {/* Handle Bar */}
          <View className="items-center pt-3 pb-4">
            <View className="w-12 h-1 bg-gray-600 rounded-full" />
          </View>

          {/* Title */}
          <View className="px-6 pb-4">
            <Text className="text-white text-xl font-bold text-center">
              Thông tin về Jam
            </Text>
          </View>

          {/* MỜI NGƯỜI KHÁC — chỉ host mới thấy */}
          {isHost && (
            <TouchableOpacity
              className="flex-row items-center px-6 py-5 border-t border-gray-800"
              onPress={() => setShowInviteModal(true)}
            >
              <View className="w-14 h-14 bg-neutral-800 rounded-full items-center justify-center mr-4">
                <Ionicons name="add" size={28} color="white" />
              </View>
              <Text className="text-white text-base font-semibold">
                Mời người khác
              </Text>
            </TouchableOpacity>
          )}

          {/* PARTICIPANTS LIST */}
          <ScrollView
            style={{ maxHeight: 240 }}
            showsVerticalScrollIndicator={false}
          >
            {loadingHost ? (
              <View className="items-center py-4">
                <ActivityIndicator color="#EC4899" />
              </View>
            ) : (
              allParticipants.map(participant => (
                <View
                  key={participant._id}
                  className="flex-row items-center px-6 py-4 border-t border-gray-800"
                >
                  {/* Avatar */}
                  <View className="w-14 h-14 rounded-full overflow-hidden mr-4 bg-neutral-700">
                    {participant.avatar_url ? (
                      <Image
                        source={{ uri: participant.avatar_url }}
                        className="w-full h-full"
                      />
                    ) : (
                      <Image
                        source={require('../../../assets/Icon/ava.jpg')}
                        className="w-full h-full"
                      />
                    )}
                  </View>

                  <View className="flex-1">
                    <Text className="text-white text-base font-semibold mb-1">
                      {participant.username}
                    </Text>
                    <Text className="text-gray-400 text-sm">
                      {participant.is_host ? 'Người tổ chức' : 'Khách'}
                    </Text>
                  </View>

                  {participant.is_host && (
                    <Ionicons name="star" size={16} color="#EC4899" />
                  )}
                </View>
              ))
            )}
          </ScrollView>

          {/* BOTTOM BUTTONS — tùy role */}
          <View
            style={[
              jamInfoStyles.bottomBtns,
              { paddingBottom: Math.max(insets.bottom, 16) + 4 },
            ]}
          >
            {isHost ? (
              /* Host: Kết thúc Jam + Cài đặt khách */
              <View className="flex-row gap-3">
                <TouchableOpacity
                  className="flex-1 bg-neutral-800 items-center justify-center py-3 rounded-2xl"
                  onPress={handleLeaveOrEnd}
                >
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="close" size={22} color="white" />
                    <Text className="text-white text-sm font-semibold">Kết thúc Jam</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-1 bg-neutral-800 items-center justify-center py-3 rounded-2xl"
                  onPress={() => setShowGuestSettings(true)}
                >
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="settings-outline" size={22} color="white" />
                    <Text className="text-white text-sm font-semibold">Cài đặt khách</Text>
                  </View>
                </TouchableOpacity>
              </View>
            ) : (
              /* Guest: chỉ Rời Jam */
              <TouchableOpacity
                className="bg-neutral-800 items-center justify-center py-3 rounded-2xl"
                onPress={handleLeaveOrEnd}
              >
                <View className="flex-row items-center gap-2">
                  <Ionicons name="exit-outline" size={22} color="white" />
                  <Text className="text-white text-sm font-semibold">Rời Jam</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      {/* SUB MODALS */}
      {isHost && (
        <JamInviteModal
          visible={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          roomId={roomId}
          jamName="Jam"
        />
      )}

      <GuestSettingsModal
        visible={showGuestSettings}
        onClose={() => setShowGuestSettings(false)}
        roomId={roomId}
        initialGuestCanControl={guestCanControl}
        onChanged={setGuestCanControl}
      />
    </>
  );
}

const jamInfoStyles = StyleSheet.create({
  bottomBtns: {
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(75,85,99,0.4)', // gray-800
  },
});
