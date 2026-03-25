import {
  View, Text, TextInput, Keyboard, Pressable, ScrollView,
  TouchableOpacity, ActivityIndicator, Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState, useRef, useEffect, useCallback } from "react";
import { PanResponderInstance, PanResponder } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProfileMenu from "../../components/ModalProfile/ProfileMenu";
import UserAvatar from "../../components/ModalProfile/UserAvatar";
import { LinearGradient } from "expo-linear-gradient";
import { Song, searchSongs } from "../../API/songAPI";
import { Playlist, getAdminAlbums } from "../../API/playlistAPI";
import { useAppNavigation } from "../../navigation/useAppNavigation";

const HISTORY_KEY = "spotichat_search_history";
const MAX_HISTORY = 10;

export default function SearchScreen() {
  const navigation = useAppNavigation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [activeTab, setActiveTab] = useState<"songs" | "playlists">("songs");
  const [isLoading, setIsLoading] = useState(false);
  const [songs, setSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const inputRef = useRef<TextInput>(null);

  const panResponder = useRef<PanResponderInstance>(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 30 && Math.abs(g.dx) > Math.abs(g.dy) && g.dx > 0 && g.x0 < 25,
      onPanResponderRelease: (_, g) => { if (g.dx > 50) setShowProfileMenu(true); },
    })
  ).current;

  // Load search history on mount
  useEffect(() => {
    loadHistory();
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setSongs([]);
      setPlaylists([]);
      return;
    }
    const timer = setTimeout(() => performSearch(), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadHistory = async () => {
    try {
      const raw = await AsyncStorage.getItem(HISTORY_KEY);
      if (raw) setSearchHistory(JSON.parse(raw));
    } catch {}
  };

  const saveToHistory = async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    try {
      const updated = [trimmed, ...searchHistory.filter(h => h !== trimmed)].slice(0, MAX_HISTORY);
      setSearchHistory(updated);
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    } catch {}
  };

  const removeHistoryItem = async (item: string) => {
    try {
      const updated = searchHistory.filter(h => h !== item);
      setSearchHistory(updated);
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    } catch {}
  };

  const clearAllHistory = async () => {
    try {
      setSearchHistory([]);
      await AsyncStorage.removeItem(HISTORY_KEY);
    } catch {}
  };

  const performSearch = async () => {
    try {
      setIsLoading(true);
      const [songsData, albumsData] = await Promise.all([
        searchSongs(searchQuery),
        getAdminAlbums(),
      ]);
      setSongs(songsData);
      const filtered = albumsData.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setPlaylists(filtered);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Submit search → save to history
  const handleSubmit = () => {
    if (searchQuery.trim()) {
      saveToHistory(searchQuery.trim());
      Keyboard.dismiss();
    }
  };

  // Tap a history item → fill input & search
  const handleHistoryTap = (item: string) => {
    setSearchQuery(item);
    saveToHistory(item);
    inputRef.current?.focus();
  };

  // Tap a song result → save to history
  const handleSongPress = (song: Song) => {
    saveToHistory(searchQuery.trim());
    navigation.navigate("MusicPlayer", { song });
  };

  const categories = [
    { name: "Pop", genre: "pop", icon: "musical-notes", colors: ["#EC4899", "#F472B6"] as const },
    { name: "Ballad", genre: "ballad", icon: "heart", colors: ["#3B82F6", "#60A5FA"] as const },
    { name: "Rap", genre: "rap", icon: "mic", colors: ["#F59E0B", "#FBBF24"] as const },
    { name: "Rock", genre: "rock", icon: "flame", colors: ["#EF4444", "#F87171"] as const },
    { name: "R&B", genre: "r&b", icon: "headset", colors: ["#8B5CF6", "#A78BFA"] as const },
    { name: "Electronic", genre: "electronic", icon: "flash", colors: ["#10B981", "#34D399"] as const },
  ];

  const showingResults = searchQuery.trim().length > 0;

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
            <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
              <Ionicons name="settings-outline" size={22} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* SEARCH INPUT */}
        <View className="px-5 mt-2 mb-1">
          <View
            className="flex-row items-center rounded-xl px-4 py-3"
            style={{
              backgroundColor: isFocused ? "rgba(255,255,255,0.12)" : "#1c1c1e",
              borderWidth: 1,
              borderColor: isFocused ? "rgba(236,72,153,0.5)" : "rgba(255,255,255,0.06)",
            }}
          >
            <Ionicons name="search" size={20} color={isFocused ? "#EC4899" : "#aaa"} />
            <TextInput
              ref={inputRef}
              placeholder="Bạn muốn nghe gì?"
              placeholderTextColor="#666"
              style={{ color: "white", marginLeft: 12, fontSize: 16, flex: 1 }}
              returnKeyType="search"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onSubmitEditing={handleSubmit}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
          {!showingResults ? (
            <>
              {/* RECENT SEARCHES */}
              {searchHistory.length > 0 && (
                <View className="px-5 mt-5">
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-white text-xl font-bold">Tìm kiếm gần đây</Text>
                    <TouchableOpacity onPress={clearAllHistory}>
                      <Text style={{ color: "#EC4899", fontSize: 13, fontWeight: "600" }}>Xóa tất cả</Text>
                    </TouchableOpacity>
                  </View>
                  <View
                    style={{
                      backgroundColor: "#111",
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.06)",
                      overflow: "hidden",
                    }}
                  >
                    {searchHistory.map((item, index) => (
                      <View
                        key={item}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          paddingHorizontal: 16,
                          paddingVertical: 13,
                          borderBottomWidth: index < searchHistory.length - 1 ? 1 : 0,
                          borderBottomColor: "rgba(255,255,255,0.05)",
                        }}
                      >
                        {/* Clock icon */}
                        <View
                          style={{
                            width: 36, height: 36, borderRadius: 18,
                            backgroundColor: "rgba(255,255,255,0.07)",
                            alignItems: "center", justifyContent: "center",
                            marginRight: 12,
                          }}
                        >
                          <Ionicons name="time-outline" size={18} color="#888" />
                        </View>

                        {/* Text — tap fills input */}
                        <TouchableOpacity style={{ flex: 1 }} onPress={() => handleHistoryTap(item)} activeOpacity={0.6}>
                          <Text style={{ color: "white", fontSize: 15, fontWeight: "500" }} numberOfLines={1}>
                            {item}
                          </Text>
                        </TouchableOpacity>

                        {/* Arrow up-left (fill input) */}
                        <TouchableOpacity
                          onPress={() => handleHistoryTap(item)}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 4 }}
                          style={{ padding: 4 }}
                        >
                          <Ionicons name="arrow-back-outline" size={18} color="#555" />
                        </TouchableOpacity>

                        {/* Delete item */}
                        <TouchableOpacity
                          onPress={() => removeHistoryItem(item)}
                          hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
                          style={{ padding: 4, marginLeft: 4 }}
                        >
                          <Ionicons name="close" size={18} color="#555" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* BROWSE CATEGORIES */}
              <View className="px-5 mt-6">
                <Text className="text-white text-xl font-bold mb-4">Duyệt tìm</Text>
                <View className="flex-row flex-wrap justify-between">
                  {categories.map((cat, index) => (
                    <TouchableOpacity
                      key={index}
                      activeOpacity={0.8}
                      className="w-[48%] mb-4 rounded-xl overflow-hidden"
                      onPress={() => navigation.navigate("GenrePlaylist", { genre: cat.genre, title: cat.name })}
                    >
                      <LinearGradient
                        colors={cat.colors}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="p-4 h-24 justify-between"
                      >
                        <Text className="text-white font-bold text-lg">{cat.name}</Text>
                        <View className="self-end">
                          <Ionicons name={cat.icon as any} size={32} color="rgba(255,255,255,0.8)" />
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          ) : (
            /* SEARCH RESULTS */
            <View className="px-5 mt-4">
              {/* TABS */}
              <View className="flex-row mb-4 bg-neutral-900/50 rounded-full p-1">
                {(["songs", "playlists"] as const).map((tab) => (
                  <TouchableOpacity
                    key={tab}
                    onPress={() => setActiveTab(tab)}
                    className={`flex-1 py-2 rounded-full ${activeTab === tab ? "bg-pink-500" : ""}`}
                  >
                    <Text className={`text-center font-semibold ${activeTab === tab ? "text-white" : "text-gray-400"}`}>
                      {tab === "songs" ? "Bài hát" : "Album"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

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
                        onPress={() => handleSongPress(song)}
                      >
                        {song.cover_image ? (
                          <Image source={{ uri: song.cover_image }} className="w-14 h-14 rounded-lg mr-3" />
                        ) : (
                          <View className="w-14 h-14 bg-neutral-800 rounded-lg mr-3 items-center justify-center">
                            <Ionicons name="musical-note" size={24} color="white" />
                          </View>
                        )}
                        <View className="flex-1">
                          <Text className="text-white font-semibold" numberOfLines={1}>{song.title}</Text>
                          <Text className="text-gray-400 text-sm" numberOfLines={1}>{song.artist}</Text>
                        </View>
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
                        onPress={() => navigation.navigate("AlbumDetail", { albumId: playlist._id })}
                      >
                        {playlist.cover_image ? (
                          <Image source={{ uri: playlist.cover_image }} className="w-14 h-14 rounded-lg mr-3" />
                        ) : (
                          <View className="w-14 h-14 bg-neutral-800 rounded-lg mr-3 items-center justify-center">
                            <Ionicons name="musical-notes" size={24} color="white" />
                          </View>
                        )}
                        <View className="flex-1">
                          <Text className="text-white font-semibold" numberOfLines={1}>{playlist.name}</Text>
                          <Text className="text-gray-400 text-sm">{playlist.tracks?.length ?? 0} bài hát</Text>
                        </View>
                        <TouchableOpacity className="p-2">
                          <Ionicons name="ellipsis-vertical" size={18} color="#9CA3AF" />
                        </TouchableOpacity>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <View className="py-12 items-center">
                      <Ionicons name="search-outline" size={48} color="#666" />
                      <Text className="text-gray-400 mt-3">Không tìm thấy album</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}
        </ScrollView>

        <ProfileMenu isVisible={showProfileMenu} onClose={() => setShowProfileMenu(false)} />
      </SafeAreaView>
    </Pressable>
  );
}
