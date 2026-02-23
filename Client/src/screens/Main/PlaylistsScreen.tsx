import React, { useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    StatusBar,
    RefreshControl,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import { getPlaylistDetail, getMyPlaylists } from "../../API/playlistAPI";
import musicAPI, { Song } from "../../API/musicAPI";
import { getAllArtists, getSongsByArtist } from "../../API/artistAPI";
import { useMusic } from "../../context/MusicContext";

type PlaylistsRouteProp = RouteProp<RootStackParamList, "Playlists">;

/** Màu gradient theo tên playlist */
const PLAYLIST_COLORS: Record<string, [string, string]> = {
    "Liked Songs": ["#EC4899", "#9333EA"],
    "Nghe Gì Hôm Nay": ["#06B6D4", "#3B82F6"],
    "Anh Phan": ["#F59E0B", "#EF4444"],
    "Chill": ["#10B981", "#06B6D4"],
    "Playlists": ["#8B5CF6", "#EC4899"],
    "Đang nghe": ["#EF4444", "#F97316"],
};

function formatDuration(seconds?: number): string {
    if (!seconds) return "--:--";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
}

function totalMinutes(songs: Song[]): number {
    const total = songs.reduce((acc, s) => acc + (s.duration ?? 0), 0);
    return Math.round(total / 60);
}

export default function PlaylistsScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute<PlaylistsRouteProp>();
    const { title, playlistId, artistId } = route.params;
    const { playSong } = useMusic();

    const [songs, setSongs] = useState<Song[]>([]);
    const [coverImage, setCoverImage] = useState<string | null>(null);
    const [artistName, setArtistName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);

    const colors: [string, string] = PLAYLIST_COLORS[title] ?? ["#EC4899", "#8B5CF6"];

    const fetchData = useCallback(async () => {
        try {
            setError(null);

            if (artistId) {
                // --- MODE: Artist --- fetch bài hát theo artistId cụ thể
                const [artistSongs, allArtists] = await Promise.all([
                    getSongsByArtist(artistId),
                    getAllArtists(),
                ]);
                setSongs(artistSongs);
                const foundArtist = allArtists.find(a => a._id === artistId);
                if (foundArtist?.avatar) setCoverImage(foundArtist.avatar);
                if (foundArtist?.name) setArtistName(foundArtist.name);
            } else if (playlistId) {
                // --- MODE: Playlist by ID ---
                const playlist = await getPlaylistDetail(playlistId);
                const extractedSongs = playlist.tracks
                    .map((t) => t.song_id)
                    .filter(Boolean) as Song[];
                setSongs(extractedSongs);
                if (playlist.cover_image) setCoverImage(playlist.cover_image);
            } else {
                // --- MODE: Tìm artist/playlist theo tên ---
                try {
                    // Thử tìm artist có tên trùng
                    const allArtists = await getAllArtists();
                    const matchedArtist = allArtists.find(
                        (a) => a.name.toLowerCase() === title.toLowerCase()
                    );

                    if (matchedArtist) {
                        const artistSongs = await getSongsByArtist(matchedArtist._id);
                        setSongs(artistSongs);
                        if (matchedArtist.avatar) setCoverImage(matchedArtist.avatar);
                        setArtistName(matchedArtist.name);
                    } else {
                        // Thử tìm playlist theo tên
                        const playlists = await getMyPlaylists();
                        const matched = playlists.find(
                            (p) => p.name.toLowerCase() === title.toLowerCase()
                        );
                        if (matched) {
                            const detail = await getPlaylistDetail(matched._id);
                            const extractedSongs = detail.tracks
                                .map((t) => t.song_id)
                                .filter(Boolean) as Song[];
                            setSongs(extractedSongs);
                            if (detail.cover_image) setCoverImage(detail.cover_image);
                        } else {
                            // Fallback: random songs
                            const randomSongs = await musicAPI.getRandomSongs(10);
                            setSongs(randomSongs);
                        }
                    }
                } catch {
                    const randomSongs = await musicAPI.getRandomSongs(10);
                    setSongs(randomSongs);
                }
            }
        } catch (err: any) {
            setError(err?.message ?? "Không thể tải dữ liệu");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [playlistId, artistId, title]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
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

    return (
        <View style={{ flex: 1, backgroundColor: "#0a0a0a" }}>
            <StatusBar barStyle="light-content" />

            {/* ── HERO GRADIENT HEADER ── */}
            <LinearGradient
                colors={[...colors, "#0a0a0a00"] as any}
                start={{ x: 0.2, y: 0 }}
                end={{ x: 0.8, y: 1 }}
                style={{ paddingTop: 52, paddingBottom: 28, paddingHorizontal: 20 }}
            >
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
                        marginBottom: 28,
                    }}
                >
                    <Ionicons name="chevron-back" size={22} color="white" />
                </TouchableOpacity>

                {/* Cover */}
                <View
                    style={{
                        width: 168,
                        height: 168,
                        borderRadius: 14,
                        overflow: "hidden",
                        alignSelf: "center",
                        marginBottom: 20,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 12 },
                        shadowOpacity: 0.7,
                        shadowRadius: 20,
                        elevation: 14,
                    }}
                >
                    {coverImage ? (
                        <Image
                            source={coverImage}
                            style={{ width: "100%", height: "100%" }}
                            contentFit="cover"
                            cachePolicy="memory-disk"
                        />
                    ) : (
                        <LinearGradient
                            colors={colors as any}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
                        >
                            <Ionicons name="musical-notes" size={68} color="rgba(255,255,255,0.88)" />
                        </LinearGradient>
                    )}
                </View>

                {/* Title */}
                <Text
                    style={{
                        color: "white",
                        fontSize: 24,
                        fontWeight: "800",
                        textAlign: "center",
                        marginBottom: 6,
                        letterSpacing: 0.3,
                    }}
                >
                    {title}
                </Text>
                <Text style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, textAlign: "center" }}>
                    {artistName ? `Ca sĩ` : "Playlist"}
                    {" • "}{songs.length} bài hát
                    {songs.length > 0
                        ? ` • ${totalMinutes(songs)} phút`
                        : ""}
                </Text>
            </LinearGradient>

            {/* ── ACTION BUTTONS ── */}
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 20,
                    paddingVertical: 14,
                    gap: 12,
                }}
            >
                <TouchableOpacity
                    onPress={handleShuffle}
                    style={{
                        width: 46,
                        height: 46,
                        borderRadius: 23,
                        backgroundColor: "rgba(255,255,255,0.08)",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Ionicons name="shuffle" size={22} color="white" />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handlePlayAll}
                    activeOpacity={0.85}
                    style={{ flex: 1, borderRadius: 30, overflow: "hidden" }}
                >
                    <LinearGradient
                        colors={colors as any}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            paddingVertical: 14,
                            gap: 8,
                        }}
                    >
                        <Ionicons name="play" size={20} color="white" />
                        <Text style={{ color: "white", fontWeight: "700", fontSize: 16 }}>
                            Phát tất cả
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                    style={{
                        width: 46,
                        height: 46,
                        borderRadius: 23,
                        backgroundColor: "rgba(255,255,255,0.08)",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Ionicons name="ellipsis-horizontal" size={22} color="white" />
                </TouchableOpacity>
            </View>

            {/* ── SONG LIST ── */}
            {loading ? (
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                    <ActivityIndicator size="large" color={colors[0]} />
                    <Text style={{ color: "#6B7280", marginTop: 12, fontSize: 14 }}>
                        Đang tải bài hát...
                    </Text>
                </View>
            ) : error ? (
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
                    <Ionicons name="cloud-offline-outline" size={56} color="#6B7280" />
                    <Text style={{ color: "white", fontSize: 17, fontWeight: "bold", marginTop: 16, textAlign: "center" }}>
                        Không thể tải dữ liệu
                    </Text>
                    <Text style={{ color: "#6B7280", textAlign: "center", marginTop: 8, marginBottom: 20 }}>
                        {error}
                    </Text>
                    <TouchableOpacity
                        onPress={fetchData}
                        style={{
                            paddingHorizontal: 24,
                            paddingVertical: 10,
                            borderRadius: 20,
                            backgroundColor: colors[0],
                        }}
                    >
                        <Text style={{ color: "white", fontWeight: "600" }}>Thử lại</Text>
                    </TouchableOpacity>
                </View>
            ) : songs.length === 0 ? (
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
                    <Ionicons name="musical-notes-outline" size={64} color="#374151" />
                    <Text style={{ color: "white", fontSize: 18, fontWeight: "bold", marginTop: 16, textAlign: "center" }}>
                        Chưa có bài hát
                    </Text>
                    <Text style={{ color: "#6B7280", textAlign: "center", marginTop: 8 }}>
                        Playlist này chưa có bài hát nào
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
                            tintColor={colors[0]}
                        />
                    }
                >
                    {songs.map((song, index) => {
                        const artistName =
                            Array.isArray(song.artist_ids) && song.artist_ids.length > 0
                                ? song.artist_ids.map((a) => a.name).join(", ")
                                : "Unknown Artist";
                        const isPlaying = currentPlayingId === song._id;

                        return (
                            <TouchableOpacity
                                key={song._id}
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
                                {/* Track number / playing indicator */}
                                <View style={{ width: 30, alignItems: "center" }}>
                                    {isPlaying ? (
                                        <Ionicons name="volume-high" size={16} color={colors[0]} />
                                    ) : (
                                        <Text style={{ color: "#6B7280", fontSize: 13 }}>
                                            {index + 1}
                                        </Text>
                                    )}
                                </View>

                                {/* Cover Image */}
                                {song.cover_image ? (
                                    <Image
                                        source={song.cover_image}
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
                                        colors={colors as any}
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

                                {/* Song info */}
                                <View style={{ flex: 1 }}>
                                    <Text
                                        style={{
                                            color: isPlaying ? colors[0] : "white",
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
                                        {artistName}
                                    </Text>
                                </View>

                                {/* Duration */}
                                <Text style={{ color: "#6B7280", fontSize: 13, marginRight: 10 }}>
                                    {formatDuration(song.duration)}
                                </Text>

                                <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
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
