import React, { useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    StatusBar,
    RefreshControl,
    Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import { getListeningHistory } from "../../API/libraryAPI";
import { Song } from "../../API/musicAPI";
import { getServerURL } from "../../API/axiosClient";
import { useMusic } from "../../context/MusicContext";
import AddToPlaylistModal from "../../components/Playlist/AddToPlaylistModal";

const { width } = Dimensions.get("window");

function formatDuration(seconds?: number): string {
    if (!seconds) return "--:--";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
}

const RECENT_GRADIENT: [string, string] = ["#6366F1", "#8B5CF6"];

export default function RecentPlayedScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { playSong } = useMusic();

    const [songs, setSongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
    const [addToPlaylistSong, setAddToPlaylistSong] = useState<Song | null>(null);

    const fetchHistory = useCallback(async () => {
        try {
            setError(null);
            const historyData = await getListeningHistory();
            const extracted = historyData
                .map((h) => h.song_id)
                .filter(Boolean) as Song[];

            // Lấy 10 bài gần nhất
            setSongs(extracted.slice(0, 10));
        } catch (err: any) {
            console.error("[RecentPlayed] Fetch error:", err);
            setError(err?.message ?? "Không thể tải lịch sử");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchHistory();
    };

    const handlePlaySong = async (song: Song, queue?: Song[]) => {
        setCurrentPlayingId(song._id);
        await playSong(song, queue ?? songs);
        navigation.navigate("MusicPlayer", { song });
    };

    const handlePlayAll = () => {
        if (songs.length > 0) handlePlaySong(songs[0], songs);
    };

    const handleShuffle = () => {
        if (songs.length === 0) return;
        const shuffled = [...songs].sort(() => Math.random() - 0.5);
        handlePlaySong(shuffled[0], shuffled);
    };

    const formatImageUrl = (url?: string) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return `${getServerURL()}${url}`;
    };

    return (
        <View style={{ flex: 1, backgroundColor: "#0a0a0a" }}>
            <AddToPlaylistModal
                visible={addToPlaylistSong !== null}
                songId={addToPlaylistSong?._id ?? null}
                songTitle={addToPlaylistSong?.title}
                onClose={() => setAddToPlaylistSong(null)}
            />
            <StatusBar barStyle="light-content" />

            {/* ── HERO GRADIENT HEADER ── */}
            <LinearGradient
                colors={[...RECENT_GRADIENT, "#0a0a0a00"] as any}
                start={{ x: 0.2, y: 0 }}
                end={{ x: 0.8, y: 1 }}
                style={{ paddingBottom: 20, paddingHorizontal: 20 }}
            >
                <SafeAreaView edges={["top"]}>
                    {/* Back */}
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={{
                            width: 38,
                            height: 38,
                            borderRadius: 19,
                            backgroundColor: "rgba(0,0,0,0.35)",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: 20,
                            marginTop: 4,
                        }}
                    >
                        <Ionicons name="chevron-back" size={22} color="white" />
                    </TouchableOpacity>

                    {/* Badge */}
                    <View
                        style={{
                            alignSelf: "center",
                            backgroundColor: "rgba(99,102,241,0.22)",
                            borderRadius: 20,
                            paddingHorizontal: 14,
                            paddingVertical: 4,
                            marginBottom: 14,
                            borderWidth: 1,
                            borderColor: "rgba(99,102,241,0.4)",
                        }}
                    >
                        <Text style={{ color: "#818CF8", fontSize: 11, fontWeight: "700", letterSpacing: 1.2 }}>
                            VỪA NGHE
                        </Text>
                    </View>

                    {/* Placeholder Icon/Cover for Recent */}
                    <View
                        style={{
                            width: width * 0.45,
                            height: width * 0.45,
                            borderRadius: 18,
                            overflow: "hidden",
                            alignSelf: "center",
                            marginBottom: 15,
                            shadowColor: "#6366F1",
                            shadowOffset: { width: 0, height: 10 },
                            shadowOpacity: 0.5,
                            shadowRadius: 20,
                            elevation: 12,
                            justifyContent: "center",
                            alignItems: "center",
                            backgroundColor: "rgba(255,255,255,0.05)",
                        }}
                    >
                        <LinearGradient
                            colors={RECENT_GRADIENT as any}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{ flex: 1, width: '100%', alignItems: "center", justifyContent: "center" }}
                        >
                            <Ionicons name="radio" size={60} color="rgba(255,255,255,0.9)" />
                        </LinearGradient>
                    </View>

                    {/* Title & meta */}
                    <Text
                        style={{
                            color: "white",
                            fontSize: 24,
                            fontWeight: "800",
                            textAlign: "center",
                            marginBottom: 4,
                            letterSpacing: 0.3,
                        }}
                        numberOfLines={1}
                    >
                        Vừa nghe
                    </Text>

                    <Text
                        style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, textAlign: "center" }}
                    >
                        10 bài hát nghe gần đây nhất của bạn
                    </Text>
                </SafeAreaView>
            </LinearGradient>

            {/* ── ACTION BUTTONS ── */}
            {!loading && !error && (
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingHorizontal: 20,
                        paddingVertical: 12,
                        gap: 12,
                    }}
                >
                    <TouchableOpacity
                        onPress={handleShuffle}
                        style={{
                            width: 44,
                            height: 44,
                            borderRadius: 22,
                            backgroundColor: "rgba(255,255,255,0.08)",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Ionicons name="shuffle" size={20} color="white" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handlePlayAll}
                        activeOpacity={0.85}
                        style={{ flex: 1, borderRadius: 30, overflow: "hidden" }}
                    >
                        <LinearGradient
                            colors={RECENT_GRADIENT as any}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "center",
                                paddingVertical: 12,
                                gap: 8,
                            }}
                        >
                            <Ionicons name="play" size={18} color="white" />
                            <Text style={{ color: "white", fontWeight: "700", fontSize: 15 }}>
                                Phát tất cả
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={{
                            width: 44,
                            height: 44,
                            borderRadius: 22,
                            backgroundColor: "rgba(255,255,255,0.08)",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Ionicons name="ellipsis-horizontal" size={20} color="white" />
                    </TouchableOpacity>
                </View>
            )}

            {/* ── SONG LIST ── */}
            {loading ? (
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                    <ActivityIndicator size="large" color="#6366F1" />
                </View>
            ) : error ? (
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
                    <Ionicons name="cloud-offline-outline" size={56} color="#6B7280" />
                    <Text style={{ color: "white", fontSize: 17, fontWeight: "bold", marginTop: 16, textAlign: "center" }}>
                        Không thể tải lịch sử
                    </Text>
                    <TouchableOpacity
                        onPress={fetchHistory}
                        style={{
                            paddingHorizontal: 24,
                            paddingVertical: 10,
                            borderRadius: 20,
                            backgroundColor: "#6366F1",
                            marginTop: 20,
                        }}
                    >
                        <Text style={{ color: "white", fontWeight: "600" }}>Thử lại</Text>
                    </TouchableOpacity>
                </View>
            ) : songs.length === 0 ? (
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
                    <Ionicons name="musical-notes-outline" size={64} color="#374151" />
                    <Text style={{ color: "white", fontSize: 18, fontWeight: "bold", marginTop: 16, textAlign: "center" }}>
                        Chưa có lịch sử
                    </Text>
                </View>
            ) : (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 130 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor="#6366F1"
                        />
                    }
                >
                    {songs.map((song, index) => {
                        const artistNameStr =
                            Array.isArray(song.artist_ids) && song.artist_ids.length > 0
                                ? song.artist_ids.map((a) => a.name).join(", ")
                                : "Unknown Artist";
                        const isPlaying = currentPlayingId === song._id;

                        return (
                            <TouchableOpacity
                                key={`${song._id}-${index}`}
                                onPress={() => handlePlaySong(song, songs)}
                                activeOpacity={0.7}
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    paddingVertical: 11,
                                    borderBottomWidth: 1,
                                    borderBottomColor: "rgba(255,255,255,0.04)",
                                }}
                            >
                                <View style={{ width: 30, alignItems: "center" }}>
                                    {isPlaying ? (
                                        <Ionicons name="volume-high" size={16} color="#6366F1" />
                                    ) : (
                                        <Text style={{ color: "#6B7280", fontSize: 13 }}>
                                            {index + 1}
                                        </Text>
                                    )}
                                </View>

                                {song.cover_image ? (
                                    <Image
                                        source={formatImageUrl(song.cover_image)}
                                        style={{
                                            width: 50,
                                            height: 50,
                                            borderRadius: 8,
                                            marginRight: 12,
                                        }}
                                        cachePolicy="memory-disk"
                                    />
                                ) : (
                                    <LinearGradient
                                        colors={RECENT_GRADIENT as any}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={{
                                            width: 50,
                                            height: 50,
                                            borderRadius: 8,
                                            alignItems: "center",
                                            justifyContent: "center",
                                            marginRight: 12,
                                        }}
                                    >
                                        <Ionicons
                                            name="musical-note"
                                            size={20}
                                            color="rgba(255,255,255,0.9)"
                                        />
                                    </LinearGradient>
                                )}

                                <View style={{ flex: 1 }}>
                                    <Text
                                        style={{
                                            color: isPlaying ? "#818CF8" : "white",
                                            fontWeight: "600",
                                            fontSize: 15,
                                        }}
                                        numberOfLines={1}
                                    >
                                        {song.title}
                                    </Text>
                                    <Text
                                        style={{ color: "#9CA3AF", fontSize: 13, marginTop: 2 }}
                                        numberOfLines={1}
                                    >
                                        {artistNameStr}
                                    </Text>
                                </View>

                                <Text style={{ color: "#6B7280", fontSize: 13, marginRight: 10 }}>
                                    {formatDuration(song.duration)}
                                </Text>

                                <TouchableOpacity
                                    onPress={() => setAddToPlaylistSong(song)}
                                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                >
                                    <Ionicons name="ellipsis-vertical" size={18} color="#4B5563" />
                                </TouchableOpacity>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            )}
        </View>
    );
}
