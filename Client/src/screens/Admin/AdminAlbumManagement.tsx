import React, { useState, useEffect, useCallback } from 'react';
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

// ─────────────────────────────────────────────────────────────────────────────

export default function AdminAlbumManagementScreen() {
    const navigation = useNavigation();

    const [albums, setAlbums] = useState<Playlist[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // ── Edit album modal (info + cover) ──
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedAlbum, setSelectedAlbum] = useState<Playlist | null>(null);
    const [editName, setEditName] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [editTags, setEditTags] = useState('');
    const [editCoverUri, setEditCoverUri] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

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
        if (!result.canceled) {
            setEditCoverUri(result.assets[0].uri);
        }
    };

    const handleSaveEdit = async () => {
        if (!editName.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập tên album');
            return;
        }
        setIsSaving(true);
        try {
            const tagsArr = editTags.split(',').map(t => t.trim()).filter(Boolean);

            // 1. Cập nhật thông tin
            await updateAdminAlbum(selectedAlbum!._id, {
                name: editName.trim(),
                description: editDesc.trim(),
                tags: tagsArr,
            });

            // 2. Nếu chọn ảnh bìa mới → upload riêng
            if (editCoverUri) {
                await updateAdminAlbumCover(selectedAlbum!._id, editCoverUri);
            }

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

        // Optimistic update
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

    const openAddSongs = async () => {
        setPickedIds([]);
        setSearchText('');
        setAddSongsModalVisible(true);
        if (allSongs.length === 0) {
            setIsFetchingSongs(true);
            try {
                const songs = await getAllSongs();
                setAllSongs(songs);
            } catch {
                Alert.alert('Lỗi', 'Không thể tải danh sách bài hát');
            } finally {
                setIsFetchingSongs(false);
            }
        }
    };

    const togglePick = (id: string) => {
        setPickedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const handleConfirmAddSongs = async () => {
        if (pickedIds.length === 0) {
            setAddSongsModalVisible(false);
            return;
        }
        setIsAddingSongs(true);
        try {
            // Add sequentially to avoid conflicts
            for (const songId of pickedIds) {
                try {
                    await addSongToAlbum(albumDetail!._id, songId);
                } catch {
                    // skip duplicates silently
                }
            }
            await refreshAlbumDetail();
            setAddSongsModalVisible(false);
        } catch (error: any) {
            Alert.alert('Lỗi', error?.response?.data?.message || 'Không thể thêm bài hát');
        } finally {
            setIsAddingSongs(false);
        }
    };

    // Already-in-album song IDs for filtering
    const inAlbumIds = new Set((albumDetail?.tracks ?? []).map(t => getSongId(t)));

    const filteredSongs = allSongs
        .filter(s => !inAlbumIds.has(s._id))
        .filter(s => s.title.toLowerCase().includes(searchText.toLowerCase()));

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <SafeAreaView className="flex-1 bg-black">

            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-white/10">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 mr-1">
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white text-xl font-bold">Quản Lý Album</Text>
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
                    <Ionicons name="albums-outline" size={64} color="#444" />
                    <Text className="text-white text-xl font-bold text-center mt-4">Chưa có album nào</Text>
                    <Text className="text-gray-400 text-center mt-2">Nhấn "Thêm" để tạo album mới</Text>
                </View>
            ) : (
                <ScrollView className="flex-1 px-5 pt-4">
                    <Text className="text-gray-500 text-xs mb-4 uppercase tracking-widest">
                        {albums.length} album hệ thống
                    </Text>

                    {albums.map(album => (
                        <View
                            key={album._id}
                            className="bg-white/5 rounded-2xl mb-4 border border-white/10 overflow-hidden"
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
                                    <Text className="text-white font-bold text-base" numberOfLines={1}>
                                        {album.name}
                                    </Text>
                                    {album.description ? (
                                        <Text className="text-gray-400 text-xs mt-0.5" numberOfLines={1}>
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

                            {/* Action bar */}
                            <View className="flex-row border-t border-white/10">
                                <TouchableOpacity
                                    onPress={() => openSongsModal(album)}
                                    className="flex-1 flex-row items-center justify-center py-3 border-r border-white/10"
                                >
                                    <Ionicons name="musical-notes-outline" size={16} color="#A855F7" />
                                    <Text className="text-purple-400 text-xs font-semibold ml-1.5">Bài Hát</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => openEdit(album)}
                                    className="flex-1 flex-row items-center justify-center py-3 border-r border-white/10"
                                >
                                    <Ionicons name="create-outline" size={16} color="#06B6D4" />
                                    <Text className="text-cyan-400 text-xs font-semibold ml-1.5">Chỉnh Sửa</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => handleDelete(album)}
                                    className="flex-1 flex-row items-center justify-center py-3"
                                >
                                    <Ionicons name="trash-outline" size={16} color="#EF4444" />
                                    <Text className="text-red-400 text-xs font-semibold ml-1.5">Xóa</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                    <View className="h-8" />
                </ScrollView>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                EDIT ALBUM MODAL  (info + cover)
            ═══════════════════════════════════════════════════════════════ */}
            <Modal
                visible={editModalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setEditModalVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1 bg-black/80 justify-end"
                >
                    <View className="bg-gray-900 rounded-t-3xl p-6" style={{ maxHeight: '90%' }}>
                        {/* Header */}
                        <View className="flex-row items-center justify-between mb-5">
                            <Text className="text-white text-xl font-bold">Chỉnh Sửa Album</Text>
                            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                                <Ionicons name="close" size={28} color="white" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Cover picker */}
                            <View className="items-center mb-5">
                                <TouchableOpacity onPress={pickCover} activeOpacity={0.8}>
                                    <View
                                        className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-pink-500"
                                        style={{ backgroundColor: '#1a1a2e' }}
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

                                        {/* Overlay edit icon */}
                                        <View
                                            className="absolute bottom-0 right-0 bg-pink-600 rounded-tl-xl p-1.5"
                                        >
                                            <Ionicons name="pencil" size={14} color="white" />
                                        </View>
                                    </View>
                                </TouchableOpacity>
                                <Text className="text-gray-400 text-xs mt-2">
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
                                <Text className="text-gray-400 text-sm mb-2">Tên Album *</Text>
                                <TextInput
                                    value={editName}
                                    onChangeText={setEditName}
                                    placeholder="Nhập tên album"
                                    placeholderTextColor="#555"
                                    className="text-white p-4 rounded-xl border border-white/10"
                                    style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}
                                />
                            </View>

                            {/* Description */}
                            <View className="mb-4">
                                <Text className="text-gray-400 text-sm mb-2">Mô Tả</Text>
                                <TextInput
                                    value={editDesc}
                                    onChangeText={setEditDesc}
                                    placeholder="Nhập mô tả album"
                                    placeholderTextColor="#555"
                                    multiline
                                    textAlignVertical="top"
                                    className="text-white p-4 rounded-xl border border-white/10 h-24"
                                    style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}
                                />
                            </View>

                            {/* Tags */}
                            <View className="mb-6">
                                <Text className="text-gray-400 text-sm mb-2">Tags (phân cách bằng dấu phẩy)</Text>
                                <TextInput
                                    value={editTags}
                                    onChangeText={setEditTags}
                                    placeholder="Pop, Ballad, V-Pop"
                                    placeholderTextColor="#555"
                                    className="text-white p-4 rounded-xl border border-white/10"
                                    style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}
                                />
                            </View>

                            {/* Save */}
                            <TouchableOpacity
                                onPress={handleSaveEdit}
                                disabled={isSaving}
                                className={`py-4 rounded-xl items-center mb-3 ${isSaving ? 'bg-gray-700' : 'bg-pink-600'}`}
                            >
                                {isSaving ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text className="text-white font-bold text-lg">Lưu Thay Đổi</Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setEditModalVisible(false)}
                                className="py-4 rounded-xl items-center bg-white/10 mb-2"
                            >
                                <Text className="text-white font-semibold">Hủy</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* ═══════════════════════════════════════════════════════════════
                SONGS MANAGEMENT MODAL
            ═══════════════════════════════════════════════════════════════ */}
            <Modal
                visible={songsModalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setSongsModalVisible(false)}
            >
                <View className="flex-1 bg-black/85 justify-end">
                    <View className="bg-gray-900 rounded-t-3xl" style={{ maxHeight: '85%' }}>
                        {/* Header */}
                        <View className="flex-row items-center justify-between px-6 pt-5 pb-3 border-b border-white/10">
                            <View className="flex-1">
                                <Text className="text-white text-lg font-bold" numberOfLines={1}>
                                    {albumDetail?.name ?? 'Bài hát trong Album'}
                                </Text>
                                {albumDetail && (
                                    <Text className="text-gray-400 text-xs mt-0.5">
                                        {albumDetail.tracks.length} bài hát
                                        {isReordering ? ' · Đang lưu...' : ''}
                                    </Text>
                                )}
                            </View>
                            <View className="flex-row items-center">
                                <TouchableOpacity
                                    onPress={openAddSongs}
                                    className="bg-pink-600 flex-row items-center px-3 py-2 rounded-xl mr-2"
                                >
                                    <Ionicons name="add" size={18} color="white" />
                                    <Text className="text-white text-sm font-semibold ml-1">Thêm</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setSongsModalVisible(false)}>
                                    <Ionicons name="close" size={26} color="white" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {isSongsLoading ? (
                            <View className="py-16 items-center">
                                <ActivityIndicator size="large" color="#EC4899" />
                            </View>
                        ) : albumDetail && albumDetail.tracks.length === 0 ? (
                            <View className="py-16 items-center">
                                <Ionicons name="musical-notes-outline" size={48} color="#555" />
                                <Text className="text-gray-400 mt-3 text-center">
                                    Chưa có bài hát nào.{'\n'}Nhấn "Thêm" để thêm bài hát.
                                </Text>
                            </View>
                        ) : (
                            <ScrollView className="px-5 pt-4" showsVerticalScrollIndicator={false}>
                                {/* Legend */}
                                <View className="flex-row items-center mb-3">
                                    <Ionicons name="swap-vertical" size={14} color="#666" />
                                    <Text className="text-gray-500 text-xs ml-1">
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
                                            className="flex-row items-center bg-white/5 rounded-xl p-3 mb-2 border border-white/8"
                                        >
                                            {/* Number */}
                                            <Text className="text-gray-500 text-xs w-6 text-center">{idx + 1}</Text>

                                            {/* Cover */}
                                            {coverUrl ? (
                                                <Image source={{ uri: coverUrl }} className="w-11 h-11 rounded-lg ml-2" />
                                            ) : (
                                                <View className="w-11 h-11 rounded-lg bg-gray-700 items-center justify-center ml-2">
                                                    <Ionicons name="musical-note" size={18} color="gray" />
                                                </View>
                                            )}

                                            {/* Info */}
                                            <View className="flex-1 ml-3">
                                                <Text className="text-white font-semibold text-sm" numberOfLines={1}>
                                                    {title}
                                                </Text>
                                                {artists ? (
                                                    <Text className="text-gray-400 text-xs mt-0.5" numberOfLines={1}>
                                                        {artists}
                                                    </Text>
                                                ) : null}
                                            </View>

                                            {/* Reorder buttons */}
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

                                            {/* Remove */}
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
                    </View>
                </View>
            </Modal>

            {/* ═══════════════════════════════════════════════════════════════
                ADD SONGS SUB-MODAL
            ═══════════════════════════════════════════════════════════════ */}
            <Modal
                visible={addSongsModalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setAddSongsModalVisible(false)}
            >
                <View className="flex-1 bg-black/90 justify-end">
                    <View className="bg-gray-950 rounded-t-3xl" style={{ maxHeight: '85%' }}>
                        {/* Header */}
                        <View className="flex-row items-center justify-between px-6 pt-5 pb-3 border-b border-white/10">
                            <Text className="text-white text-lg font-bold">Chọn Bài Hát</Text>
                            <TouchableOpacity onPress={() => setAddSongsModalVisible(false)}>
                                <Ionicons name="close" size={26} color="white" />
                            </TouchableOpacity>
                        </View>

                        {/* Search */}
                        <View className="px-5 py-3">
                            <View
                                className="flex-row items-center rounded-xl px-4 py-2.5"
                                style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}
                            >
                                <Ionicons name="search" size={17} color="#555" />
                                <TextInput
                                    value={searchText}
                                    onChangeText={setSearchText}
                                    placeholder="Tìm bài hát..."
                                    placeholderTextColor="#555"
                                    className="flex-1 text-white ml-2 text-sm"
                                />
                                {searchText.length > 0 && (
                                    <TouchableOpacity onPress={() => setSearchText('')}>
                                        <Ionicons name="close-circle" size={17} color="#555" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

                        {isFetchingSongs ? (
                            <View className="py-12 items-center">
                                <ActivityIndicator size="large" color="#EC4899" />
                            </View>
                        ) : (
                            <ScrollView className="px-5" showsVerticalScrollIndicator={false}>
                                {filteredSongs.length === 0 && (
                                    <View className="py-10 items-center">
                                        <Text className="text-gray-500">Không có bài hát nào phù hợp</Text>
                                    </View>
                                )}
                                {filteredSongs.map(song => {
                                    const picked = pickedIds.includes(song._id);
                                    const coverUrl = formatCover(song.cover_image);
                                    const artistNames = song.artist_ids?.map(a => a.name).join(', ') ?? '';
                                    return (
                                        <TouchableOpacity
                                            key={song._id}
                                            onPress={() => togglePick(song._id)}
                                            activeOpacity={0.7}
                                            className={`flex-row items-center p-3 rounded-xl mb-2 border ${picked
                                                ? 'border-pink-500/50 bg-pink-600/15'
                                                : 'border-white/10 bg-white/5'
                                                }`}
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
                                                    className={`font-semibold text-sm ${picked ? 'text-pink-300' : 'text-white'}`}
                                                    numberOfLines={1}
                                                >
                                                    {song.title}
                                                </Text>
                                                {artistNames ? (
                                                    <Text className="text-gray-400 text-xs mt-0.5" numberOfLines={1}>
                                                        {artistNames}
                                                    </Text>
                                                ) : null}
                                            </View>

                                            <View
                                                className={`w-6 h-6 rounded-full border-2 items-center justify-center ${picked ? 'bg-pink-500 border-pink-500' : 'border-gray-600'}`}
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
                        <View className="absolute bottom-0 left-0 right-0 bg-gray-950 border-t border-white/10 px-5 py-4">
                            <TouchableOpacity
                                onPress={handleConfirmAddSongs}
                                disabled={isAddingSongs}
                                className={`py-4 rounded-xl items-center ${isAddingSongs ? 'bg-gray-700' : 'bg-pink-600'}`}
                            >
                                {isAddingSongs ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text className="text-white font-bold text-base">
                                        {pickedIds.length > 0
                                            ? `Thêm ${pickedIds.length} bài hát`
                                            : 'Đóng'}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
