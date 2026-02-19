import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Image,
    ActivityIndicator,
    RefreshControl,
    StatusBar,
    Animated,
    Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppNavigation } from "../../navigation/useAppNavigation";
import { LinearGradient } from "expo-linear-gradient";
import { useState as useStateBlur } from "react";
import { getLikedSongs, toggleLikeSong } from "../../API/libraryAPI";
import { Song } from "../../API/musicAPI";
import { useMusic } from "../../context/MusicContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

function formatDuration(seconds?: number): string {
    if (!seconds) return "";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function LikeSongScreen() {
    const navigation = useAppNavigation();
    const { playSong, currentSong, isPlaying } = useMusic();

    const [likedSongs, setLikedSongs] = useState<Song[]>([]);
    const [filteredSongs, setFilteredSongs] = useState<Song[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchFocused, setSearchFocused] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const scrollY = useRef(new Animated.Value(0)).current;

    // Header opacity animation
    const headerBgOpacity = scrollY.interpolate({
        inputRange: [80, 160],
        outputRange: [0, 1],
        extrapolate: "clamp",
    });

    useEffect(() => {
        loadLikedSongs();
    }, []);

    useEffect(() => {
        if (searchQuery.trim() === "") {
            setFilteredSongs(likedSongs);
        } else {
            const q = searchQuery.toLowerCase();
            setFilteredSongs(
                likedSongs.filter(
                    (s) =>
                        s.title.toLowerCase().includes(q) ||
                        s.artist_ids?.some((a) => a.name.toLowerCase().includes(q))
                )
            );
        }
    }, [searchQuery, likedSongs]);

    const loadLikedSongs = async (isRefresh = false) => {
        try {
            if (isRefresh) setRefreshing(true);
            else setIsLoading(true);
            setError(null);
            const songs = await getLikedSongs();
            setLikedSongs(songs);
            setFilteredSongs(songs);
        } catch (err: any) {
            setError("Không thể tải bài hát. Kiểm tra kết nối mạng.");
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    const handleUnlike = async (songId: string) => {
        try {
            await toggleLikeSong(songId);
            setLikedSongs((prev) => prev.filter((s) => s._id !== songId));
        } catch {
            // silent
        }
    };

    const handlePlay = async (song: Song) => {
        await playSong(song, filteredSongs);
        navigation.navigate("MusicPlayer", { song });
    };

    const handlePlayAll = () => {
        if (filteredSongs.length > 0) handlePlay(filteredSongs[0]);
    };

    const handleShuffle = () => {
        if (filteredSongs.length === 0) return;
        const shuffled = [...filteredSongs].sort(() => Math.random() - 0.5);
        handlePlay(shuffled[0]);
    };

    const totalDuration = likedSongs.reduce((acc, s) => acc + (s.duration ?? 0), 0);
    const totalMin = Math.round(totalDuration / 60);

    return (
        <View style={{ flex: 1, backgroundColor: "#050505" }}>
            <StatusBar barStyle="light-content" />

            {/* ── ANIMATED STICKY HEADER ── */}
            <Animated.View
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 10,
                    opacity: headerBgOpacity,
                    backgroundColor: "#0d0d0d",
                    borderBottomWidth: 1,
                    borderBottomColor: "rgba(255,255,255,0.06)",
                }}
            >
                <SafeAreaView edges={["top"]}>
                    <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10, gap: 12 }}>
                        <TouchableOpacity onPress={() => navigation.goBack()}
                            style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" }}>
                            <Ionicons name="chevron-back" size={22} color="white" />
                        </TouchableOpacity>
                        <Text style={{ color: "white", fontSize: 17, fontWeight: "700", flex: 1 }} numberOfLines={1}>
                            Yêu thích
                        </Text>
                    </View>
                </SafeAreaView>
            </Animated.View>

            <Animated.ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 130 }}
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
                scrollEventThrottle={16}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => loadLikedSongs(true)}
                        tintColor="#EC4899"
                    />
                }
            >
                {/* ── HERO SECTION ── */}
                <LinearGradient
                    colors={["#4C0060", "#2D0040", "#12001A", "#050505"]}
                    locations={[0, 0.4, 0.75, 1]}
                    start={{ x: 0.3, y: 0 }}
                    end={{ x: 0.7, y: 1 }}
                    style={{ paddingBottom: 28 }}
                >
                    <SafeAreaView edges={["top"]}>
                        {/* Top nav */}
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 8, paddingBottom: 28 }}>
                            <TouchableOpacity
                                onPress={() => navigation.goBack()}
                                style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(0,0,0,0.3)", alignItems: "center", justifyContent: "center" }}
                            >
                                <Ionicons name="chevron-back" size={22} color="white" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(0,0,0,0.3)", alignItems: "center", justifyContent: "center" }}
                            >
                                <Ionicons name="ellipsis-horizontal" size={20} color="white" />
                            </TouchableOpacity>
                        </View>

                        {/* Cover art */}
                        <View style={{ alignItems: "center", marginBottom: 24 }}>
                            <View style={{
                                width: 172,
                                height: 172,
                                borderRadius: 16,
                                overflow: "hidden",
                                shadowColor: "#EC4899",
                                shadowOffset: { width: 0, height: 16 },
                                shadowOpacity: 0.5,
                                shadowRadius: 24,
                                elevation: 16,
                            }}>
                                <LinearGradient
                                    colors={["#7C3AED", "#EC4899", "#06B6D4"]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
                                >
                                    {/* Mosaic grid from first 4 songs */}
                                    {likedSongs.filter(s => s.cover_image).length >= 4 ? (
                                        <View style={{ flex: 1, width: "100%", flexDirection: "row", flexWrap: "wrap" }}>
                                            {likedSongs.filter(s => s.cover_image).slice(0, 4).map((s, i) => (
                                                <Image key={i} source={{ uri: s.cover_image }} style={{ width: "50%", height: "50%" }} resizeMode="cover" />
                                            ))}
                                        </View>
                                    ) : (
                                        <View style={{ alignItems: "center", gap: 8 }}>
                                            <Ionicons name="heart" size={64} color="rgba(255,255,255,0.95)" />
                                        </View>
                                    )}
                                </LinearGradient>
                            </View>
                        </View>

                        {/* Title & meta */}
                        <View style={{ paddingHorizontal: 24, alignItems: "center" }}>
                            <Text style={{ color: "white", fontSize: 28, fontWeight: "800", textAlign: "center", marginBottom: 6, letterSpacing: 0.2 }}>
                                Bài hát yêu thích
                            </Text>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                                <Ionicons name="heart" size={13} color="#EC4899" />
                                <Text style={{ color: "rgba(255,255,255,0.55)", fontSize: 13 }}>
                                    {isLoading ? "Đang tải..." : `${likedSongs.length} bài hát${totalMin > 0 ? ` • ${totalMin} phút` : ""}`}
                                </Text>
                            </View>
                        </View>
                    </SafeAreaView>
                </LinearGradient>

                {/* ── ACTION ROW ── */}
                <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 16, gap: 12 }}>
                    {/* Download */}
                    <TouchableOpacity style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.07)", alignItems: "center", justifyContent: "center" }}>
                        <Ionicons name="arrow-down-circle-outline" size={22} color="rgba(255,255,255,0.7)" />
                    </TouchableOpacity>

                    <View style={{ flex: 1 }} />

                    {/* Shuffle */}
                    <TouchableOpacity
                        onPress={handleShuffle}
                        style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" }}
                    >
                        <Ionicons name="shuffle" size={22} color="white" />
                    </TouchableOpacity>

                    {/* Play */}
                    <TouchableOpacity
                        onPress={handlePlayAll}
                        activeOpacity={0.85}
                        style={{ width: 56, height: 56, borderRadius: 28, overflow: "hidden", shadowColor: "#EC4899", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 8 }}
                    >
                        <LinearGradient
                            colors={["#EC4899", "#9333EA"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
                        >
                            <Ionicons name="play" size={26} color="white" style={{ marginLeft: 3 }} />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* ── SEARCH BAR ── */}
                <View style={{ paddingHorizontal: 20, marginBottom: 8 }}>
                    <View style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: searchFocused ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.07)",
                        borderRadius: 14,
                        paddingHorizontal: 14,
                        paddingVertical: 11,
                        borderWidth: 1,
                        borderColor: searchFocused ? "rgba(236,72,153,0.4)" : "transparent",
                    }}>
                        <Ionicons name="search" size={18} color={searchFocused ? "#EC4899" : "rgba(255,255,255,0.4)"} />
                        <TextInput
                            placeholder="Tìm trong yêu thích..."
                            placeholderTextColor="rgba(255,255,255,0.3)"
                            style={{ color: "white", flex: 1, marginLeft: 10, fontSize: 15 }}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onFocus={() => setSearchFocused(true)}
                            onBlur={() => setSearchFocused(false)}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery("")}>
                                <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.4)" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* ── BODY ── */}
                {isLoading ? (
                    <View style={{ paddingTop: 80, alignItems: "center" }}>
                        <ActivityIndicator size="large" color="#EC4899" />
                        <Text style={{ color: "rgba(255,255,255,0.4)", marginTop: 14, fontSize: 14 }}>Đang tải...</Text>
                    </View>
                ) : error ? (
                    <View style={{ paddingTop: 60, alignItems: "center", paddingHorizontal: 32 }}>
                        <Ionicons name="cloud-offline-outline" size={56} color="#374151" />
                        <Text style={{ color: "white", fontSize: 17, fontWeight: "700", marginTop: 16, textAlign: "center" }}>Không thể tải dữ liệu</Text>
                        <Text style={{ color: "rgba(255,255,255,0.4)", textAlign: "center", marginTop: 8, marginBottom: 20 }}>{error}</Text>
                        <TouchableOpacity
                            onPress={() => loadLikedSongs()}
                            style={{ paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24, backgroundColor: "#EC4899" }}
                        >
                            <Text style={{ color: "white", fontWeight: "700" }}>Thử lại</Text>
                        </TouchableOpacity>
                    </View>
                ) : filteredSongs.length === 0 ? (
                    <View style={{ paddingTop: 60, alignItems: "center", paddingHorizontal: 40 }}>
                        <LinearGradient
                            colors={["rgba(236,72,153,0.15)", "rgba(147,51,234,0.15)"]}
                            style={{ width: 120, height: 120, borderRadius: 60, alignItems: "center", justifyContent: "center", marginBottom: 20 }}
                        >
                            <Ionicons name="heart-outline" size={56} color="#EC4899" />
                        </LinearGradient>
                        <Text style={{ color: "white", fontSize: 20, fontWeight: "700", textAlign: "center", marginBottom: 10 }}>
                            {searchQuery ? "Không tìm thấy" : "Chưa có bài hát yêu thích"}
                        </Text>
                        <Text style={{ color: "rgba(255,255,255,0.4)", textAlign: "center", fontSize: 14, lineHeight: 22 }}>
                            {searchQuery
                                ? "Thử tìm với từ khóa khác"
                                : "Bấm ♥ khi nghe nhạc để lưu bài hát yêu thích"}
                        </Text>
                    </View>
                ) : (
                    <View style={{ paddingHorizontal: 16 }}>
                        {/* Count label */}
                        <Text style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, fontWeight: "600", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8, paddingLeft: 4 }}>
                            {filteredSongs.length} bài hát
                        </Text>

                        {filteredSongs.map((song, index) => {
                            const isActive = currentSong?._id === song._id;
                            const artistName = song.artist_ids?.map((a) => a.name).join(", ") || "Unknown Artist";

                            return (
                                <TouchableOpacity
                                    key={song._id}
                                    onPress={() => handlePlay(song)}
                                    activeOpacity={0.65}
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        paddingVertical: 9,
                                        paddingHorizontal: 6,
                                        borderRadius: 12,
                                        marginBottom: 2,
                                        backgroundColor: isActive ? "rgba(236,72,153,0.08)" : "transparent",
                                    }}
                                >
                                    {/* Cover */}
                                    <View style={{ marginRight: 14 }}>
                                        {song.cover_image ? (
                                            <View style={{ position: "relative" }}>
                                                <Image
                                                    source={{ uri: song.cover_image }}
                                                    style={{ width: 52, height: 52, borderRadius: 10 }}
                                                />
                                                {isActive && (
                                                    <View style={{
                                                        position: "absolute", inset: 0, borderRadius: 10,
                                                        backgroundColor: "rgba(0,0,0,0.45)",
                                                        alignItems: "center", justifyContent: "center"
                                                    }}>
                                                        <Ionicons name={isPlaying ? "volume-high" : "pause"} size={20} color="#EC4899" />
                                                    </View>
                                                )}
                                            </View>
                                        ) : (
                                            <LinearGradient
                                                colors={["#7C3AED", "#EC4899"]}
                                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                                                style={{ width: 52, height: 52, borderRadius: 10, alignItems: "center", justifyContent: "center" }}
                                            >
                                                <Ionicons name="musical-note" size={22} color="rgba(255,255,255,0.9)" />
                                            </LinearGradient>
                                        )}
                                    </View>

                                    {/* Info */}
                                    <View style={{ flex: 1 }}>
                                        <Text
                                            style={{ color: isActive ? "#EC4899" : "white", fontWeight: "600", fontSize: 15, marginBottom: 3 }}
                                            numberOfLines={1}
                                        >
                                            {song.title}
                                        </Text>
                                        <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 13 }} numberOfLines={1}>
                                            {artistName}
                                        </Text>
                                    </View>

                                    {/* Duration */}
                                    {song.duration ? (
                                        <Text style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, marginRight: 8 }}>
                                            {formatDuration(song.duration)}
                                        </Text>
                                    ) : null}

                                    {/* Unlike */}
                                    <TouchableOpacity
                                        onPress={() => handleUnlike(song._id)}
                                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                        style={{ padding: 4 }}
                                    >
                                        <Ionicons name="heart" size={20} color="#EC4899" />
                                    </TouchableOpacity>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}
            </Animated.ScrollView>
        </View>
    );
}