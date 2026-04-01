import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
    ScrollView,
    Modal,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

import {
    Playlist,
    getAdminAlbums,
    updateAdminAlbum,
    deleteAdminAlbum,
    getPlaylistDetail,
    removeSongFromAlbum,
    addSongToAlbum,
    updateAdminAlbumCover,
    reorderAlbumTracks,
    PlaylistTrack,
} from '../../API/playlistAPI';
import { getAllSongs, Song } from '../../API/songAPI';
import { BASE_URL } from '../../API/axiosClient';
import { useAdminTheme } from '../../context/AdminThemeContext';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getSongId = (track: PlaylistTrack): string => {
    const s = track.song_id as any;
    return typeof s === 'string' ? s : s?._id ?? '';
};

const getSongTitle = (track: PlaylistTrack): string => {
    const s = track.song_id as any;
    return typeof s === 'string' ? '(loading)' : s?.title ?? 'Unknown';
};

const getSongCover = (track: PlaylistTrack): string | null => {
    const s = track.song_id as any;
    return typeof s === 'string' ? null : s?.cover_image ?? null;
};

const getSongArtists = (track: PlaylistTrack): string => {
    const s = track.song_id as any;
    if (typeof s === 'string') return '';
    return s?.artist_ids?.map((a: any) => a.name).join(', ') ?? '';
};

const formatCover = (url: string | null | undefined): string | null => {
    if (!url) return null;
    return url.startsWith('http') ? url : `${BASE_URL}${url}`;
};

