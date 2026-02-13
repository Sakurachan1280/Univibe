import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState, useRef, useEffect } from "react";
import { PanResponderInstance } from "react-native";
import { PanResponder } from "react-native";
import ProfileMenu from "../../components/ModalProfile/ProfileMenu";
import UserAvatar from "../../components/ModalProfile/UserAvatar";
import { LinearGradient } from 'expo-linear-gradient';

import { Playlist, getMyPlaylists } from "../../API/playlistAPI";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";

export default function LibraryScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [isLoading, setIsLoading] = useState(true);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

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

  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = async () => {
    try {
      setIsLoading(true);
      const data = await getMyPlaylists();
      setPlaylists(data);
    } catch (error) {
      console.error('Error loading playlists:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filters = [
    { id: "all", label: "Tất cả" },
    { id: "albums", label: "Album" },
    { id: "playlists", label: "Playlist" },
    { id: "artists", label: "Nghệ sĩ" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-black" edges={["top"]}>
      <View {...panResponder.panHandlers} style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 20, zIndex: 50 }} />

      {/* HEADER */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <View className="flex-row items-center">
          <UserAvatar size={40} onPress={() => setShowProfileMenu(true)} />
          <Text className="text-white text-2xl font-bold ml-4">Thư viện</Text>
        </View>

        <View className="flex-row gap-4">
          <Ionicons name="notifications-outline" size={22} color="white" />
          <TouchableOpacity onPress={() => navigation.navigate("History")}>
            <Ionicons name="time-outline" size={22} color="white" />
          </TouchableOpacity>
          <Ionicons name="settings-outline" size={22} color="white" />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* FILTER CHIPS */}
        <View className="px-4 mt-4">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                onPress={() => setActiveFilter(filter.id)}
                className={`px-4 py-2 rounded-full ${activeFilter === filter.id
                  ? "bg-pink-500"
                  : "bg-neutral-800"
                  }`}
              >
                <Text className={`font-semibold ${activeFilter === filter.id
                  ? "text-white"
                  : "text-gray-400"
                  }`}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* SORT DROPDOWN */}
        <View className="px-4 mt-4 flex-row items-center justify-between">
          <Text className="text-gray-400 text-sm">Sắp xếp theo:</Text>
          <TouchableOpacity className="flex-row items-center bg-neutral-800 px-3 py-2 rounded-lg">
            <Text className="text-white mr-2">
              {sortBy === "recent" ? "Gần đây" : sortBy === "name" ? "Tên A-Z" : "Ngày tạo"}
            </Text>
            <Ionicons name="chevron-down" size={16} color="white" />
          </TouchableOpacity>
        </View>

        {/* CREATE NEW ALBUM BUTTON */}
        <View className="px-4 mt-6">
          <TouchableOpacity
            activeOpacity={0.8}
            className="rounded-2xl overflow-hidden"
          >
            <LinearGradient
              colors={["#EC4899", "#06B6D4"] as const}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="flex-row items-center justify-center py-4 px-6"
            >
              <Ionicons name="add-circle-outline" size={24} color="white" />
              <Text className="text-white font-bold text-lg ml-3">
                Tạo Playlist Mới
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* ALBUMS GRID */}
        {isLoading ? (
          <View className="py-12 items-center">
            <ActivityIndicator size="large" color="#EC4899" />
            <Text className="text-gray-400 mt-3">Đang tải...</Text>
          </View>
        ) : playlists.length > 0 ? (
          <View className="px-4 mt-6">
            <Text className="text-white text-xl font-bold mb-4">Playlist của tôi</Text>
            <View className="flex-row flex-wrap justify-between">
              {playlists.map((playlist) => (
                <TouchableOpacity
                  key={playlist._id}
                  activeOpacity={0.8}
                  className="w-[48%] mb-4 bg-neutral-900/50 rounded-xl overflow-hidden border border-white/5"
                >
                  {/* Album Cover */}
                  <View className="w-full aspect-square bg-gradient-to-br from-pink-500 to-cyan-500 items-center justify-center">
                    <Ionicons name="musical-notes" size={48} color="rgba(255,255,255,0.8)" />
                  </View>

                  {/* Album Info */}
                  <View className="p-3">
                    <Text className="text-white font-bold text-base" numberOfLines={1}>
                      {playlist.name}
                    </Text>
                    <Text className="text-gray-400 text-sm mt-1">
                      {playlist.songs.length} bài hát
                    </Text>
                    <Text className="text-gray-500 text-xs mt-1">
                      {playlist.isPublic ? "Công khai" : "Riêng tư"}
                    </Text>
                  </View>

                  {/* More Options */}
                  <TouchableOpacity
                    className="absolute top-2 right-2 bg-black/50 rounded-full p-1.5"
                    onPress={(e) => {
                      e.stopPropagation();
                      // Handle more options
                    }}
                  >
                    <Ionicons name="ellipsis-horizontal" size={16} color="white" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          /* EMPTY STATE */
          <View className="px-4 mt-12">
            <View className="bg-neutral-900/50 rounded-2xl p-8 items-center border border-white/5">
              <View className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-500/20 to-cyan-500/20 items-center justify-center mb-4">
                <Ionicons name="albums-outline" size={48} color="#EC4899" />
              </View>
              <Text className="text-white text-xl font-bold mb-2">
                Chưa có album nào
              </Text>
              <Text className="text-gray-400 text-center mb-6">
                Tạo album đầu tiên để bắt đầu{"\n"}sưu tập nhạc của bạn
              </Text>
              <TouchableOpacity
                activeOpacity={0.8}
                className="rounded-full overflow-hidden"
              >
                <LinearGradient
                  colors={["#EC4899", "#06B6D4"] as const}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="px-6 py-3"
                >
                  <Text className="text-white font-bold">Tạo Album Ngay</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* PROFILE MENU */}
      <ProfileMenu isVisible={showProfileMenu} onClose={() => setShowProfileMenu(false)} />
    </SafeAreaView>
  );
}

