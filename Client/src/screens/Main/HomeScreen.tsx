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

        {/* SECTIONS */}
        {[
          {
            title: "Nghe lại",
            desc: "UniVibe AI chọn nhạc theo gu của bạn",
          },
          {
            title: "Đề xuất cho bạn",
            desc: "UniVibe AI tạo playlist theo gu của bạn",
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
