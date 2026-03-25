import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Modal, TouchableWithoutFeedback, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState, useRef, useEffect, useCallback } from "react";
import { PanResponderInstance } from "react-native";
import { PanResponder } from "react-native";
import { Image } from "expo-image";
import ProfileMenu from "../../components/ModalProfile/ProfileMenu";
import UserAvatar from "../../components/ModalProfile/UserAvatar";
import { LinearGradient } from 'expo-linear-gradient';
import CreatePlaylistModal from "../../components/Playlist/CreatePlaylistModal";

import { Playlist, getMyPlaylists, deletePlaylist } from "../../API/playlistAPI";
import { BASE_URL } from "../../API/axiosClient";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";

const formatCover = (url: string | null | undefined): string | null => {
    if (!url) return null;
    return url.startsWith('http') ? url : `${BASE_URL}${url}`;
};

// ─── Animated bottom sheet backdrop+slide ────────────────────────────────────
function OptionsMenu({
    visible,
    playlist,
    onClose,
    onOpen,
    onDelete,
}: {
    visible: boolean;
    playlist: Playlist | null;
    onClose: () => void;
    onOpen: () => void;
    onDelete: () => void;
}) {
    const slideAnim = useRef(new Animated.Value(400)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [rendered, setRendered] = useState(false);

    useEffect(() => {
        if (visible) {
            setRendered(true);
            Animated.parallel([
                Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 20, stiffness: 200 }),
                Animated.timing(fadeAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(slideAnim, { toValue: 400, duration: 200, useNativeDriver: true }),
                Animated.timing(fadeAnim, { toValue: 0, duration: 160, useNativeDriver: true }),
            ]).start(() => setRendered(false));
        }
    }, [visible]);

    if (!rendered && !visible) return null;

    const coverUrl = formatCover(playlist?.cover_image);

    return (
        <Modal visible transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
            <Animated.View
                style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', opacity: fadeAnim }}
            >
                <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
            </Animated.View>

            <Animated.View style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                transform: [{ translateY: slideAnim }],
            }}>
                <View style={{
                    backgroundColor: '#1a1a1a',
                    borderTopLeftRadius: 24,
                    borderTopRightRadius: 24,
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.08)',
                    paddingBottom: 32,
                }}>
                    {/* Handle */}
                    <View style={{ alignItems: 'center', paddingTop: 12, marginBottom: 4 }}>
                        <View style={{ width: 36, height: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2 }} />
                    </View>

                    {/* Playlist header with cover */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' }}>
                        {coverUrl ? (
                            <Image source={coverUrl} style={{ width: 48, height: 48, borderRadius: 10 }} contentFit="cover" />
                        ) : (
                            <LinearGradient
                                colors={["#EC4899", "#06B6D4"]}
                                style={{ width: 48, height: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}
                            >
                                <Ionicons name="musical-notes" size={22} color="rgba(255,255,255,0.9)" />
                            </LinearGradient>
                        )}
                        <View style={{ marginLeft: 12, flex: 1 }}>
                            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>Playlist</Text>
                            <Text style={{ color: 'white', fontSize: 16, fontWeight: '700', marginTop: 2 }} numberOfLines={1}>
                                {playlist?.name}
                            </Text>
                        </View>
                    </View>

                    {/* Open */}
                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', padding: 18, gap: 14 }} onPress={onOpen}>
                        <Ionicons name="musical-notes-outline" size={22} color="white" />
                        <Text style={{ color: 'white', fontSize: 16 }}>Mở playlist</Text>
                    </TouchableOpacity>

                    {/* Delete */}
                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', padding: 18, gap: 14 }} onPress={onDelete}>
                        <Ionicons name="trash-outline" size={22} color="#EC4899" />
                        <Text style={{ color: '#EC4899', fontSize: 16 }}>Xóa playlist</Text>
                    </TouchableOpacity>

                    {/* Cancel */}
                    <TouchableOpacity
                        style={{ marginHorizontal: 20, marginTop: 8, padding: 14, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 14 }}
                        onPress={onClose}
                    >
                        <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15 }}>Hủy</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </Modal>
    );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function LibraryScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [activeFilter, setActiveFilter] = useState("all");
    const [sortBy, setSortBy] = useState("recent");
    const [isLoading, setIsLoading] = useState(true);
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [menuPlaylist, setMenuPlaylist] = useState<Playlist | null>(null);
    const [menuVisible, setMenuVisible] = useState(false);

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
                if (gestureState.dx > 50) setShowProfileMenu(true);
            },
        })
    ).current;

    useEffect(() => { loadPlaylists(); }, []);

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

    const openMenu = (playlist: Playlist) => {
        setMenuPlaylist(playlist);
        setMenuVisible(true);
    };

    const closeMenu = () => setMenuVisible(false);

    const handleDeletePlaylist = async () => {
        const playlist = menuPlaylist;
        closeMenu();
        if (!playlist) return;
        Alert.alert(
            "Xóa playlist",
            `Bạn có chắc muốn xóa "${playlist.name}"?`,
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Xóa",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deletePlaylist(playlist._id);
                            setPlaylists(prev => prev.filter(p => p._id !== playlist._id));
                        } catch {
                            Alert.alert("Lỗi", "Không thể xóa playlist. Vui lòng thử lại.");
                        }
                    },
                },
            ]
        );
    };

    const handleOpenPlaylist = () => {
        if (menuPlaylist) {
            closeMenu();
            navigation.navigate("Playlists", { title: menuPlaylist.name, playlistId: menuPlaylist._id });
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
                        <Ionicons name="timer-outline" size={22} color="white" />
                    </TouchableOpacity>
                    <Ionicons name="settings-outline" size={22} color="white" />
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                {/* FILTER CHIPS */}
                <View className="px-4 mt-4">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                        {filters.map((filter) => (
                            <TouchableOpacity
                                key={filter.id}
                                onPress={() => setActiveFilter(filter.id)}
                                className={`px-4 py-2 rounded-full ${activeFilter === filter.id ? "bg-pink-500" : "bg-neutral-800"}`}
                            >
                                <Text className={`font-semibold ${activeFilter === filter.id ? "text-white" : "text-gray-400"}`}>
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

                {/* CREATE NEW PLAYLIST BUTTON */}
                <View className="px-4 mt-6">
                    <TouchableOpacity activeOpacity={0.8} className="rounded-2xl overflow-hidden" onPress={() => setShowCreateModal(true)}>
                        <LinearGradient
                            colors={["#EC4899", "#06B6D4"] as const}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            className="flex-row items-center justify-center py-4 px-6"
                        >
                            <Ionicons name="add-circle-outline" size={24} color="white" />
                            <Text className="text-white font-bold text-lg ml-3">Tạo Playlist Mới</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* PLAYLIST GRID */}
                {isLoading ? (
                    <View className="py-12 items-center">
                        <ActivityIndicator size="large" color="#EC4899" />
                        <Text className="text-gray-400 mt-3">Đang tải...</Text>
                    </View>
                ) : playlists.length > 0 ? (
                    <View className="px-4 mt-6">
                        <Text className="text-white text-xl font-bold mb-4">Playlist của tôi</Text>
                        <View className="flex-row flex-wrap justify-between">
                            {playlists.map((playlist) => {
                                const coverUrl = formatCover(playlist.cover_image);
                                return (
                                    <TouchableOpacity
                                        key={playlist._id}
                                        activeOpacity={0.8}
                                        onPress={() => navigation.navigate("Playlists", { title: playlist.name, playlistId: playlist._id })}
                                        className="w-[48%] mb-4 bg-neutral-900/50 rounded-xl overflow-hidden border border-white/5"
                                    >
                                        {/* Cover — real image or gradient fallback */}
                                        {coverUrl ? (
                                            <Image
                                                source={coverUrl}
                                                style={{ width: '100%', aspectRatio: 1 }}
                                                contentFit="cover"
                                                cachePolicy="memory-disk"
                                            />
                                        ) : (
                                            <LinearGradient
                                                colors={["#EC4899", "#06B6D4"] as const}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 1 }}
                                                style={{ width: "100%", aspectRatio: 1, alignItems: "center", justifyContent: "center" }}
                                            >
                                                <Ionicons name="musical-notes" size={48} color="rgba(255,255,255,0.8)" />
                                            </LinearGradient>
                                        )}

                                        {/* Info */}
                                        <View className="p-3">
                                            <Text className="text-white font-bold text-base" numberOfLines={1}>{playlist.name}</Text>
                                            <Text className="text-gray-400 text-sm mt-1">
                                                Danh sách phát của tôi
                                            </Text>
                                            <Text className="text-gray-500 text-xs mt-1">
                                                {playlist.is_public ? "Công khai" : "Riêng tư"}
                                            </Text>
                                        </View>

                                        {/* More Options */}
                                        <TouchableOpacity
                                            className="absolute top-2 right-2 bg-black/50 rounded-full p-1.5"
                                            onPress={(e) => { e.stopPropagation(); openMenu(playlist); }}
                                        >
                                            <Ionicons name="ellipsis-horizontal" size={16} color="white" />
                                        </TouchableOpacity>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                ) : (
                    /* EMPTY STATE */
                    <View className="px-4 mt-12">
                        <View className="bg-neutral-900/50 rounded-2xl p-8 items-center border border-white/5">
                            <View className="w-24 h-24 rounded-full items-center justify-center mb-4"
                                style={{ backgroundColor: "rgba(236,72,153,0.15)" }}>
                                <Ionicons name="albums-outline" size={48} color="#EC4899" />
                            </View>
                            <Text className="text-white text-xl font-bold mb-2">Chưa có playlist nào</Text>
                            <Text className="text-gray-400 text-center mb-6">
                                Tạo playlist đầu tiên để bắt đầu{"\n"}sưu tập nhạc của bạn
                            </Text>
                            <TouchableOpacity activeOpacity={0.8} className="rounded-full overflow-hidden" onPress={() => setShowCreateModal(true)}>
                                <LinearGradient
                                    colors={["#EC4899", "#06B6D4"] as const}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    className="px-6 py-3"
                                >
                                    <Text className="text-white font-bold">Tạo Playlist Ngay</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* PROFILE MENU */}
            <ProfileMenu isVisible={showProfileMenu} onClose={() => setShowProfileMenu(false)} />

            {/* CREATE PLAYLIST MODAL */}
            <CreatePlaylistModal
                visible={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreated={(newPlaylist) => {
                    setPlaylists(prev => [newPlaylist, ...prev]);
                }}
            />

            {/* PLAYLIST OPTIONS MENU (smooth animated) */}
            <OptionsMenu
                visible={menuVisible}
                playlist={menuPlaylist}
                onClose={closeMenu}
                onOpen={handleOpenPlaylist}
                onDelete={handleDeletePlaylist}
            />
        </SafeAreaView>
    );
}
