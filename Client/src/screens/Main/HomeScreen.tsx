import React, { useState, useRef, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Modal, TouchableWithoutFeedback } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import { QUICK_PLAY, QuickPlayItem } from "../../constants/quickPlay";
import ProfileMenu from "../../components/ModalProfile/ProfileMenu";
import UserAvatar from "../../components/ModalProfile/UserAvatar";
import { PanResponder, PanResponderInstance } from "react-native";
import { useMusic } from "../../context/MusicContext";
import { LinearGradient } from "expo-linear-gradient";
import { getAllArtists, Artist } from "../../API/artistAPI";
import { getAdminAlbums } from "../../API/playlistAPI";


export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSleepTimer, setShowSleepTimer] = useState(false);
  const { startSleepTimer, cancelSleepTimer, sleepTimer } = useMusic();
  const [quickPlayItems, setQuickPlayItems] = useState<QuickPlayItem[]>(QUICK_PLAY);

  // Fetch artists và chọn ngẫu nhiên 1 artist để thay slot "Chipu"
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

  // Fetch admin albums và chọn ngẫu nhiên 1 album để thay slot "album"
  useEffect(() => {
    const loadRandomAlbum = async () => {
      try {
        console.log("[Home] Fetching admin albums...");
        const albums = await getAdminAlbums();
        console.log("[Home] Received albums count:", albums?.length);
        if (albums && albums.length > 0) {
          const randomAlbum = albums[Math.floor(Math.random() * albums.length)];
          setQuickPlayItems(prev =>
            prev.map(item =>
              item.type === 'album'
                ? { ...item, title: randomAlbum.name, albumId: randomAlbum._id }
                : item
            )
          );
        } else {
          // Nếu không có album nào, đổi title để user biết
          setQuickPlayItems(prev =>
            prev.map(item =>
              item.type === 'album'
                ? { ...item, title: "Khám phá Album" }
                : item
            )
          );
        }
      } catch (err) {
        console.error("[Home] Error loading random album:", err);
        // Giữ nguyên placeholder nếu lỗi
      }
    };
    loadRandomAlbum();
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

        <View className="flex-row gap-4">
          <Ionicons name="notifications-outline" size={22} color="white" />
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
        {[
          {
            title: "Nghe lại",
            desc: "UniVibe AI chọn nhạc theo gu của bạn",
          },
          {
            title: "AI gợi ý nhạc cho bạn",
            desc: "UniVibe AI chọn nhạc theo năm",
          },
          {
            title: "AI tạo playlist cho bạn",
            desc: "UniVibe AI chọn nhạc theo gu của bạn",
          },
          {
            title: "Playlist thịnh hành trong năm",
            desc: "UniVibe AI chọn nhạc theo gu của bạn",
          },
        ].map((section, idx) => (
          <View key={idx} className="mt-6">
            <Text className="text-white text-2xl font-bold px-4 mb-3">
              {section.title}
            </Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-4 px-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <View
                    key={i}
                    className="w-44 bg-neutral-900 rounded-lg p-3"
                  >
                    <View className="w-full h-36 bg-neutral-700 rounded-md mb-2" />
                    <Text
                      className="text-white font-semibold"
                      numberOfLines={1}
                    >
                      Daily Mix {i}
                    </Text>
                    <Text
                      className="text-gray-400 text-xs"
                      numberOfLines={2}
                    >
                      {section.desc}
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        ))}
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
