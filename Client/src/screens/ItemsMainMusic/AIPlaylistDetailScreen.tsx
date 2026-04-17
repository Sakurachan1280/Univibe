import React, { useState, useRef } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StatusBar,
    Animated,
    Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRoute, RouteProp } from "@react-navigation/native";
import { useAppNavigation } from "../../navigation/useAppNavigation";
import { Song } from "../../API/musicAPI";
import { useMusic } from "../../context/MusicContext";
import AddToPlaylistModal from "../../components/Playlist/AddToPlaylistModal";
import { RootStackParamList } from "../../navigation/types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type AIPlaylistDetailRouteProp = RouteProp<RootStackParamList, "AIPlaylistDetail">;

function formatDuration(seconds?: number | string): string {
    const secs = typeof seconds === "string" ? parseFloat(seconds) : seconds;
    if (!secs) return "";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function AIPlaylistDetailScreen() {
    const navigation = useAppNavigation();
    const route = useRoute<AIPlaylistDetailRouteProp>();
    const { title, songs, description } = route.params;

    const { playSong, currentSong, isPlaying } = useMusic();
    const [addToPlaylistSong, setAddToPlaylistSong] = useState<Song | null>(null);

    const scrollY = useRef(new Animated.Value(0)).current;
    const headerBgOpacity = scrollY.interpolate({
        inputRange: [80, 160],
        outputRange: [0, 1],
        extrapolate: "clamp",
    });

    const config = {
        colors: ["#4c1d95", "#831843", "#1a002a", "#050505"] as [string, string, string, string],
        icon: "sparkles",
    };

    const handlePlay = async (song: Song) => {
        await playSong(song, songs);
        navigation.navigate("MusicPlayer", { song });
    };

    const handlePlayAll = () => {
        if (songs.length > 0) handlePlay(songs[0]);
    };

    const handleShuffle = () => {
        if (songs.length === 0) return;
        const shuffled = [...songs].sort(() => Math.random() - 0.5);
        handlePlay(shuffled[0]);
    };

    const totalMin = Math.round(songs.reduce((acc, s) => acc + (Number(s.duration) ?? 0), 0) / 60);

    return (
        <View style={{ flex: 1, backgroundColor: "#050505" }}>
            <AddToPlaylistModal
                visible={addToPlaylistSong !== null}
                songId={addToPlaylistSong?._id ?? null}
                songTitle={addToPlaylistSong?.title}
                onClose={() => setAddToPlaylistSong(null)}
            />
            <StatusBar barStyle="light-content" />

            {/* Sticky animated header */}
            <Animated.View
                style={{
                    position: "absolute", top: 0, left: 0, right: 0, zIndex: 10,
                    opacity: headerBgOpacity, backgroundColor: "#0d0d0d",
                    borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)",
                }}
            >
                <SafeAreaView edges={["top"]}>
                    <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10, gap: 12 }}>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" }}
                        >
                            <Ionicons name="chevron-back" size={22} color="white" />
                        </TouchableOpacity>
                        <Text style={{ color: "white", fontSize: 17, fontWeight: "700", flex: 1 }} numberOfLines={1}>
                            {title}
                        </Text>
                    </View>
                </SafeAreaView>
            </Animated.View>

            <Animated.ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 130 }}
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
                scrollEventThrottle={16}
            >
                {/* Hero gradient header */}
                <LinearGradient
                    colors={config.colors}
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
                        </View>

                        {/* Cover mosaic */}
                        <View style={{ alignItems: "center", marginBottom: 24 }}>
                            <View style={{
                                width: 172, height: 172, borderRadius: 16, overflow: "hidden",
                                shadowColor: config.colors[0],
                                shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.6, shadowRadius: 24, elevation: 16,
                            }}>
                                <LinearGradient
                                    colors={[config.colors[0], config.colors[1]]}
                                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                                    style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
                                >
                                    {songs.filter(s => s.cover_image).length >= 4 ? (
                                        <View style={{ flex: 1, width: "100%", flexDirection: "row", flexWrap: "wrap" }}>
                                            {songs.filter(s => s.cover_image).slice(0, 4).map((s, i) => (
                                                <Image key={i} source={s.cover_image} style={{ width: "50%", height: "50%" }} contentFit="cover" cachePolicy="memory-disk" />
                                            ))}
                                        </View>
                                    ) : (
                                        <Ionicons name={config.icon as any} size={72} color="rgba(255,255,255,0.9)" />
                                    )}
                                </LinearGradient>
                            </View>
                        </View>

                        {/* Title & meta */}
                        <View style={{ paddingHorizontal: 24, alignItems: "center" }}>
                            <Text style={{ color: "white", fontSize: 28, fontWeight: "800", textAlign: "center", marginBottom: 6, letterSpacing: 0.2 }}>
                                {title}
                            </Text>
                            {description && (
                                <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, textAlign: "center", marginBottom: 8 }} numberOfLines={2}>
                                    {description}
                                </Text>
                            )}
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                                <Ionicons name="sparkles" size={13} color="#A855F7" />
                                <Text style={{ color: "rgba(255,255,255,0.55)", fontSize: 13 }}>
                                    AI Generated • {songs.length} bài hát{totalMin > 0 ? ` • ${totalMin} phút` : ""}
                                </Text>
                            </View>
                        </View>
                    </SafeAreaView>
                </LinearGradient>

                {/* Action row */}
                <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 16, gap: 12 }}>
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
                        style={{ width: 56, height: 56, borderRadius: 28, overflow: "hidden", shadowColor: config.colors[0], shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 8 }}
                    >
                        <LinearGradient
                            colors={[config.colors[0], config.colors[1]]}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
                        >
                            <Ionicons name="play" size={26} color="white" style={{ marginLeft: 3 }} />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Body */}
                <View style={{ paddingHorizontal: 16 }}>
                    <Text style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, fontWeight: "600", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8, paddingLeft: 4 }}>
                        {songs.length} bài hát
                    </Text>
                    {songs.map((song) => {
                        const isActive = currentSong?._id === song._id;
                        const artistName = song.artist_ids?.map((a: any) => a.name).join(", ") || "Unknown Artist";
                        return (
                            <TouchableOpacity
                                key={song._id}
                                onPress={() => handlePlay(song)}
                                activeOpacity={0.65}
                                style={{
                                    flexDirection: "row", alignItems: "center",
                                    paddingVertical: 9, paddingHorizontal: 6,
                                    borderRadius: 12, marginBottom: 2,
                                    backgroundColor: isActive ? `${config.colors[0]}14` : "transparent",
                                }}
                            >
                                {/* Cover */}
                                <View style={{ marginRight: 14 }}>
                                    {song.cover_image ? (
                                        <View style={{ position: "relative" }}>
                                            <Image source={song.cover_image} style={{ width: 52, height: 52, borderRadius: 10 }} cachePolicy="memory-disk" />
                                            {isActive && (
                                                <View style={{ position: "absolute", inset: 0, borderRadius: 10, backgroundColor: "rgba(0,0,0,0.45)", alignItems: "center", justifyContent: "center" }}>
                                                    <Ionicons name={isPlaying ? "volume-high" : "pause"} size={20} color={config.colors[0]} />
                                                </View>
                                            )}
                                        </View>
                                    ) : (
                                        <LinearGradient
                                            colors={[config.colors[0], config.colors[1]]}
                                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                                            style={{ width: 52, height: 52, borderRadius: 10, alignItems: "center", justifyContent: "center" }}
                                        >
                                            <Ionicons name="musical-note" size={22} color="rgba(255,255,255,0.9)" />
                                        </LinearGradient>
                                    )}
                                </View>

                                {/* Info */}
                                <View style={{ flex: 1 }}>
                                    <Text style={{ color: isActive ? config.colors[0] : "white", fontWeight: "600", fontSize: 15, marginBottom: 3 }} numberOfLines={1}>
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

                                {/* 3-dot */}
                                <TouchableOpacity
                                    onPress={() => setAddToPlaylistSong(song)}
                                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                    style={{ padding: 4 }}
                                >
                                    <Ionicons name="ellipsis-vertical" size={18} color="rgba(255,255,255,0.5)" />
                                </TouchableOpacity>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </Animated.ScrollView>
        </View>
    );
}
