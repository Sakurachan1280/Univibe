import { View, Text, TextInput, Keyboard, Pressable, ScrollView, TouchableOpacity, ActivityIndicator, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState, useRef, useEffect } from "react";
import { PanResponderInstance } from "react-native";
import { PanResponder } from "react-native";
import ProfileMenu from "../../components/ModalProfile/ProfileMenu";
import UserAvatar from "../../components/ModalProfile/UserAvatar";
import { LinearGradient } from 'expo-linear-gradient';
import { Song, searchSongs } from "../../API/songAPI";
import { Playlist, getMyPlaylists } from "../../API/playlistAPI";
import { useAppNavigation } from "../../navigation/useAppNavigation";

export default function SearchScreen() {
  const navigation = useAppNavigation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"songs" | "playlists">("songs");
  const [isLoading, setIsLoading] = useState(false);
  const [songs, setSongs] = useState<Song[]>([]);
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

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Search with debounce
  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setSongs([]);
      setPlaylists([]);
      return;
    }

    const timer = setTimeout(() => {
      performSearch();
    }, 500); // Debounce 500ms

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadInitialData = async () => {
    try {
      const playlistsData = await getMyPlaylists();
      setPlaylists(playlistsData);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const performSearch = async () => {
    try {
      setIsLoading(true);
      const [songsData, playlistsData] = await Promise.all([
        searchSongs(searchQuery),
        getMyPlaylists() // Filter locally since we don't have search endpoint for playlists
      ]);

      setSongs(songsData);
      // Filter playlists by search query
      const filteredPlaylists = playlistsData.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setPlaylists(filteredPlaylists);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const categories = [
    { name: "Pop", icon: "musical-notes", colors: ["#EC4899", "#F472B6"] as const },
    { name: "Rock", icon: "flame", colors: ["#EF4444", "#F87171"] as const },
    { name: "Hip-Hop", icon: "mic", colors: ["#8B5CF6", "#A78BFA"] as const },
    { name: "Jazz", icon: "wine", colors: ["#F59E0B", "#FBBF24"] as const },
    { name: "Classical", icon: "musical-note", colors: ["#06B6D4", "#22D3EE"] as const },
    { name: "Electronic", icon: "flash", colors: ["#10B981", "#34D399"] as const },
  ];

  return (
    <Pressable onPress={Keyboard.dismiss} style={{ flex: 1 }}>
      <SafeAreaView className="flex-1 bg-black" edges={["top"]}>
        <View {...panResponder.panHandlers} style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 20, zIndex: 50 }} />

        {/* HEADER */}
        <View className="flex-row items-center justify-between px-4 py-3">
          <View className="flex-row items-center">
            <UserAvatar size={40} onPress={() => setShowProfileMenu(true)} />
            <Text className="text-white text-2xl font-bold ml-4">Tìm kiếm</Text>
          </View>

          <View className="flex-row gap-4">
            <Ionicons name="notifications-outline" size={22} color="white" />
            <Ionicons name="time-outline" size={22} color="white" />
            <Ionicons name="settings-outline" size={22} color="white" />
          </View>
        </View>

        {/* SEARCH INPUT */}
        <View className="px-5 mt-4">
          <View className="flex-row items-center bg-neutral-800 rounded-md px-3 py-4">
            <Ionicons name="search-outline" size={20} color="#aaa" />

            <TextInput
              placeholder="Bạn muốn nghe gì?"
              placeholderTextColor="#aaa"
              className="text-white ml-3 text-xl flex-1 leading-tight"
              returnKeyType="search"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={20} color="#aaa" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {searchQuery.length === 0 ? (
            <>
              {/* BROWSE CATEGORIES */}
              <View className="px-5 mt-6">
                <Text className="text-white text-xl font-bold mb-4">Duyệt tìm</Text>
                <View className="flex-row flex-wrap justify-between">
                  {categories.map((category, index) => (
                    <TouchableOpacity
                      key={index}
                      activeOpacity={0.8}
                      className="w-[48%] mb-4 rounded-xl overflow-hidden"
                    >
                      <LinearGradient
                        colors={category.colors}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="p-4 h-24 justify-between"
                      >
                        <Text className="text-white font-bold text-lg">{category.name}</Text>
                        <View className="self-end">
                          <Ionicons name={category.icon as any} size={32} color="rgba(255,255,255,0.8)" />
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* RECENT SEARCHES - Empty State */}
              <View className="px-5 mt-6">
                <Text className="text-white text-xl font-bold mb-4">Tìm kiếm gần đây</Text>
                <View className="bg-neutral-900/50 rounded-xl p-8 items-center border border-white/5">
                  <Ionicons name="time-outline" size={48} color="#666" />
                  <Text className="text-gray-400 text-center mt-3">
                    Chưa có lịch sử tìm kiếm
                  </Text>
                </View>
              </View>
            </>
          ) : (
            <>
              {/* SEARCH RESULTS */}
              <View className="px-5 mt-6">
                {/* TABS */}
                <View className="flex-row mb-4 bg-neutral-900/50 rounded-full p-1">
                  <TouchableOpacity
                    onPress={() => setActiveTab("songs")}
                    className={`flex-1 py-2 rounded-full ${activeTab === "songs" ? "bg-pink-500" : ""}`}
                  >
                    <Text className={`text-center font-semibold ${activeTab === "songs" ? "text-white" : "text-gray-400"}`}>
                      Bài hát
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setActiveTab("playlists")}
                    className={`flex-1 py-2 rounded-full ${activeTab === "playlists" ? "bg-pink-500" : ""}`}
                  >
                    <Text className={`text-center font-semibold ${activeTab === "playlists" ? "text-white" : "text-gray-400"}`}>
                      Playlist
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* RESULTS */}
                {isLoading ? (
                  <View className="py-12 items-center">
                    <ActivityIndicator size="large" color="#EC4899" />
                    <Text className="text-gray-400 mt-3">Đang tìm kiếm...</Text>
                  </View>
                ) : activeTab === "songs" ? (
                  <View>
                    {songs.length > 0 ? (
                      songs.map((song) => (
                        <TouchableOpacity
                          key={song._id}
                          className="flex-row items-center py-3 active:bg-white/5 rounded-lg"
                          activeOpacity={0.7}
                          onPress={() => navigation.navigate("MusicPlayer", { song })}
                        >
                          {song.cover_image ? (
                            <Image
                              source={{ uri: song.cover_image }}
                              className="w-14 h-14 rounded-lg mr-3"
                            />
                          ) : (
                            <View className="w-14 h-14 bg-gradient-to-br from-pink-500 to-cyan-500 rounded-lg mr-3 items-center justify-center">
                              <Ionicons name="musical-note" size={24} color="white" />
                            </View>
                          )}
                          <View className="flex-1">
                            <Text className="text-white font-semibold" numberOfLines={1}>
                              {song.title}
                            </Text>
                            <Text className="text-gray-400 text-sm" numberOfLines={1}>
                              {song.artist}
                            </Text>
                          </View>
                          <TouchableOpacity className="p-2">
                            <Ionicons name="add-circle-outline" size={24} color="#EC4899" />
                          </TouchableOpacity>
                          <TouchableOpacity className="p-2">
                            <Ionicons name="ellipsis-vertical" size={18} color="#9CA3AF" />
                          </TouchableOpacity>
                        </TouchableOpacity>
                      ))
                    ) : (
                      <View className="py-12 items-center">
                        <Ionicons name="search-outline" size={48} color="#666" />
                        <Text className="text-gray-400 mt-3">Không tìm thấy bài hát</Text>
                      </View>
                    )}
                  </View>
                ) : (
                  <View>
                    {playlists.length > 0 ? (
                      playlists.map((playlist) => (
                        <TouchableOpacity
                          key={playlist._id}
                          className="flex-row items-center py-3 active:bg-white/5 rounded-lg"
                          activeOpacity={0.7}
                        >
                          <View className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-lg mr-3 items-center justify-center">
                            <Ionicons name="musical-notes" size={24} color="white" />
                          </View>
                          <View className="flex-1">
                            <Text className="text-white font-semibold" numberOfLines={1}>
                              {playlist.name}
                            </Text>
                            <Text className="text-gray-400 text-sm">
                              {playlist.songs.length} bài hát
                            </Text>
                          </View>
                          <TouchableOpacity className="p-2">
                            <Ionicons name="ellipsis-vertical" size={18} color="#9CA3AF" />
                          </TouchableOpacity>
                        </TouchableOpacity>
                      ))
                    ) : (
                      <View className="py-12 items-center">
                        <Ionicons name="search-outline" size={48} color="#666" />
                        <Text className="text-gray-400 mt-3">Không tìm thấy playlist</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            </>
          )}
        </ScrollView>

        {/* PROFILE MENU */}
        <ProfileMenu isVisible={showProfileMenu} onClose={() => setShowProfileMenu(false)} />
      </SafeAreaView>
    </Pressable>
  );
}
