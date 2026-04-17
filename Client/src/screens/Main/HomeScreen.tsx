import React, { useState, useRef, useEffect, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, Modal, TouchableWithoutFeedback } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSocket } from "../../context/SocketContext";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import { QUICK_PLAY, QuickPlayItem } from "../../constants/quickPlay";
import ProfileMenu from "../../components/ModalProfile/ProfileMenu";
import UserAvatar from "../../components/ModalProfile/UserAvatar";
import { PanResponder, PanResponderInstance } from "react-native";
import { useMusic } from "../../context/MusicContext";
import { LinearGradient } from "expo-linear-gradient";
import { getAllArtists, Artist } from "../../API/artistAPI";
import { getAdminAlbums, Playlist } from "../../API/playlistAPI";
import { getNotificationsAPI } from "../../API/notificationAPI";
import { Image } from "expo-image";
import { getAIRecommendations, getAIPlaylists, AIMix } from "../../API/aiAPI";
import { Song } from "../../API/musicAPI";


export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSleepTimer, setShowSleepTimer] = useState(false);
  const { startSleepTimer, cancelSleepTimer, sleepTimer, playSong, setQueue } = useMusic();
  const { unreadNotificationCount, setUnreadNotificationCount } = useSocket();
  const [quickPlayItems, setQuickPlayItems] = useState<QuickPlayItem[]>(QUICK_PLAY);
  const [adminAlbums, setAdminAlbums] = useState<Playlist[]>([]);
  const [aiRecs, setAiRecs] = useState<Song[]>([]);
  const [aiMixes, setAiMixes] = useState<AIMix[]>([]);
  const [loadingAI, setLoadingAI] = useState(true);

  // Seed badge thông báo 1 lần khi mở app, socket tự cập nhật realtime sau đó
  useEffect(() => {
    getNotificationsAPI()
      .then(data => setUnreadNotificationCount(data.unreadCount ?? 0))
      .catch(() => {});
  }, []);

  // Fetch artists và chọn ngẫu nhiên 1 artist
  useEffect(() => {
    const loadRandomArtist = async () => {
      try {
        const artists: Artist[] = await getAllArtists();
        if (artists && artists.length > 0) {
          const randomArtist = artists[Math.floor(Math.random() * artists.length)];
          setQuickPlayItems(prev =>
            prev.map(item =>
              item.type === 'artist'
                ? { ...item, title: randomArtist.name, artistId: randomArtist._id }
                : item
            )
          );
        }
      } catch (err) {
        // Giữ nguyên placeholder nếu lỗi
      }
    };
    loadRandomArtist();
  }, []);

  // Fetch admin albums — dùng cho cả quick play slot VÀ section album nổi bật
  useEffect(() => {
    const loadRandomAlbum = async () => {
      try {
        const albums = await getAdminAlbums();
        if (albums && albums.length > 0) {
          setAdminAlbums(albums);
          const randomAlbum = albums[Math.floor(Math.random() * albums.length)];
          setQuickPlayItems(prev =>
            prev.map(item =>
              item.type === 'album'
                ? { ...item, title: randomAlbum.name, albumId: randomAlbum._id }
                : item
            )
          );
        } else {
          setQuickPlayItems(prev =>
            prev.map(item =>
              item.type === 'album'
                ? { ...item, title: "Khám phá Album" }
                : item
            )
          );
        }
      } catch (err) {
        console.error("[Home] Error loading albums:", err);
      }
    };
    loadRandomAlbum();
  }, []);

  // Fetch AI Recommendations & Playlists
  useEffect(() => {
    const loadAIData = async () => {
      setLoadingAI(true);
      try {
        const [recs, mixes] = await Promise.all([
          getAIRecommendations(),
          getAIPlaylists()
        ]);
        setAiRecs(recs);
        setAiMixes(mixes);
      } catch (err) {
        console.error("[Home] AI Loading error:", err);
      } finally {
        setLoadingAI(false);
      }
    };
    loadAIData();
  }, []);

  const panResponder = useRef<PanResponderInstance>(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return (
          Math.abs(gestureState.dx) > 30 &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) &&
          gestureState.dx > 0 &&
          gestureState.x0 < 25);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > 50) {
          setShowProfileMenu(true);
        }
      },
    })
  ).current;

  const handleSleepTimerOption = (minutes: number | null) => {
    if (minutes === null) {
      cancelSleepTimer();
    } else {
      startSleepTimer(minutes);
    }
    setShowSleepTimer(false);
  };

  const sleepTimerOptions = [
    { label: "Tắt hẹn giờ", value: null },
    { label: "15 phút", value: 15 },
    { label: "30 phút", value: 30 },
    { label: "45 phút", value: 45 },
    { label: "60 phút", value: 60 },
  ];

  return (
    <SafeAreaView className="flex-1 bg-black" edges={["top"]}>
      <View {...panResponder.panHandlers} style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 20, zIndex: 50, }} />
      {/* HEADER */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <View className="flex-row items-center">
          <UserAvatar size={40} onPress={() => setShowProfileMenu(true)} />
          <Text className="text-white text-2xl font-bold ml-4">Welcome back</Text>
        </View>

        <View className="flex-row gap-4 items-center">
          {/* Notification Bell Button */}
          <TouchableOpacity
            onPress={() => navigation.navigate("NotificationScreen")}
            style={{ position: 'relative' }}
          >
            <Ionicons name="notifications-outline" size={22} color="white" />
            {unreadNotificationCount > 0 && (
              <View
                style={{
                  position: 'absolute',
                  top: -5,
                  right: -6,
                  backgroundColor: '#EC4899',
                  borderRadius: 9,
                  minWidth: 18,
                  height: 18,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2,
                  borderColor: '#000',
                  paddingHorizontal: 3,
                }}
              >
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>
                  {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowSleepTimer(true)}>
            <Ionicons
              name={sleepTimer ? "time" : "time-outline"}
              size={22}
              color={sleepTimer ? "#EC4899" : "white"}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
            <Ionicons name="settings-outline" size={22} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* CONTENT */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* QUICK PLAY */}
        <View className="px-4 mt-2">
          <View className="flex-row flex-wrap gap-y-3" style={{ justifyContent: "space-between" }}>
            {quickPlayItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.75}
                onPress={() => {
                  if (item.type === 'artist' && item.artistId) {
                    navigation.navigate('ArtistDetail', { artistId: item.artistId, artistName: item.title });
                  } else if (item.type === 'album') {
                    if (item.albumId) {
                      navigation.navigate('AlbumDetail', { albumId: item.albumId });
                    } else {
                      // Nếu chưa load được album, có thể dẫn tới trang Playlists chung hoặc không làm gì
                      navigation.navigate('Playlists', { title: item.title });
                    }
                  } else {
                    navigation.navigate(item.screen as any, { title: item.title, playlistId: item.playlistId });
                  }
                }}
                style={{
                  width: "48.5%",
                  borderRadius: 10,
                  overflow: "hidden",
                  backgroundColor: "#1c1c1e",
                  flexDirection: "row",
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.06)",
                }}
              >
                <LinearGradient
                  colors={item.colors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ width: 52, height: 52, alignItems: "center", justifyContent: "center" }}
                >
                  <Ionicons name={item.icon as any} size={22} color="white" />
                </LinearGradient>
                <Text
                  className="text-white font-semibold flex-1 px-2"
                  numberOfLines={1}
                  style={{ fontSize: 13 }}
                >
                  {item.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ─── ĐỀ XUẤT CHO BẠN — Genre Playlists ─── */}
        <View className="mt-6">
          <Text className="text-white text-2xl font-bold px-4 mb-1">Đề xuất cho bạn</Text>
          <Text className="text-gray-400 text-sm px-4 mb-4">Playlist nhạc tự động theo thể loại</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-4 px-4">
              {[
                {
                  genre: "pop",
                  title: "Pop Hits",
                  desc: "Những bài pop đang hot",
                  colors: ["#EC4899", "#9333EA"] as [string, string],
                  icon: "musical-notes",
                },
                {
                  genre: "ballad",
                  title: "Ballad Buồn",
                  desc: "Nhạc tâm trạng, sâu lắng",
                  colors: ["#3B82F6", "#1D4ED8"] as [string, string],
                  icon: "heart",
                },
                {
                  genre: "rap",
                  title: "Rap Việt",
                  desc: "Rap & Hip-hop đỉnh cao",
                  colors: ["#F59E0B", "#D97706"] as [string, string],
                  icon: "mic",
                },
                {
                  genre: "edm",
                  title: "EDM / Electronic",
                  desc: "Nhạc điện tử sôi động",
                  colors: ["#06B6D4", "#0891B2"] as [string, string],
                  icon: "pulse",
                },
                {
                  genre: "indie",
                  title: "Indie & Chill",
                  desc: "Nhạc indie nhẹ nhàng",
                  colors: ["#10B981", "#059669"] as [string, string],
                  icon: "leaf",
                },
              ].map((item) => (
                <TouchableOpacity
                  key={item.genre}
                  activeOpacity={0.75}
                  onPress={() =>
                    navigation.navigate("GenrePlaylist", {
                      genre: item.genre,
                      title: item.title,
                    })
                  }
                  style={{ width: 160, borderRadius: 14, overflow: "hidden", backgroundColor: "#1c1c1e" }}
                >
                  {/* Cover gradient */}
                  <LinearGradient
                    colors={item.colors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ height: 120, alignItems: "center", justifyContent: "center" }}
                  >
                    <Ionicons name={item.icon as any} size={52} color="rgba(255,255,255,0.9)" />
                  </LinearGradient>

                  {/* Info */}
                  <View style={{ padding: 12 }}>
                    <Text
                      className="text-white font-bold"
                      numberOfLines={1}
                      style={{ fontSize: 14, marginBottom: 3 }}
                    >
                      {item.title}
                    </Text>
                    <Text
                      className="text-gray-400"
                      numberOfLines={2}
                      style={{ fontSize: 12, lineHeight: 17 }}
                    >
                      {item.desc}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>


        {/* ─── CÁC SECTION KHÁC ─── */}

        {/* Album nổi bật — dữ liệu thật từ admin */}
        {adminAlbums.length > 0 && (
          <View className="mt-6">
            <Text className="text-white text-2xl font-bold px-4 mb-1">Album nổi bật</Text>
            <Text className="text-gray-400 text-sm px-4 mb-4">Tuyển tập âm nhạc do UniVibe chọn lọc</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-4 px-4">
                {adminAlbums.map((album) => (
                  <TouchableOpacity
                    key={album._id}
                    activeOpacity={0.75}
                    onPress={() => navigation.navigate("AlbumDetail", { albumId: album._id })}
                    style={{ width: 160, borderRadius: 14, overflow: "hidden", backgroundColor: "#1c1c1e" }}
                  >
                    {album.cover_image ? (
                      <Image
                        source={album.cover_image}
                        style={{ width: 160, height: 160, borderRadius: 12 }}
                        contentFit="cover"
                        cachePolicy="memory-disk"
                      />
                    ) : (
                      <LinearGradient
                        colors={["#EC4899", "#9333EA"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{ width: 160, height: 160, borderRadius: 12, alignItems: "center", justifyContent: "center" }}
                      >
                        <Ionicons name="musical-notes" size={52} color="rgba(255,255,255,0.9)" />
                      </LinearGradient>
                    )}
                    <View style={{ padding: 10 }}>
                      <Text
                        className="text-white font-bold"
                        numberOfLines={1}
                        style={{ fontSize: 14, marginBottom: 3 }}
                      >
                        {album.name}
                      </Text>
                      <Text className="text-gray-400" numberOfLines={1} style={{ fontSize: 12 }}>
                        {(() => {
                          const firstSong = album.tracks?.[0]?.song_id as any;
                          const artistName = firstSong?.artist_ids?.[0]?.name
                            ?? firstSong?.artist
                            ?? album.description;
                          return artistName ? `Album của ${artistName}` : "Album";
                        })()}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* AI GỢI Ý NHẠC CHO BẠN */}
        {aiRecs.length > 0 && (
          <View className="mt-6">
            <Text className="text-white text-2xl font-bold px-4 mb-3">
              AI gợi ý nhạc cho bạn
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-4 px-4">
                {aiRecs.map((song) => (
                  <TouchableOpacity
                    key={song._id}
                    activeOpacity={0.75}
                    onPress={() => {
                       playSong(song);
                       setQueue(aiRecs);
                    }}
                    style={{ width: 160, borderRadius: 14, overflow: "hidden", backgroundColor: "#1c1c1e" }}
                  >
                    {song.cover_image ? (
                     <Image 
                        source={song.cover_image} 
                        style={{ width: 160, height: 160, borderRadius: 12 }}
                        contentFit="cover"
                        cachePolicy="memory-disk"
                     />
                    ) : (
                      <LinearGradient
                        colors={["#EC4899", "#9333EA"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{ width: 160, height: 160, borderRadius: 12, alignItems: "center", justifyContent: "center" }}
                      >
                         <Ionicons name="musical-note" size={52} color="rgba(255,255,255,0.9)" />
                      </LinearGradient>
                    )}
                    <View style={{ padding: 10 }}>
                      <Text className="text-white font-bold" numberOfLines={1} style={{ fontSize: 14, marginBottom: 3 }}>
                        {song.title}
                      </Text>
                      <Text className="text-gray-400" numberOfLines={1} style={{ fontSize: 12 }}>
                        {song.artist_ids?.[0]?.name || "Artist"}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* AI TẠO PLAYLIST CHO BẠN – Daily Mixes */}
        {aiMixes.length > 0 && (
          <View className="mt-10">
            <View className="px-4 mb-4">
              <Text className="text-white text-2xl font-bold">AI tạo playlist cho bạn</Text>
              <Text className="text-gray-400 text-sm mt-0.5">Mix nhạc không giới hạn</Text>
            </View>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-5 px-4">
                {aiMixes.map((mix, idx) => (
                  <TouchableOpacity
                    key={idx}
                    activeOpacity={0.8}
                    className="w-44"
                    onPress={() => {
                        navigation.navigate("AIPlaylistDetail", { 
                            title: mix.name, 
                            songs: mix.tracks,
                            description: mix.desc 
                        });
                    }}
                  >
                    <View className="w-44 h-44 rounded-2xl overflow-hidden bg-neutral-900 shadow-xl border border-white/5">
                       {/* Collage Mosaic for the Mix */}
                       <View className="flex-row flex-wrap w-full h-full">
                          {mix.tracks.slice(0, 4).map((song, sIdx) => (
                            <Image 
                              key={sIdx}
                              source={song.cover_image} 
                              className="w-[22] h-[22]" // roughly half
                              style={{ width: '50%', height: '50%' }}
                              contentFit="cover"
                            />
                          ))}
                          {mix.tracks.length === 0 && (
                             <LinearGradient 
                               colors={["#4c1d95", "#831843"]} 
                               className="w-full h-full items-center justify-center"
                             >
                                <Ionicons name="sparkles" size={44} color="white" />
                             </LinearGradient>
                          )}
                          {/* Overlay with subtle gradient to make title pop */}
                          <LinearGradient
                            colors={["transparent", "rgba(0,0,0,0.6)"]}
                            className="absolute inset-x-0 bottom-0 h-1/2"
                          />
                       </View>
                    </View>
                    <View className="mt-3">
                      <Text className="text-white font-bold text-[15px]" numberOfLines={1}>
                        {mix.name}
                      </Text>
                      <Text className="text-gray-400 text-[11px] font-medium leading-[14px] mt-1" numberOfLines={2}>
                        {mix.desc || "Dành riêng cho bạn bởi AI UniVibe"}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

      </ScrollView>

      {/* PROFILE MENU (CUSTOM – KHÔNG DRAWER) */}
      <ProfileMenu isVisible={showProfileMenu} onClose={() => setShowProfileMenu(false)} />

      {/* SLEEP TIMER MODAL */}
      <Modal
        visible={showSleepTimer}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSleepTimer(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowSleepTimer(false)}>
          <View className="flex-1 bg-black/50 justify-center items-center">
            <TouchableWithoutFeedback>
              <View className="bg-neutral-900 w-4/5 rounded-2xl p-6 border border-white/10">
                <Text className="text-white text-xl font-bold mb-4 text-center">Hẹn giờ tắt nhạc</Text>

                {sleepTimerOptions.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    className="py-3 border-b border-white/5 last:border-0 flex-row justify-between items-center"
                    onPress={() => handleSleepTimerOption(option.value)}
                  >
                    <Text className={`text-base ${(option.value === null && sleepTimer === null) || option.value === sleepTimer
                      ? "text-pink-500 font-bold"
                      : "text-white"
                      }`}>
                      {option.label}
                    </Text>
                    {((option.value === null && sleepTimer === null) || option.value === sleepTimer) && (
                      <Ionicons name="checkmark" size={20} color="#EC4899" />
                    )}
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  className="mt-4 py-3 bg-neutral-800 rounded-xl items-center"
                  onPress={() => setShowSleepTimer(false)}
                >
                  <Text className="text-white font-semibold">Đóng</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

    </SafeAreaView>
  );
}
