import React, { useEffect, useState, useCallback, useRef } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    StatusBar,
    RefreshControl,
    Dimensions,
    Modal,
    Animated,
    ToastAndroid,
    Platform,
    Alert,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import { getPlaylistDetail, Playlist, toggleSaveAlbum, checkAlbumSaved } from "../../API/playlistAPI";
import { Song } from "../../API/musicAPI";
import { getServerURL } from "../../API/axiosClient";
import { useMusic } from "../../context/MusicContext";
import AddToPlaylistModal from "../../components/Playlist/AddToPlaylistModal";

type AlbumDetailRouteProp = RouteProp<RootStackParamList, "AlbumDetail">;

const { width } = Dimensions.get("window");

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

const ALBUM_GRADIENT: [string, string] = ["#EC4899", "#F97316"];

export default function AlbumDetailScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute<AlbumDetailRouteProp>();
    const { albumId } = route.params;
    const { playSong } = useMusic();

    const [album, setAlbum] = useState<Playlist | null>(null);
    const [songs, setSongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
    const [addToPlaylistSong, setAddToPlaylistSong] = useState<Song | null>(null);
    const [albumMenuVisible, setAlbumMenuVisible] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [savingAlbum, setSavingAlbum] = useState(false);
    const slideAnim = useRef(new Animated.Value(400)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const fetchAlbum = useCallback(async () => {
        if (!albumId || albumId === 'undefined') {
            console.warn("[AlbumDetail] Invalid albumId:", albumId);
            setLoading(false);
            return;
        }
        try {
            console.log("[AlbumDetail] Fetching albumId:", albumId);
            setError(null);
            const data = await getPlaylistDetail(albumId);
            console.log("[AlbumDetail] Album data received:", data.name, "Tracks:", data.tracks?.length);
            setAlbum(data);
            const extracted = data.tracks
                .map((t) => t.song_id)
                .filter(Boolean) as Song[];
            setSongs(extracted);
            // Check save status
            try {
                const saved = await checkAlbumSaved(albumId);
                setIsSaved(saved);
            } catch {
                // ignore if not logged in
            }
        } catch (err: any) {
            console.error("[AlbumDetail] Fetch error:", err);
            setError(err?.message ?? "Không thể tải album");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [albumId]);

    useEffect(() => {
        fetchAlbum();
    }, [fetchAlbum]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchAlbum();
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

    const albumColors: [string, string] = ALBUM_GRADIENT;

    const formatImageUrl = (url?: string) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return `${getServerURL()}${url}`;
    };

    const openAlbumMenu = () => {
        setAlbumMenuVisible(true);
        Animated.parallel([
            Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 20, stiffness: 200 }),
            Animated.timing(fadeAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
        ]).start();
    };

    const closeAlbumMenu = () => {
        Animated.parallel([
            Animated.timing(slideAnim, { toValue: 400, duration: 200, useNativeDriver: true }),
            Animated.timing(fadeAnim, { toValue: 0, duration: 160, useNativeDriver: true }),
        ]).start(() => setAlbumMenuVisible(false));
    };

    const showToast = (msg: string) => {
        if (Platform.OS === 'android') {
            ToastAndroid.show(msg, ToastAndroid.SHORT);
        } else {
            Alert.alert('', msg);
        }
    };

    const handleToggleSaveAlbum = async () => {
        if (!album) return;
        closeAlbumMenu();
        setSavingAlbum(true);
        try {
            const result = await toggleSaveAlbum(album._id);
            setIsSaved(result.status === 'added');
            showToast(result.status === 'added'
                ? `Đã thêm "${album.name}" vào thư viện`
                : `Đã xóa "${album.name}" khỏi thư viện`);
        } catch (err: any) {
            showToast('Không thể thực hiện. Vui lòng thử lại.');
        } finally {
            setSavingAlbum(false);
        }
    };

    return (
        <>
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
                colors={[...albumColors, "#0a0a0a00"] as any}
                start={{ x: 0.2, y: 0 }}
                end={{ x: 0.8, y: 1 }}
                style={{ paddingBottom: 12, paddingHorizontal: 20 }}
            >
                <SafeAreaView edges={["top"]}>
                    {/* Back */}
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={{
                            width: 30,
                            height: 30,
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
                            backgroundColor: "rgba(236,72,153,0.22)",
                            borderRadius: 20,
                            paddingHorizontal: 14,
                            paddingVertical: 4,
                            marginBottom: 14,
                            borderWidth: 1,
                            borderColor: "rgba(236,72,153,0.4)",
                        }}
                    >
                        <Text style={{ color: "#EC4899", fontSize: 11, fontWeight: "700", letterSpacing: 1.2 }}>
                            ALBUM
                        </Text>
                    </View>

                    {/* Cover */}
                    <View
                        style={{
                            width: width * 0.40,
                            height: width * 0.40,
                            borderRadius: 18,
                            overflow: "hidden",
                            alignSelf: "center",
                            marginBottom: 16,
                            shadowColor: "#EC4899",
                            shadowOffset: { width: 0, height: 14 },
                            shadowOpacity: 0.55,
                            shadowRadius: 24,
                            elevation: 16,
                        }}
                    >
                        {album?.cover_image ? (
                            <Image
                                source={formatImageUrl(album.cover_image)}
                                style={{ width: "100%", height: "100%" }}
                                contentFit="cover"
                                cachePolicy="memory-disk"
                            />
                        ) : (
                            <LinearGradient
                                colors={albumColors as any}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
                            >
                                <Ionicons name="disc" size={72} color="rgba(255,255,255,0.9)" />
                            </LinearGradient>
                        )}
                    </View>

                    {/* Title & meta */}
                    <Text
                        style={{
                            color: "white",
                            fontSize: 26,
                            fontWeight: "800",
                            textAlign: "center",
                            marginBottom: 6,
                            letterSpacing: 0.3,
                        }}
                        numberOfLines={2}
                    >
                        {album?.name ?? "Đang tải..."}
                    </Text>

                    {album?.description ? (
                        <Text
                            style={{
                                color: "rgba(255,255,255,0.55)",
                                fontSize: 13,
                                textAlign: "center",
                                marginBottom: 6,
                                paddingHorizontal: 10,
                            }}
                            numberOfLines={2}
                        >
                            {album.description}
                        </Text>
                    ) : null}

                    <Text
                        style={{ color: "rgba(255,255,255,0.40)", fontSize: 12, textAlign: "center" }}
                    >
                        {songs.length} bài hát
                        {songs.length > 0 ? ` • ${totalMinutes(songs)} phút` : ""}
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
                            colors={albumColors as any}
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
                        onPress={openAlbumMenu}
                        style={{
                            width: 46,
                            height: 46,
                            borderRadius: 23,
                            backgroundColor: "rgba(255,255,255,0.08)",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        {savingAlbum
                            ? <ActivityIndicator size="small" color="white" />
                            : <Ionicons name="ellipsis-horizontal" size={22} color="white" />
                        }
                    </TouchableOpacity>
                </View>
            )}

            {/* ── SONG LIST ── */}
            {loading ? (
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                    <ActivityIndicator size="large" color="#EC4899" />
                    <Text style={{ color: "#6B7280", marginTop: 12, fontSize: 14 }}>
                        Đang tải bài hát...
                    </Text>
                </View>
            ) : error ? (
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
                    <Ionicons name="cloud-offline-outline" size={56} color="#6B7280" />
                    <Text style={{ color: "white", fontSize: 17, fontWeight: "bold", marginTop: 16, textAlign: "center" }}>
                        Không thể tải album
                    </Text>
                    <Text style={{ color: "#6B7280", textAlign: "center", marginTop: 8, marginBottom: 20 }}>
                        {error}
                    </Text>
                    <TouchableOpacity
                        onPress={fetchAlbum}
                        style={{
                            paddingHorizontal: 24,
                            paddingVertical: 10,
                            borderRadius: 20,
                            backgroundColor: "#EC4899",
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
                        Album này chưa có bài hát nào
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
                            tintColor="#EC4899"
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
                                        <Ionicons name="volume-high" size={16} color="#EC4899" />
                                    ) : (
                                        <Text style={{ color: "#6B7280", fontSize: 13 }}>
                                            {index + 1}
                                        </Text>
                                    )}
                                </View>

                                {/* Cover Image */}
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
                                        colors={albumColors as any}
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
                                            color: isPlaying ? "#EC4899" : "white",
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

                                {/* Duration */}
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

        {/* ── ALBUM OPTIONS BOTTOM SHEET ── */}
        {albumMenuVisible && (
            <Modal visible transparent animationType="none" statusBarTranslucent onRequestClose={closeAlbumMenu}>
                <Animated.View
                    style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', opacity: fadeAnim }}
                >
                    <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={closeAlbumMenu} />
                </Animated.View>

                <Animated.View style={{
                    position: 'absolute',
                    bottom: 0, left: 0, right: 0,
                    transform: [{ translateY: slideAnim }],
                }}>
                    <View style={{
                        backgroundColor: '#1a1a1a',
                        borderTopLeftRadius: 24,
                        borderTopRightRadius: 24,
                        borderWidth: 1,
                        borderColor: 'rgba(255,255,255,0.08)',
                        paddingBottom: 36,
                    }}>
                        {/* Handle */}
                        <View style={{ alignItems: 'center', paddingTop: 12, marginBottom: 4 }}>
                            <View style={{ width: 36, height: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2 }} />
                        </View>

                        {/* Album header */}
                        <View style={{
                            flexDirection: 'row', alignItems: 'center',
                            paddingHorizontal: 20, paddingVertical: 14,
                            borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
                        }}>
                            {album?.cover_image ? (
                                <Image
                                    source={formatImageUrl(album.cover_image)}
                                    style={{ width: 52, height: 52, borderRadius: 10 }}
                                    contentFit="cover"
                                />
                            ) : (
                                <LinearGradient
                                    colors={albumColors as any}
                                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                                    style={{ width: 52, height: 52, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}
                                >
                                    <Ionicons name="disc" size={26} color="rgba(255,255,255,0.9)" />
                                </LinearGradient>
                            )}
                            <View style={{ marginLeft: 14, flex: 1 }}>
                                <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, marginBottom: 3 }}>ALBUM</Text>
                                <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }} numberOfLines={1}>
                                    {album?.name}
                                </Text>
                            </View>
                        </View>

                        {/* Add / Remove from Library */}
                        <TouchableOpacity
                            style={{ flexDirection: 'row', alignItems: 'center', padding: 18, gap: 16 }}
                            onPress={handleToggleSaveAlbum}
                        >
                            <View style={{
                                width: 40, height: 40, borderRadius: 20,
                                backgroundColor: isSaved ? 'rgba(236,72,153,0.18)' : 'rgba(255,255,255,0.07)',
                                alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Ionicons
                                    name={isSaved ? 'heart' : 'heart-outline'}
                                    size={22}
                                    color={isSaved ? '#EC4899' : 'white'}
                                />
                            </View>
                            <View>
                                <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                                    {isSaved ? 'Xóa khỏi thư viện' : 'Thêm vào thư viện'}
                                </Text>
                                <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 }}>
                                    {isSaved ? 'Album sẽ bị xóa khỏi Thư viện của bạn' : 'Album sẽ xuất hiện trong Thư viện của bạn'}
                                </Text>
                            </View>
                        </TouchableOpacity>

                        {/* Cancel */}
                        <TouchableOpacity
                            style={{
                                marginHorizontal: 20, marginTop: 6,
                                padding: 14, alignItems: 'center',
                                backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 14,
                            }}
                            onPress={closeAlbumMenu}
                        >
                            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15 }}>Hủy</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </Modal>
        )}
        </>
    );
}
