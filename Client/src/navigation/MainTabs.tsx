import React, { useCallback, useEffect, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import HomeScreen from "../screens/Main/HomeScreen";
import HomeStack from "./HomeStack";
import SearchScreen from "../screens/Main/SearchScreen";
import LibraryScreen from "../screens/Main/LibraryScreen";
import ChatScreen from "../screens/ChatRoom/ChatScreen";
import CreateModal from "../components/CreatePopUp/CreateModal";
import ListenModal from "../components/Listenmodal/ModalList";
import JamInfoModal from "../components/Listenmodal/JamInfo";
import JamMiniPlayer from "../components/Music/JamMiniPlayer";
import { useJamInvite, JamInviteNotif } from "../context/JamInviteContext";
import { MainTabParamList } from "./types";
import MiniPlayer from "../components/Music/MiniPlayer";
import { useMusic } from "../context/MusicContext";
import { useSocket } from "../context/SocketContext";
import CreatePlaylistModal from "../components/Playlist/CreatePlaylistModal";
import { createRoomAPI } from "../API/roomAPI";
import { Song } from "../API/musicAPI";
import { getMeAPI } from "../API/userAPI";
import { resolveAvatarUrl } from "../API/notificationAPI";
import JamInviteModal from "../components/Listenmodal/InviteModel";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
  const [showCreate, setShowCreate] = useState(false);
  const [showListenModal, setShowListenModal] = useState(false);
  const [showJamInfo, setShowJamInfo] = useState(false);
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  /** Mời bạn bè từ nút + trên JamMiniPlayer (render ngoài Modal context) */
  const [showMiniInvite, setShowMiniInvite] = useState(false);
  const [showInviteFromMini, setShowInviteFromMini] = useState(false);
  // SafeArea để đặt JamMiniPlayer đúng vị trí trên iPhone
  const insets = useSafeAreaInsets();
  // Tab bar height = 80 + safe area bottom
  const TAB_BAR_HEIGHT = 80 + insets.bottom;

  // ── Jam Room state ─────────────────────────────────────────────────────
  const [roomId, setRoomId] = useState<string | undefined>(undefined);
  const [jamName, setJamName] = useState<string>('Jam của bạn');
  /** Avatar URLs of all participants (host first, then guests) */
  const [participantAvatars, setParticipantAvatars] = useState<(string | null)[]>([]);
  /** Queue riêng cho Jam — bắt đầu rỗng, chỉ có bài được thêm trong phòng */
  const [jamQueue, setJamQueue] = useState<Song[]>([]);
  /** Bài hát hiện tại của Jam (null = chưa có, chỉ set khi có bài trong Jam) */
  const [jamCurrentSong, setJamCurrentSong] = useState<Song | null>(null);
  /** true nếu user hiện tại là người tạo phòng, false nếu là khách được mời */
  const [isHost, setIsHost] = useState(true);

  const {
    loadLastPlayed, currentSong, appendToQueue, miniPlayerVisible,
    playSong, isPlaying, togglePlayPause,
    enterJamMode, exitJamMode, registerOnQueueExhausted,
  } = useMusic();
  const { socket, currentUserId } = useSocket();
  const { addInvite, setOnJoinJam } = useJamInvite();

  useEffect(() => {
    if (!currentSong) {
      loadLastPlayed();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Lắng nghe queue_updated từ các thành viên khác add bài ──────────────
  useEffect(() => {
    if (!socket || !roomId) return;

    const onQueueUpdated = ({ songInfo }: { songInfo: Song }) => {
      if (!songInfo) return;
      // Chỉ cập nhật UI state — KHÔNG auto-play
      // Việc phát nhạc sẽ do host kích hoạt bằng nút Play → music_action → music_sync
      setJamQueue(prev => {
        if (prev.some(s => s._id === songInfo._id)) return prev;
        return [...prev, songInfo];
      });
      setJamCurrentSong(prev => prev ?? songInfo);
    };

    socket.on('queue_updated', onQueueUpdated);
    return () => {
      socket.off('queue_updated', onQueueUpdated);
    };
  }, [socket, roomId]);

  // ── Đăng ký callback khi Jam queue hết bài ───────────────────────────────────
  useEffect(() => {
    if (!roomId) {
      registerOnQueueExhausted(null);
      return;
    }
    registerOnQueueExhausted(() => {
      // Bài cuối trong Jam kết thúc — xóa khỏi queue và reset player
      setJamQueue(prev => {
        if (prev.length === 0) return prev;
        return []; // Xóa toàn bộ (chỉ còn 1 bài là bài cứa cuối)
      });
      setJamCurrentSong(null);
    });
    return () => { registerOnQueueExhausted(null); };
  }, [roomId, registerOnQueueExhausted]);

  // ── Lắng nghe participants avatar để truyền vào ModalList ────────────────
  useEffect(() => {
    if (!socket || !roomId) return;

    const onJoined = (user: { _id: string; avatar_url?: string; profile?: { avatar_url?: string } }) => {
      // Bỏ qua chính mình — avatar đã được seed local khi tạo/join phòng
      if (user._id === currentUserId) return;
      // Server có thể trả avatar ở 2 vị trí khác nhau
      const avatarUrl = user.avatar_url ?? user.profile?.avatar_url ?? null;
      setParticipantAvatars(prev => {
        // Tránh duplicate theo userId bằng index (mỗi user 1 slot)
        // Lần đầu join → append; không thể dùng avatar để dedup vì có thể null
        return [...prev, avatarUrl];
      });
    };

    const onLeft = ({ userId }: { userId: string }) => {
      // Không thể remove chính xác theo userId vì chỉ lưu avatar
      // Refetch sẽ xử lý sau; hiện tại chỉ pop avatar cuối
      setParticipantAvatars(prev => prev.slice(0, -1));
    };

    // Lắng nghe sync_current_state để set jamCurrentSong cho guest (khách join phòng đã có bài)
    const onSyncState = (data: any) => {
      // Chỉ dùng khi là guest và phòng đã có bài được thêm trong Jam
      // (tránh lấy bài cũ của host tước khi bật Jam)
      if (!isHost && data.song && data.queue && data.queue.length > 0) {
        setJamCurrentSong(data.song);
        setJamQueue(data.queue);
      }
    };

    socket.on('room_participant_joined', onJoined);
    socket.on('room_participant_left', onLeft);
    socket.on('sync_current_state', onSyncState);
    return () => {
      socket.off('room_participant_joined', onJoined);
      socket.off('room_participant_left', onLeft);
      socket.off('sync_current_state', onSyncState);
    };
  }, [socket, roomId, currentUserId]);

  // ── Lắng nghe music_sync từ server (guest đồng bộ theo host) ──────────────
  useEffect(() => {
    if (!socket || !roomId || isHost) return;

    const onMusicSync = async ({ action, song }: { action: string; song?: Song }) => {
      if (song) {
        // Host chuyển bài — xóa bài đã phát xong và thêm bài mới
        setJamQueue(prev => {
          const withoutOld = prev.filter(s => s._id !== jamCurrentSong?._id);
          return withoutOld.some(s => s._id === song._id) ? withoutOld : [...withoutOld, song];
        });
        setJamCurrentSong(song);
        // Build updated queue cho playSong (cần tính trước do setState async)
        const withoutOld = jamQueue.filter(s => s._id !== jamCurrentSong?._id);
        const updatedQueue = withoutOld.some(s => s._id === song._id) ? withoutOld : [...withoutOld, song];
        await playSong(song, updatedQueue, true); // isJamPlay
      } else if (action === 'play' && !isPlaying) {
        await togglePlayPause();
      } else if (action === 'pause' && isPlaying) {
        await togglePlayPause();
      }
    };

    socket.on('music_sync', onMusicSync);
    return () => { socket.off('music_sync', onMusicSync); };
  }, [socket, roomId, isHost, isPlaying, jamQueue, jamCurrentSong, playSong, togglePlayPause]);

  // ── Host: detect khi MusicContext tự chuyển bài (hết bài hoặc manual skip) ────────
  useEffect(() => {
    if (!roomId || !isHost || !currentSong) return;
    // Bỏ qua nếu không thay đổi hoặc bài mới không nằm trong Jam queue
    if (!jamCurrentSong || jamCurrentSong._id === currentSong._id) return;
    if (!jamQueue.some(s => s._id === currentSong._id)) return;

    const finishedSong = jamCurrentSong;
    // Xóa bài vừa phát xong khỏi queue
    setJamQueue(prev => prev.filter(s => s._id !== finishedSong._id));
    // Cập nhật bài hiện tại
    setJamCurrentSong(currentSong);
    // Thông báo cho guest
    if (socket && roomId) {
      socket.emit('music_action', {
        roomId,
        action: 'next',
        songInfo: currentSong,
        currentTime: 0,
      });
    }
  // chỉ chạy khi currentSong thay đổi, các giá trị khác lấy từ render gần nhất
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSong]);

  // ── Lắng nghe jam_room_ended (host kết thúc, guest tự thoát) ──────────────
  useEffect(() => {
    if (!socket) return;
    const onJamEnded = ({ roomId: endedRoomId }: { roomId: string }) => {
      if (endedRoomId !== roomId) return;
      // Dọn dẹp (giống handleEndJam nhưng không emit thêm)
      exitJamMode();
      registerOnQueueExhausted(null);
      setRoomId(undefined);
      setParticipantAvatars([]);
      setJamQueue([]);
      setJamCurrentSong(null);
      setIsHost(true);
      setShowJamInfo(false);
      setShowListenModal(false);
    };
    socket.on('jam_room_ended', onJamEnded);
    return () => { socket.off('jam_room_ended', onJamEnded); };
  }, [socket, roomId, exitJamMode, registerOnQueueExhausted]);

  // ── Tạo phòng Jam và join socket room ───────────────────────────────────
  const handleStartJam = async () => {
    setShowCreate(false);

    try {
      const name = `Jam`;
      const [room, me] = await Promise.all([
        createRoomAPI(name, undefined),
        getMeAPI(),
      ]);
      const newRoomId = room._id;

      setRoomId(newRoomId);
      setJamName(room.name ?? 'Jam của bạn');
      setIsHost(true);
      setJamQueue([]);
      setJamCurrentSong(null);
      // Resolve avatar URL (có thể là URL tương đối, cần prepend BASE_URL)
      const rawAvatar = me?.profile?.avatar_url ?? null;
      const selfAvatar = resolveAvatarUrl(rawAvatar);
      setParticipantAvatars([selfAvatar]);

      enterJamMode();

      if (socket && currentUserId) {
        socket.emit('join_music_room', { roomId: newRoomId, userId: currentUserId });
      }

      setShowListenModal(true);
    } catch (err) {
      console.error('[MainTabs] createRoom error:', err);
      setIsHost(true);
      setJamQueue([]);
      setJamCurrentSong(null);
      setParticipantAvatars([]);
      setShowListenModal(true);
    }
  };

  // ── Lắng nghe lời mời Jam từ người khác ───────────────────────────────
  useEffect(() => {
    if (!socket) return;
    const onInvite = (payload: { roomId: string; hostName: string; jamName: string; hostAvatar?: string }) => {
      // Thêm vào context → hiển thị trong NotificationScreen (kèm đồng hồ 1 phút)
      addInvite(payload);
    };
    socket.on('jam_invite_received', onInvite);
    return () => { socket.off('jam_invite_received', onInvite); };
  }, [socket, addInvite]);

  // ── Chấp nhận lời mời Jam (gọ từ NotificationScreen qua context) ───
  const handleAcceptInvite = useCallback(async (invite: JamInviteNotif) => {
    setRoomId(invite.roomId);
    setJamName(invite.jamName);
    setJamQueue([]);
    setJamCurrentSong(null);
    setIsHost(false);
    try {
      const me = await getMeAPI();
      const rawAvatar = me?.profile?.avatar_url ?? null;
      // Resolve URL tương đối → tuyệt đối
      const selfAvatar = resolveAvatarUrl(rawAvatar);
      setParticipantAvatars([selfAvatar]);
    } catch {
      setParticipantAvatars([null]);
    }
    enterJamMode();
    if (socket && currentUserId) {
      socket.emit('join_music_room', { roomId: invite.roomId, userId: currentUserId });
    }
    setShowListenModal(true);
  }, [socket, currentUserId, enterJamMode]);  // eslint-disable-line

  // Đăng ký callback vào context để NotificationScreen dùng
  useEffect(() => {
    setOnJoinJam(handleAcceptInvite);
  }, [handleAcceptInvite, setOnJoinJam]);

  // ── Kết thúc Jam ─────────────────────────────────────────────────────────
  const handleEndJam = () => {
    if (socket && roomId && currentUserId) {
      if (isHost) {
        // Host: emit end_jam_room → server sẽ thông báo cho tất cả
        socket.emit('end_jam_room', { roomId, userId: currentUserId });
        // Cleanup local (host cũng sẽ nhận jam_room_ended, nhưng clean ngay cho mượt)
      } else {
        socket.emit('leave_music_room', { roomId, userId: currentUserId });
      }
    }
    exitJamMode();
    registerOnQueueExhausted(null);
    setRoomId(undefined);
    setParticipantAvatars([]);
    setJamQueue([]);
    setJamCurrentSong(null);
    setIsHost(true);
    setShowJamInfo(false);
    setShowListenModal(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,

          tabBarStyle: {
            backgroundColor: "#000",
            borderTopColor: "#222",
            height: 80 + insets.bottom,
            paddingBottom: insets.bottom + 6,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            marginTop: 5,
          },

          tabBarActiveTintColor: "#EC4899",
          tabBarInactiveTintColor: "#aaa",

          tabBarIcon: ({ focused, color }) => {
            let iconName: any;
            switch (route.name) {
              case "Home":
                iconName = focused ? "home" : "home-outline";
                break;
              case "Search":
                iconName = focused ? "search" : "search-outline";
                break;
              case "Library":
                iconName = focused ? "library" : "library-outline";
                break;
              case "Chat":
                iconName = focused ? "chatbubbles" : "chatbubbles-outline";
                break;
              case "Create":
                iconName = showCreate
                  ? "close-circle"
                  : focused
                  ? "add-circle"
                  : "add-circle-outline";
                break;
            }
            return <Ionicons name={iconName} size={30} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeStack} listeners={{ tabPress: () => setShowCreate(false) }} />
        <Tab.Screen name="Search" component={SearchScreen} listeners={{ tabPress: () => setShowCreate(false) }} />
        <Tab.Screen name="Library" component={LibraryScreen} listeners={{ tabPress: () => setShowCreate(false) }} />
        <Tab.Screen name="Chat" component={ChatScreen} listeners={{ tabPress: () => setShowCreate(false) }} />

        <Tab.Screen
          name="Create"
          component={HomeScreen}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              setShowCreate(prev => !prev);
            },
          }}
        />
      </Tab.Navigator>

      {/* Persistent MiniPlayer — chỉ hiện khi không có Jam */}
      {!showCreate && !showListenModal && !showJamInfo && !roomId && <MiniPlayer />}

      {/* Jam Mini Player — hiện khi Jam đang chạy nhưng modal đóng */}
      {roomId && !showListenModal && !showJamInfo && !showCreate && (
        <JamMiniPlayer
          jamCurrentSong={jamCurrentSong}
          jamName={jamName}
          participantAvatars={participantAvatars}
          isPlaying={isPlaying}
          onPlayPause={() => {
            if (jamCurrentSong) {
              const action = isPlaying ? 'pause' : 'play';
              togglePlayPause();
              if (socket && roomId) {
                socket.emit('music_action', { roomId, action, currentTime: 0 });
              }
            }
          }}
          onOpen={() => setShowListenModal(true)}
          onInvite={() => setShowMiniInvite(true)}
          bottomOffset={TAB_BAR_HEIGHT + 8}
        />
      )}

      <CreateModal
        visible={showCreate}
        onClose={() => setShowCreate(false)}
        onPlaylistPress={() => setShowCreatePlaylist(true)}
        onJamPress={handleStartJam}
      />

      <CreatePlaylistModal
        visible={showCreatePlaylist}
        onClose={() => setShowCreatePlaylist(false)}
        onCreated={() => setShowCreatePlaylist(false)}
      />

      {/* ── Jam Modals ── */}
      <ListenModal
        isVisible={showListenModal}
        onClose={() => setShowListenModal(false)}
        onEndJam={handleEndJam}
        onPressAdd={() => setShowJamInfo(true)}
        jamName={jamName}
        participantAvatars={participantAvatars}
        roomId={roomId}
        jamQueue={jamQueue}
        jamCurrentSong={jamCurrentSong}
        isHost={isHost}
        onAddToJamQueue={(song) => {
          setJamQueue(prev =>
            prev.some(s => s._id === song._id) ? prev : [...prev, song]
          );
          setJamCurrentSong(prev => prev ?? song);
        }}
        onJamSongChange={(song) => setJamCurrentSong(song)}
      />

      <JamInfoModal
        isVisible={showJamInfo}
        onClose={() => {
          setShowJamInfo(false);
          setShowInviteFromMini(false);
        }}
        onEndJam={handleEndJam}
        roomId={roomId}
        isHost={isHost}
        autoOpenInvite={showInviteFromMini}
        onInviteOpened={() => setShowInviteFromMini(false)}
      />

      {/* JamInviteModal từ nút + trên mini bar (render ngoài mọi Modal context) */}
      {isHost && (
        <JamInviteModal
          visible={showMiniInvite}
          onClose={() => setShowMiniInvite(false)}
          roomId={roomId}
          jamName={jamName}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({});