// ─── Animated bottom sheet wrapper ───────────────────────────────────────────
function BottomSheet({
    visible,
    onClose,
    children,
    maxHeight = '90%',
}: {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
    maxHeight?: string | number;
}) {
    const slideAnim = useRef(new Animated.Value(600)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [rendered, setRendered] = useState(false);

    React.useEffect(() => {
        if (visible) {
            setRendered(true);
            Animated.parallel([
                Animated.spring(slideAnim, {
                    toValue: 0,
                    useNativeDriver: true,
                    damping: 20,
                    stiffness: 200,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 600,
                    duration: 220,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 180,
                    useNativeDriver: true,
                }),
            ]).start(() => setRendered(false));
        }
    }, [visible]);

    if (!rendered && !visible) return null;

    return (
        <Modal visible transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
            {/* Backdrop */}
            <Animated.View
                style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', opacity: fadeAnim }}
            >
                <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
            </Animated.View>

            {/* Sheet */}
            <Animated.View
                style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    maxHeight: maxHeight as any,
                    transform: [{ translateY: slideAnim }],
                }}
            >
                {children}
            </Animated.View>
        </Modal>
    );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function AdminAlbumManagementScreen() {
    const navigation = useNavigation();
    const theme = useAdminTheme();

    const [albums, setAlbums] = useState<Playlist[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // ── Edit album modal ──
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedAlbum, setSelectedAlbum] = useState<Playlist | null>(null);
    const [editName, setEditName] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [editTags, setEditTags] = useState('');
    const [editCoverUri, setEditCoverUri] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const nameInputRef = useRef<any>(null);

    // ── Songs modal ──
    const [songsModalVisible, setSongsModalVisible] = useState(false);
    const [albumDetail, setAlbumDetail] = useState<Playlist | null>(null);
    const [isSongsLoading, setIsSongsLoading] = useState(false);
    const [isReordering, setIsReordering] = useState(false);

    // ── Add songs sub-modal ──
    const [addSongsModalVisible, setAddSongsModalVisible] = useState(false);
    const [allSongs, setAllSongs] = useState<Song[]>([]);
    const [isFetchingSongs, setIsFetchingSongs] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [pickedIds, setPickedIds] = useState<string[]>([]);
    const [isAddingSongs, setIsAddingSongs] = useState(false);

    // target album for direct "add songs" from card (without opening songs modal first)
    const [addSongsTarget, setAddSongsTarget] = useState<Playlist | null>(null);
    // track if add-songs was opened from songs modal (so we can reopen it after)
    const [addSongsFromSongsModal, setAddSongsFromSongsModal] = useState(false);

    useFocusEffect(
        useCallback(() => {
            fetchAlbums();
        }, [])
    );

    const fetchAlbums = async () => {
        try {
            setIsLoading(true);
            const data = await getAdminAlbums();
            setAlbums(data);
        } catch {
            Alert.alert('Lỗi', 'Không thể tải danh sách album');
        } finally {
            setIsLoading(false);
        }
    };

    // ── Edit album ───────────────────────────────────────────────────────────

    const openEdit = (album: Playlist) => {
        setSelectedAlbum(album);
        setEditName(album.name);
        setEditDesc(album.description || '');
        setEditTags(album.tags?.join(', ') || '');
        setEditCoverUri(null);
        setEditModalVisible(true);
        // Tự động focus vào ô tên sau khi bottom sheet mở xong animation
        setTimeout(() => {
            nameInputRef.current?.focus();
        }, 400);
    };

    const pickCover = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Cần quyền truy cập', 'Vui lòng cấp quyền truy cập thư viện ảnh');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.85,
        });
        if (!result.canceled) setEditCoverUri(result.assets[0].uri);
    };

    const handleSaveEdit = async () => {
        if (!editName.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập tên album');
            return;
        }
        setIsSaving(true);
        try {
            const tagsArr = editTags.split(',').map(t => t.trim()).filter(Boolean);
            await updateAdminAlbum(selectedAlbum!._id, {
                name: editName.trim(),
                description: editDesc.trim(),
                tags: tagsArr,
            });
            if (editCoverUri) await updateAdminAlbumCover(selectedAlbum!._id, editCoverUri);
            Alert.alert('Thành công', 'Đã cập nhật album');
            setEditModalVisible(false);
            fetchAlbums();
        } catch (error: any) {
            Alert.alert('Lỗi', error?.response?.data?.message || 'Không thể cập nhật album');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = (album: Playlist) => {
        Alert.alert(
            'Xóa Album',
            `Bạn có chắc muốn xóa album "${album.name}"? Hành động này không thể hoàn tác.`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteAdminAlbum(album._id);
                            fetchAlbums();
                        } catch (error: any) {
                            Alert.alert('Lỗi', error?.response?.data?.message || 'Không thể xóa album');
                        }
                    },
                },
            ]
        );
    };

    // ── Songs management ─────────────────────────────────────────────────────

    const openSongsModal = async (album: Playlist) => {
        setAlbumDetail(null);
        setSongsModalVisible(true);
        setIsSongsLoading(true);
        try {
            const detail = await getPlaylistDetail(album._id);
            setAlbumDetail(detail);
        } catch {
            Alert.alert('Lỗi', 'Không thể tải danh sách bài hát');
            setSongsModalVisible(false);
        } finally {
            setIsSongsLoading(false);
        }
    };

    const refreshAlbumDetail = async () => {
        if (!albumDetail) return;
        try {
            const d = await getPlaylistDetail(albumDetail._id);
            setAlbumDetail(d);
        } catch { }
    };

    const handleRemoveSong = (songId: string, title: string) => {
        Alert.alert('Xóa Bài Hát', `Xóa "${title}" khỏi album?`, [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Xóa',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await removeSongFromAlbum(albumDetail!._id, songId);
                        await refreshAlbumDetail();
                    } catch (error: any) {
                        Alert.alert('Lỗi', error?.response?.data?.message || 'Không thể xóa bài hát');
                    }
                },
            },
        ]);
    };

    // ── Reorder ──────────────────────────────────────────────────────────────

    const moveTrack = async (fromIdx: number, toIdx: number) => {
        if (!albumDetail) return;
        const tracks = [...albumDetail.tracks];
        const [moved] = tracks.splice(fromIdx, 1);
        tracks.splice(toIdx, 0, moved);
        setAlbumDetail({ ...albumDetail, tracks });
        setIsReordering(true);
        try {
            const orderedIds = tracks.map(t => getSongId(t));
            await reorderAlbumTracks(albumDetail._id, orderedIds);
        } catch {
            Alert.alert('Lỗi', 'Không thể lưu thứ tự bài hát');
            await refreshAlbumDetail();
        } finally {
            setIsReordering(false);
        }
    };

    // ── Add songs ────────────────────────────────────────────────────────────
    // Can be called from:
    //   A) Songs modal  → target = albumDetail
    //   B) Direct card  → target = specific album (sets addSongsTarget)

    const openAddSongsForAlbum = async (album: Playlist) => {
        setAddSongsTarget(album);
        setPickedIds([]);
        setSearchText('');
        // Always fresh load to reflect latest state
        setAllSongs([]);
        setAddSongsModalVisible(true);
        setIsFetchingSongs(true);
        try {
            const songs = await getAllSongs();
            // Pre-fetch detail to know which songs are already in album
            const detail = await getPlaylistDetail(album._id);
            const inAlbum = new Set(detail.tracks.map(t => getSongId(t)));
            let available = songs.filter(s => !inAlbum.has(s._id));

            // Nếu album gắn với ca sĩ cụ thể, chỉ hiện bài của ca sĩ đó
            if (album.artist_id) {
                available = available.filter(s =>
                    s.artist_ids?.some((a: any) => {
                        const id = typeof a === 'string' ? a : a._id;
                        return id === album.artist_id;
                    })
                );
            }

            setAllSongs(available);
        } catch {
            Alert.alert('Lỗi', 'Không thể tải danh sách bài hát');
        } finally {
            setIsFetchingSongs(false);
        }
    };

    const openAddSongsFromSongsModal = () => {
        if (!albumDetail) return;
        const target = albumDetail;
        // Close songs modal first, then open add-songs modal after animation ends
        // This avoids the React Native "nested Modal" issue on Android
        setAddSongsFromSongsModal(true);
        setSongsModalVisible(false);
        setTimeout(() => {
            openAddSongsForAlbum(target);
        }, 350);
    };

    const togglePick = (id: string) => {
        setPickedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const handleConfirmAddSongs = async () => {
        if (pickedIds.length === 0) {
            setAddSongsModalVisible(false);
            return;
        }
        const target = addSongsTarget;
        if (!target) return;

        setIsAddingSongs(true);
        try {
            for (const songId of pickedIds) {
                try {
                    await addSongToAlbum(target._id, songId);
                } catch {
                    // skip duplicates silently
                }
            }
            setAddSongsModalVisible(false);
            // Refresh album detail
            await refreshAlbumDetail();
            // If opened from songs modal, re-open it after a short delay
            if (addSongsFromSongsModal) {
                setAddSongsFromSongsModal(false);
                setTimeout(() => setSongsModalVisible(true), 300);
            }
            // Brief confirmation
            Alert.alert('✓ Đã thêm', `${pickedIds.length} bài hát vào "${target.name}"`);
        } catch (error: any) {
            Alert.alert('Lỗi', error?.response?.data?.message || 'Không thể thêm bài hát');
        } finally {
            setIsAddingSongs(false);
        }
    };

    const filteredSongs = allSongs.filter(s =>
        s.title.toLowerCase().includes(searchText.toLowerCase())
    );

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <Animated.View style={{ flex: 1, backgroundColor: theme.animBg }}>
        <SafeAreaView style={{ flex: 1 }}>

            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.bgCardBorder }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8, marginRight: 4 }}>
                        <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
                    </TouchableOpacity>
                    <Text style={{ color: theme.textPrimary, fontSize: 20, fontWeight: 'bold' }}>Quản Lý Album & Playlist</Text>
                </View>
                <TouchableOpacity
                    onPress={() => (navigation as any).navigate('CreateAlbum')}
                    className="flex-row items-center bg-pink-600 px-3 py-2 rounded-xl"
                >
                    <Ionicons name="add" size={20} color="white" />
                    <Text className="text-white font-semibold ml-1">Thêm</Text>
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#EC4899" />
                </View>
            ) : albums.length === 0 ? (
                <View className="flex-1 items-center justify-center px-8">
                    <Ionicons name="albums-outline" size={64} color={theme.textSecondary} />
                    <Text style={{ color: theme.textPrimary, fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginTop: 16 }}>Chưa có album / playlist nào</Text>
                    <Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 8 }}>Nhấn "Thêm" để tạo album hoặc playlist mới</Text>
                </View>
            ) : (
                <ScrollView className="flex-1 px-5 pt-4">
                    <Text style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>
                        {albums.length} album / playlist hệ thống
                    </Text>

                    {albums.map(album => (
                        <Animated.View
                            key={album._id}
                            style={{ backgroundColor: theme.animCard, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: theme.bgCardBorder, overflow: 'hidden' }}
                        >
                            <View className="flex-row items-center p-4">
                                {/* Cover */}
                                <View className="w-16 h-16 rounded-xl overflow-hidden"
                                    style={{ backgroundColor: '#1a1a2e' }}>
                                    {album.cover_image ? (
                                        <Image
                                            source={{ uri: formatCover(album.cover_image)! }}
                                            style={{ width: '100%', height: '100%' }}
                                        />
                                    ) : (
                                        <View className="w-full h-full items-center justify-center">
                                            <Ionicons name="albums" size={28} color="#EC4899" />
                                        </View>
                                    )}
                                </View>

                                {/* Info */}
                                <View className="flex-1 ml-3">
                                    <Text style={{ color: theme.textPrimary, fontWeight: 'bold', fontSize: 16 }} numberOfLines={1}>
                                        {album.name}
                                    </Text>
                                    {album.description ? (
                                        <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 2 }} numberOfLines={1}>
                                            {album.description}
                                        </Text>
                                    ) : null}
                                    {album.tags && album.tags.length > 0 && (
                                        <View className="flex-row flex-wrap mt-1">
                                            {album.tags.slice(0, 3).map(tag => (
                                                <View key={tag} className="bg-purple-600/20 rounded px-1.5 py-0.5 mr-1 mb-1">
                                                    <Text className="text-purple-300 text-xs">{tag}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    )}
                                </View>
                            </View>

                            {/* Action bar — 3 buttons */}
                            <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: theme.bgCardBorder }}>
                                <TouchableOpacity
                                    onPress={() => openSongsModal(album)}
                                    style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRightWidth: 1, borderRightColor: theme.bgCardBorder }}
                                >
                                    <Ionicons name="musical-notes-outline" size={15} color="#A855F7" />
                                    <Text className="text-purple-400 text-xs font-semibold ml-1">Bài Hát</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => openEdit(album)}
                                    style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRightWidth: 1, borderRightColor: theme.bgCardBorder }}
                                >
                                    <Ionicons name="create-outline" size={15} color="#06B6D4" />
                                    <Text className="text-cyan-400 text-xs font-semibold ml-1">Sửa</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => handleDelete(album)}
                                    style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12 }}
                                >
                                    <Ionicons name="trash-outline" size={15} color="#EF4444" />
                                    <Text className="text-red-400 text-xs font-semibold ml-1">Xóa</Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    ))}
                    <View className="h-8" />
                </ScrollView>
            )}

            {/* ══════════════════════════════════════════════════════════════════
                EDIT ALBUM MODAL
            ══════════════════════════════════════════════════════════════════ */}
            <BottomSheet visible={editModalVisible} onClose={() => setEditModalVisible(false)}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <Animated.View style={{ backgroundColor: theme.animCard, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%' }}>
                        {/* Header */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                            <Text style={{ color: theme.textPrimary, fontSize: 20, fontWeight: 'bold' }}>Chỉnh Sửa Album</Text>
                            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                                <Ionicons name="close" size={28} color={theme.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Cover picker */}
                            <View className="items-center mb-5">
                                <TouchableOpacity onPress={pickCover} activeOpacity={0.8}>
                                    <View
                                        className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-pink-500"
                                        style={{ backgroundColor: theme.bgInput }}
                                    >
                                        {editCoverUri ? (
                                            <Image source={{ uri: editCoverUri }} style={{ width: '100%', height: '100%' }} />
                                        ) : selectedAlbum?.cover_image ? (
                                            <Image
                                                source={{ uri: formatCover(selectedAlbum.cover_image)! }}
                                                style={{ width: '100%', height: '100%' }}
                                            />
                                        ) : (
                                            <View className="w-full h-full items-center justify-center">
                                                <Ionicons name="camera" size={36} color="#EC4899" />
                                            </View>
                                        )}
                                        <View className="absolute bottom-0 right-0 bg-pink-600 rounded-tl-xl p-1.5">
                                            <Ionicons name="pencil" size={14} color="white" />
                                        </View>
                                    </View>
                                </TouchableOpacity>
                                <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 8 }}>
                                    {editCoverUri ? '✓ Ảnh mới đã chọn' : 'Nhấn để thay đổi ảnh bìa'}
                                </Text>
                                {editCoverUri && (
                                    <TouchableOpacity onPress={() => setEditCoverUri(null)} className="mt-1">
                                        <Text className="text-red-400 text-xs">Bỏ chọn</Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            {/* Name */}
                            <View className="mb-4">
                                <Text style={{ color: theme.textSecondary, fontSize: 14, marginBottom: 8 }}>Tên Album *</Text>
                                <TextInput
                                    ref={nameInputRef}
                                    value={editName}
                                    onChangeText={setEditName}
                                    placeholder="Nhập tên album"
                                    placeholderTextColor={theme.textSecondary}
                                    returnKeyType="next"
                                    style={{ color: theme.textPrimary, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: theme.bgCardBorder, backgroundColor: theme.bgInput }}
                                />
                            </View>

                            {/* Description */}
                            <View className="mb-4">
                                <Text style={{ color: theme.textSecondary, fontSize: 14, marginBottom: 8 }}>Mô Tả</Text>
                                <TextInput
                                    value={editDesc}
                                    onChangeText={setEditDesc}
                                    placeholder="Nhập mô tả album"
                                    placeholderTextColor={theme.textSecondary}
                                    multiline
                                    textAlignVertical="top"
                                    style={{ color: theme.textPrimary, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: theme.bgCardBorder, backgroundColor: theme.bgInput, height: 96 }}
                                />
                            </View>

                            {/* Tags */}
                            <View className="mb-6">
                                <Text style={{ color: theme.textSecondary, fontSize: 14, marginBottom: 8 }}>Tags (phân cách bằng dấu phẩy)</Text>
                                <TextInput
                                    value={editTags}
                                    onChangeText={setEditTags}
                                    placeholder="Pop, Ballad, V-Pop"
                                    placeholderTextColor={theme.textSecondary}
                                    style={{ color: theme.textPrimary, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: theme.bgCardBorder, backgroundColor: theme.bgInput }}
                                />
                            </View>

                            <TouchableOpacity
                                onPress={handleSaveEdit}
                                disabled={isSaving}
                                className={`py-4 rounded-xl items-center mb-3 ${isSaving ? 'bg-gray-700' : 'bg-pink-600'}`}
                            >
                                {isSaving ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 18 }}>Lưu Thay Đổi</Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setEditModalVisible(false)}
                                style={{ paddingVertical: 16, borderRadius: 12, alignItems: 'center', backgroundColor: theme.bgCardBorder, marginBottom: 8 }}
                            >
                                <Text style={{ color: theme.textPrimary, fontWeight: '600' }}>Hủy</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </Animated.View>
                </KeyboardAvoidingView>
            </BottomSheet>

            {/* ══════════════════════════════════════════════════════════════════
                SONGS MANAGEMENT MODAL
            ══════════════════════════════════════════════════════════════════ */}
            <BottomSheet visible={songsModalVisible} onClose={() => setSongsModalVisible(false)} maxHeight="85%">
                <Animated.View style={{ backgroundColor: theme.animCard, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '100%' }}>
                    {/* Header */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: theme.bgCardBorder }}>
                        <View className="flex-1">
                            <Text style={{ color: theme.textPrimary, fontSize: 18, fontWeight: 'bold' }} numberOfLines={1}>
                                {albumDetail?.name ?? 'Bài hát trong Album'}
                            </Text>
                            {albumDetail && (
                                <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 2 }}>
                                    {albumDetail.tracks.length} bài hát
                                    {isReordering ? ' · Đang lưu...' : ''}
                                </Text>
                            )}
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            {/* Add songs button inside songs modal */}
                            <TouchableOpacity
                                onPress={openAddSongsFromSongsModal}
                                style={{ backgroundColor: '#16A34A', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, marginRight: 8 }}
                            >
                                <Ionicons name="add" size={18} color="white" />
                                <Text style={{ color: 'white', fontSize: 14, fontWeight: '600', marginLeft: 4 }}>Thêm</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setSongsModalVisible(false)}>
                                <Ionicons name="close" size={26} color={theme.textPrimary} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {isSongsLoading ? (
                        <View className="py-16 items-center">
                            <ActivityIndicator size="large" color="#EC4899" />
                        </View>
                    ) : albumDetail && albumDetail.tracks.length === 0 ? (
                        <View className="py-16 items-center px-6">
                            <Ionicons name="musical-notes-outline" size={48} color={theme.textSecondary} />
                            <Text style={{ color: theme.textSecondary, marginTop: 12, textAlign: 'center' }}>
                                Chưa có bài hát nào.
                            </Text>
                            <TouchableOpacity
                                onPress={openAddSongsFromSongsModal}
                                style={{ marginTop: 16, backgroundColor: '#16A34A', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'center' }}
                            >
                                <Ionicons name="add" size={18} color="white" />
                                <Text style={{ color: 'white', fontWeight: '600', marginLeft: 8 }}>Thêm bài hát</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <ScrollView className="px-5 pt-4" showsVerticalScrollIndicator={false}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                                <Ionicons name="swap-vertical" size={14} color={theme.textSecondary} />
                                <Text style={{ color: theme.textSecondary, fontSize: 12, marginLeft: 4 }}>
                                    Dùng ↑↓ để thay đổi thứ tự bài hát
                                </Text>
                            </View>

                            {albumDetail?.tracks.map((track, idx) => {
                                const songId = getSongId(track);
                                const title = getSongTitle(track);
                                const cover = getSongCover(track);
                                const artists = getSongArtists(track);
                                const coverUrl = formatCover(cover);
                                const total = albumDetail.tracks.length;

                                return (
                                    <View
                                        key={songId || idx}
                                        style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.bgInput, borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: theme.bgCardBorder }}
                                    >
                                        <Text style={{ color: theme.textSecondary, fontSize: 12, width: 24, textAlign: 'center' }}>{idx + 1}</Text>

                                        {coverUrl ? (
                                            <Image source={{ uri: coverUrl }} className="w-11 h-11 rounded-lg ml-2" />
                                        ) : (
                                            <View className="w-11 h-11 rounded-lg bg-gray-700 items-center justify-center ml-2">
                                                <Ionicons name="musical-note" size={18} color="gray" />
                                            </View>
                                        )}

                                        <View className="flex-1 ml-3">
                                            <Text style={{ color: theme.textPrimary, fontWeight: '600', fontSize: 14 }} numberOfLines={1}>
                                                {title}
                                            </Text>
                                            {artists ? (
                                                <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 2 }} numberOfLines={1}>
                                                    {artists}
                                                </Text>
                                            ) : null}
                                        </View>

                                        <View className="flex-col items-center mr-1">
                                            <TouchableOpacity
                                                onPress={() => moveTrack(idx, idx - 1)}
                                                disabled={idx === 0 || isReordering}
                                                className="p-1.5"
                                            >
                                                <Ionicons
                                                    name="chevron-up"
                                                    size={18}
                                                    color={idx === 0 ? '#333' : '#9CA3AF'}
                                                />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() => moveTrack(idx, idx + 1)}
                                                disabled={idx === total - 1 || isReordering}
                                                className="p-1.5"
                                            >
                                                <Ionicons
                                                    name="chevron-down"
                                                    size={18}
                                                    color={idx === total - 1 ? '#333' : '#9CA3AF'}
                                                />
                                            </TouchableOpacity>
                                        </View>

                                        <TouchableOpacity
                                            onPress={() => handleRemoveSong(songId, title)}
                                            className="bg-red-600/20 rounded-full p-2 ml-1"
                                        >
                                            <Ionicons name="trash-outline" size={16} color="#EF4444" />
                                        </TouchableOpacity>
                                    </View>
                                );
                            })}
                            <View className="h-8" />
                        </ScrollView>
                    )}
                </Animated.View>
            </BottomSheet>

            {/* ══════════════════════════════════════════════════════════════════
                ADD SONGS MODAL (smooth animated)
            ══════════════════════════════════════════════════════════════════ */}
            <BottomSheet
                visible={addSongsModalVisible}
                onClose={() => !isAddingSongs && setAddSongsModalVisible(false)}
                maxHeight="88%"
            >
                <Animated.View style={{ backgroundColor: theme.animCard, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '100%' }}>
                    {/* Header */}
                    <View className="flex-row items-center justify-between px-6 pt-5 pb-3 border-b border-white/10">
                        <View className="flex-1">
                            <Text className="text-white text-lg font-bold">Thêm Bài Hát</Text>
                            {addSongsTarget && (
                                <Text className="text-gray-400 text-xs mt-0.5" numberOfLines={1}>
                                    vào "{addSongsTarget.name}"
                                </Text>
                            )}
                        </View>
                        <TouchableOpacity
                            onPress={() => !isAddingSongs && setAddSongsModalVisible(false)}
                            disabled={isAddingSongs}
                        >
                            <Ionicons name="close" size={26} color={isAddingSongs ? '#555' : 'white'} />
                        </TouchableOpacity>
                    </View>

                    {/* Selected count pill */}
                    {pickedIds.length > 0 && (
                        <View style={{ marginHorizontal: 20, marginTop: 12, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(34,197,94,0.12)', borderWidth: 1, borderColor: 'rgba(34,197,94,0.3)' }}>
                            <View className="flex-row items-center">
                                <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
                                <Text style={{ color: '#4ADE80', fontSize: 14, fontWeight: '600', marginLeft: 8 }}>
                                    Đã chọn {pickedIds.length} bài
                                </Text>
                            </View>
                            <TouchableOpacity onPress={() => setPickedIds([])}>
                                <Text style={{ color: theme.textSecondary, fontSize: 12 }}>Bỏ chọn hết</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Search */}
                    <View style={{ paddingHorizontal: 20, paddingVertical: 12 }}>
                        <View
                            style={{ flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: theme.bgInput, borderWidth: 1, borderColor: theme.bgCardBorder }}
                        >
                            <Ionicons name="search" size={17} color={theme.textSecondary} />
                            <TextInput
                                value={searchText}
                                onChangeText={setSearchText}
                                placeholder="Tìm bài hát..."
                                placeholderTextColor={theme.textSecondary}
                                style={{ flex: 1, color: theme.textPrimary, marginLeft: 8, fontSize: 14 }}
                            />
                            {searchText.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchText('')}>
                                    <Ionicons name="close-circle" size={17} color={theme.textSecondary} />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {isFetchingSongs ? (
                        <View className="py-12 items-center">
                            <ActivityIndicator size="large" color="#22C55E" />
                            <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 12 }}>Đang tải bài hát...</Text>
                        </View>
                    ) : (
                        <ScrollView className="px-5" showsVerticalScrollIndicator={false}>
                            {filteredSongs.length === 0 ? (
                                <View className="py-10 items-center">
                                    <Ionicons name="musical-notes-outline" size={40} color={theme.textSecondary} />
                                    <Text style={{ color: theme.textSecondary, marginTop: 12 }}>
                                        {allSongs.length === 0
                                            ? 'Tất cả bài hát đã có trong album'
                                            : 'Không có bài hát phù hợp'}
                                    </Text>
                                </View>
                            ) : null}
                            {filteredSongs.map(song => {
                                const picked = pickedIds.includes(song._id);
                                const coverUrl = formatCover(song.cover_image);
                                const artistNames = song.artist_ids?.map(a => a.name).join(', ') ?? '';
                                return (
                                    <TouchableOpacity
                                        key={song._id}
                                        onPress={() => togglePick(song._id)}
                                        activeOpacity={0.7}
                                        style={{
                                            flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, marginBottom: 8, borderWidth: 1,
                                            borderColor: picked ? 'rgba(34,197,94,0.5)' : theme.bgCardBorder,
                                            backgroundColor: picked ? 'rgba(34,197,94,0.12)' : theme.bgInput,
                                        }}
                                    >
                                        {coverUrl ? (
                                            <Image source={{ uri: coverUrl }} className="w-11 h-11 rounded-lg" />
                                        ) : (
                                            <View className="w-11 h-11 rounded-lg bg-gray-700 items-center justify-center">
                                                <Ionicons name="musical-note" size={18} color="gray" />
                                            </View>
                                        )}

                                        <View className="flex-1 ml-3">
                                            <Text
                                                style={{ fontWeight: '600', fontSize: 14, color: picked ? '#86EFAC' : theme.textPrimary }}
                                                numberOfLines={1}
                                            >
                                                {song.title}
                                            </Text>
                                            {artistNames ? (
                                                <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 2 }} numberOfLines={1}>
                                                    {artistNames}
                                                </Text>
                                            ) : null}
                                        </View>

                                        <View
                                            style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center', borderColor: picked ? '#22C55E' : theme.textSecondary, backgroundColor: picked ? '#22C55E' : 'transparent' }}
                                        >
                                            {picked && <Ionicons name="checkmark" size={13} color="white" />}
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                            <View className="h-28" />
                        </ScrollView>
                    )}

                    {/* Bottom bar */}
                    <Animated.View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: theme.animCard, borderTopWidth: 1, borderTopColor: theme.bgCardBorder, paddingHorizontal: 20, paddingVertical: 16 }}>
                        <TouchableOpacity
                            onPress={handleConfirmAddSongs}
                            disabled={isAddingSongs}
                            style={{ paddingVertical: 16, borderRadius: 12, alignItems: 'center', backgroundColor: isAddingSongs ? theme.bgInput : pickedIds.length > 0 ? '#16A34A' : theme.bgCardBorder }}
                            activeOpacity={0.8}
                        >
                            {isAddingSongs ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text style={{ fontWeight: 'bold', fontSize: 16, color: pickedIds.length > 0 ? 'white' : theme.textSecondary }}>
                                    {pickedIds.length > 0 ? `Thêm ${pickedIds.length} bài hát` : 'Đóng'}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </Animated.View>
                </Animated.View>
            </BottomSheet>

        </SafeAreaView>
        </Animated.View>
    );
}
