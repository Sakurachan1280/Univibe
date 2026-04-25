import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
    ScrollView,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

import { createAdminAlbum, addSongToAlbum, Playlist } from '../../API/playlistAPI';
import { getAllSongs } from '../../API/songAPI';
import { getAllArtists, getSongsByArtist, Artist } from '../../API/artistAPI';
import { BASE_URL } from '../../API/axiosClient';
import { useAdminTheme } from '../../context/AdminThemeContext';

// Minimal song shape used in this screen (compatible with both musicAPI.Song and songAPI.Song)
interface SongItem {
    _id: string;
    title: string;
    cover_image?: string;
    file_url?: string;
    duration?: number | string;
    artist_ids?: Array<{ _id: string; name: string; avatar?: string }>;
}

// ─── helpers ─────────────────────────────────────────────────────────────────

const formatImg = (url: string | null | undefined): string | null => {
    if (!url) return null;
    return url.startsWith('http') ? url : `${BASE_URL}${url}`;
};

const formatDuration = (seconds: number | string | undefined) => {
    if (!seconds) return '0:00';
    const secs = typeof seconds === 'string' ? parseInt(seconds) : seconds;
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}:${rem.toString().padStart(2, '0')}`;
};

// ─── types ───────────────────────────────────────────────────────────────────

type CollectionType = 'album' | 'playlist';

// Steps:
//  0 = choose type (album / playlist)
//  1 = basic info (name, desc, tags, cover-if-album)
//  2 = pick artist  (album only)
//  3 = pick songs
type Step = 0 | 1 | 2 | 3;

// ─────────────────────────────────────────────────────────────────────────────

export default function CreateAlbumScreen() {
    const navigation = useNavigation();
    const theme = useAdminTheme();

    // ── type & step ──────────────────────────────────────────────────────────
    const [collectionType, setCollectionType] = useState<CollectionType | null>(null);
    const [step, setStep] = useState<Step>(0);

    // ── basic info ───────────────────────────────────────────────────────────
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState('');
    const [coverUri, setCoverUri] = useState<string | null>(null);

    // ── artist (album only) ──────────────────────────────────────────────────
    const [allArtists, setAllArtists] = useState<Artist[]>([]);
    const [artistSearch, setArtistSearch] = useState('');
    const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
    const [isArtistsLoading, setIsArtistsLoading] = useState(false);

    // ── songs ────────────────────────────────────────────────────────────────
    const [availableSongs, setAvailableSongs] = useState<SongItem[]>([]);
    const [selectedSongIds, setSelectedSongIds] = useState<string[]>([]);
    const [songSearch, setSongSearch] = useState('');
    const [isSongsLoading, setIsSongsLoading] = useState(false);

    // ── creating ─────────────────────────────────────────────────────────────
    const [isCreating, setIsCreating] = useState(false);

    // ─── navigation helpers ───────────────────────────────────────────────────

    const goBack = () => {
        if (step === 0) {
            navigation.goBack();
        } else if (step === 1) {
            setStep(0);
            setCollectionType(null);
        } else if (step === 2) {
            setStep(1);
        } else if (step === 3) {
            // go back to artist picker if album, otherwise to info
            setStep(collectionType === 'album' ? 2 : 1);
        }
    };

    // ─── step 0 → 1 ──────────────────────────────────────────────────────────

    const chooseType = (type: CollectionType) => {
        setCollectionType(type);
        setStep(1);
    };

    // ─── step 1 → 2 (album) or 1 → 3 (playlist) ─────────────────────────────

    const goFromInfoNext = () => {
        if (!name.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập tên');
            return;
        }
        if (collectionType === 'album') {
            setStep(2);
            if (allArtists.length === 0) fetchArtists();
        } else {
            setStep(3);
            if (availableSongs.length === 0) fetchAllSongs();
        }
    };

    // ─── cover picker ─────────────────────────────────────────────────────────

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
            quality: 0.8,
        });
        if (!result.canceled) setCoverUri(result.assets[0].uri);
    };

    // ─── fetch artists ────────────────────────────────────────────────────────

    const fetchArtists = async () => {
        setIsArtistsLoading(true);
        try {
            const data = await getAllArtists();
            setAllArtists(data);
        } catch {
            Alert.alert('Lỗi', 'Không thể tải danh sách ca sĩ');
        } finally {
            setIsArtistsLoading(false);
        }
    };

    // ─── step 2 → 3: select artist, load their songs ─────────────────────────

    const selectArtistAndNext = async (artist: Artist) => {
        setSelectedArtist(artist);
        setAvailableSongs([]);
        setSelectedSongIds([]);
        setSongSearch('');
        setStep(3);
        setIsSongsLoading(true);
        try {
            const songs = await getSongsByArtist(artist._id);
            setAvailableSongs(songs as SongItem[]);
            if (songs.length === 0) {
                Alert.alert(
                    'Thông báo',
                    `Ca sĩ "${artist.name}" chưa có bài hát nào trong hệ thống.\nBạn vẫn có thể tạo album trống.`
                );
            }
        } catch {
            Alert.alert('Lỗi', 'Không thể tải bài hát của ca sĩ');
        } finally {
            setIsSongsLoading(false);
        }
    };

    // ─── fetch all songs (playlist) ───────────────────────────────────────────

    const fetchAllSongs = async () => {
        setIsSongsLoading(true);
        try {
            const data = await getAllSongs();
            setAvailableSongs(data as SongItem[]);
        } catch {
            Alert.alert('Lỗi', 'Không thể tải danh sách bài hát');
        } finally {
            setIsSongsLoading(false);
        }
    };

    const toggleSong = (id: string) => {
        setSelectedSongIds(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    // ─── create ───────────────────────────────────────────────────────────────

    const handleCreate = async () => {
        if (!name.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập tên');
            return;
        }
        setIsCreating(true);
        try {
            const tagsArray = tags.split(',').map(t => t.trim()).filter(t => t.length > 0);

            const created: Playlist = await createAdminAlbum(
                name.trim(),
                description.trim() || undefined,
                tagsArray,
                coverUri ?? undefined,
                collectionType === 'album' ? selectedArtist?._id : undefined
            );

            if (selectedSongIds.length > 0) {
                await Promise.all(
                    selectedSongIds.map(songId => addSongToAlbum(created._id, songId))
                );
            }

            const typeLabel = collectionType === 'album' ? 'Album' : 'Playlist';
            Alert.alert(
                'Thành công',
                `Đã tạo ${typeLabel} "${created.name}" với ${selectedSongIds.length} bài hát`,
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (error: any) {
            Alert.alert('Lỗi', error?.response?.data?.message || 'Không thể tạo');
        } finally {
            setIsCreating(false);
        }
    };

    // ─── derived ──────────────────────────────────────────────────────────────

    const filteredArtists = allArtists.filter(a =>
        a.name.toLowerCase().includes(artistSearch.toLowerCase())
    );

    const filteredSongs = availableSongs.filter(s =>
        s.title.toLowerCase().includes(songSearch.toLowerCase())
    );

    const totalSteps = collectionType === 'album' ? 3 : 2;
    const currentStepDisplay = step === 0 ? 0 : step === 1 ? 1 : step === 2 ? 2 : totalSteps;

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <Animated.View style={{ flex: 1, backgroundColor: theme.animBg }}>
        <SafeAreaView style={{ flex: 1 }}>

            {/* ── Header ── */}
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.bgCardBorder }}>
                <TouchableOpacity onPress={goBack} className="p-2 mr-2">
                    <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
                </TouchableOpacity>
                <View className="flex-1">
                    <Text style={{ color: theme.textPrimary, fontSize: 20, fontWeight: 'bold' }}>
                        {step === 0
                            ? 'Tạo Mới'
                            : collectionType === 'album'
                                ? 'Tạo Album'
                                : 'Tạo Playlist'}
                    </Text>
                    {step > 0 && (
                        <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
                            Bước {currentStepDisplay}/{totalSteps} ·{' '}
                            {step === 1
                                ? 'Thông tin'
                                : step === 2
                                    ? 'Chọn ca sĩ'
                                    : 'Chọn bài hát'}
                        </Text>
                    )}
                </View>
                {/* Step dots */}
                {step > 0 && (
                    <View className="flex-row items-center gap-x-1">
                        {Array.from({ length: totalSteps }).map((_, i) => (
                            <View
                                key={i}
                                className={`w-2.5 h-2.5 rounded-full ${currentStepDisplay > i ? 'bg-pink-500' : 'bg-gray-600'}`}
                            />
                        ))}
                    </View>
                )}
            </View>

            {/* ══════════════════════════════════════════════════════════════════
                STEP 0: Choose type
            ══════════════════════════════════════════════════════════════════ */}
            {step === 0 && (
                <ScrollView className="flex-1 px-6 pt-8">
                    <Text style={{ color: theme.textPrimary, fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 }}>
                        Bạn muốn tạo gì?
                    </Text>
                    <Text style={{ color: theme.textSecondary, textAlign: 'center', marginBottom: 32 }}>
                        Chọn loại để bắt đầu
                    </Text>

                    {/* Album card */}
                    <TouchableOpacity
                        onPress={() => chooseType('album')}
                        activeOpacity={0.85}
                        className="mb-4 rounded-2xl overflow-hidden border border-pink-500/40"
                        style={{ backgroundColor: 'rgba(236,72,153,0.08)' }}
                    >
                        <View className="p-6">
                            <View className="flex-row items-center mb-3">
                                <View className="w-12 h-12 rounded-xl bg-pink-600/20 items-center justify-center mr-4">
                                    <Ionicons name="albums" size={26} color="#EC4899" />
                                </View>
                                <Text className="text-white text-xl font-bold">Album</Text>
                            </View>
                            <Text className="text-gray-400 text-sm leading-5">
                                Tạo album gắn với <Text className="text-pink-400 font-semibold">một ca sĩ duy nhất</Text>.
                                Chỉ bài hát của ca sĩ đó mới được thêm vào.
                                Album có ảnh bìa và chỉ Admin có thể chỉnh sửa.
                            </Text>
                            <View className="flex-row items-center mt-4">
                                <View className="bg-pink-600/20 rounded-full px-2 py-1 mr-2 flex-row items-center">
                                    <Ionicons name="person" size={11} color="#EC4899" />
                                    <Text className="text-pink-400 text-xs ml-1">1 ca sĩ</Text>
                                </View>
                                <View className="bg-pink-600/20 rounded-full px-2 py-1 mr-2 flex-row items-center">
                                    <Ionicons name="image" size={11} color="#EC4899" />
                                    <Text className="text-pink-400 text-xs ml-1">Ảnh bìa</Text>
                                </View>
                                <View className="bg-pink-600/20 rounded-full px-2 py-1 flex-row items-center">
                                    <Ionicons name="shield-checkmark" size={11} color="#EC4899" />
                                    <Text className="text-pink-400 text-xs ml-1">Admin only</Text>
                                </View>
                            </View>
                        </View>
                        <View className="flex-row items-center justify-end px-6 pb-4">
                            <Text className="text-pink-400 font-semibold mr-1">Chọn</Text>
                            <Ionicons name="arrow-forward" size={16} color="#EC4899" />
                        </View>
                    </TouchableOpacity>

                    {/* Playlist card */}
                    <TouchableOpacity
                        onPress={() => chooseType('playlist')}
                        activeOpacity={0.85}
                        className="mb-4 rounded-2xl overflow-hidden border border-purple-500/40"
                        style={{ backgroundColor: 'rgba(168,85,247,0.08)' }}
                    >
                        <View className="p-6">
                            <View className="flex-row items-center mb-3">
                                <View className="w-12 h-12 rounded-xl bg-purple-600/20 items-center justify-center mr-4">
                                    <Ionicons name="musical-notes" size={26} color="#A855F7" />
                                </View>
                                <Text className="text-white text-xl font-bold">Playlist</Text>
                            </View>
                            <Text className="text-gray-400 text-sm leading-5">
                                Tạo playlist hệ thống với <Text className="text-purple-400 font-semibold">bất kỳ bài hát nào</Text>.
                                Không giới hạn ca sĩ. Phù hợp để gộp nhiều thể loại.
                            </Text>
                            <View className="flex-row items-center mt-4">
                                <View className="bg-purple-600/20 rounded-full px-2 py-1 mr-2 flex-row items-center">
                                    <Ionicons name="infinite" size={11} color="#A855F7" />
                                    <Text className="text-purple-400 text-xs ml-1">Đa ca sĩ</Text>
                                </View>
                                <View className="bg-purple-600/20 rounded-full px-2 py-1 flex-row items-center">
                                    <Ionicons name="shield-checkmark" size={11} color="#A855F7" />
                                    <Text className="text-purple-400 text-xs ml-1">Admin only</Text>
                                </View>
                            </View>
                        </View>
                        <View className="flex-row items-center justify-end px-6 pb-4">
                            <Text className="text-purple-400 font-semibold mr-1">Chọn</Text>
                            <Ionicons name="arrow-forward" size={16} color="#A855F7" />
                        </View>
                    </TouchableOpacity>
                </ScrollView>
            )}

            {/* ══════════════════════════════════════════════════════════════════
                STEP 1: Basic info
            ══════════════════════════════════════════════════════════════════ */}
            {step === 1 && (
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1"
                >
                    <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>

                        {/* Cover picker (album only) */}
                        {collectionType === 'album' && (
                            <View className="items-center mb-8">
                                <TouchableOpacity onPress={pickCover} activeOpacity={0.8}>
                                    <View
                                        className="w-40 h-40 rounded-2xl overflow-hidden border-2 border-dashed border-pink-500 items-center justify-center"
                                        style={{ backgroundColor: '#1a1a2e' }}
                                    >
                                        {coverUri ? (
                                            <Image
                                                source={{ uri: coverUri }}
                                                style={{ width: '100%', height: '100%' }}
                                            />
                                        ) : (
                                            <View className="items-center">
                                                <Ionicons name="image-outline" size={40} color="#EC4899" />
                                                <Text className="text-pink-400 text-sm mt-2 font-medium">Thêm Ảnh Bìa</Text>
                                            </View>
                                        )}
                                    </View>
                                </TouchableOpacity>
                                {coverUri && (
                                    <TouchableOpacity
                                        onPress={() => setCoverUri(null)}
                                        className="mt-2 flex-row items-center"
                                    >
                                        <Ionicons name="close-circle" size={16} color="#9CA3AF" />
                                        <Text className="text-gray-400 text-xs ml-1">Xóa ảnh</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}

                        {/* Name */}
                        <View className="mb-4">
                            <Text style={{ color: theme.textSecondary, fontSize: 14, marginBottom: 8 }}>
                                Tên {collectionType === 'album' ? 'Album' : 'Playlist'}{' '}
                                <Text className="text-pink-500">*</Text>
                            </Text>
                            <TextInput
                                value={name}
                                onChangeText={setName}
                                placeholder={`Nhập tên ${collectionType === 'album' ? 'album' : 'playlist'}`}
                                placeholderTextColor={theme.textSecondary}
                                style={{ color: theme.textPrimary, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: theme.bgCardBorder, backgroundColor: theme.bgInput }}
                            />
                        </View>

                        {/* Description */}
                        <View className="mb-4">
                            <Text style={{ color: theme.textSecondary, fontSize: 14, marginBottom: 8 }}>Mô Tả</Text>
                            <TextInput
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Nhập mô tả (tuỳ chọn)"
                                placeholderTextColor={theme.textSecondary}
                                multiline
                                textAlignVertical="top"
                                style={{ color: theme.textPrimary, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: theme.bgCardBorder, backgroundColor: theme.bgInput, height: 96 }}
                            />
                        </View>

                        {/* Tags */}
                        <View className="mb-8">
                            <Text style={{ color: theme.textSecondary, fontSize: 14, marginBottom: 8 }}>
                                Tags <Text style={{ color: theme.textSecondary, opacity: 0.7 }}>(phân cách bằng dấu phẩy)</Text>
                            </Text>
                            <TextInput
                                value={tags}
                                onChangeText={setTags}
                                placeholder="Pop, Ballad, V-Pop"
                                placeholderTextColor={theme.textSecondary}
                                style={{ color: theme.textPrimary, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: theme.bgCardBorder, backgroundColor: theme.bgInput }}
                            />
                        </View>

                        {/* Admin notice */}
                        <View className="rounded-xl p-4 mb-6 border"
                            style={{
                                backgroundColor: collectionType === 'album'
                                    ? 'rgba(236,72,153,0.08)'
                                    : 'rgba(168,85,247,0.08)',
                                borderColor: collectionType === 'album'
                                    ? 'rgba(236,72,153,0.3)'
                                    : 'rgba(168,85,247,0.3)',
                            }}>
                            <View className="flex-row items-center">
                                <Ionicons name="shield-checkmark" size={20}
                                    color={collectionType === 'album' ? '#EC4899' : '#A855F7'} />
                                <Text className="font-semibold ml-2"
                                    style={{ color: collectionType === 'album' ? '#EC4899' : '#A855F7' }}>
                                    {collectionType === 'album' ? 'Album Hệ Thống' : 'Playlist Hệ Thống'}
                                </Text>
                            </View>
                            <Text className="text-gray-400 text-sm mt-2">
                                {collectionType === 'album'
                                    ? 'Album gắn với 1 ca sĩ duy nhất. Người dùng thường không thể chỉnh sửa.'
                                    : 'Playlist công khai do Admin quản lý. Người dùng thường không thể chỉnh sửa.'}
                            </Text>
                        </View>

                        {/* Next */}
                        <TouchableOpacity
                            onPress={goFromInfoNext}
                            className="py-4 rounded-xl items-center mb-8"
                            style={{ backgroundColor: collectionType === 'album' ? '#DB2777' : '#9333EA' }}
                            activeOpacity={0.8}
                        >
                            <View className="flex-row items-center">
                                <Text className="text-white font-bold text-lg mr-2">Tiếp Theo</Text>
                                <Ionicons name="arrow-forward" size={20} color="white" />
                            </View>
                        </TouchableOpacity>
                    </ScrollView>
                </KeyboardAvoidingView>
            )}

            {/* ══════════════════════════════════════════════════════════════════
                STEP 2: Pick artist (album only)
            ══════════════════════════════════════════════════════════════════ */}
            {step === 2 && collectionType === 'album' && (
                <View className="flex-1">
                    {/* Info bar */}
                    <View style={{ paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.bgCardBorder, backgroundColor: 'rgba(236,72,153,0.06)' }}>
                        <Text style={{ color: '#F9A8D4', fontSize: 14, fontWeight: '600' }}>
                            Chọn 1 ca sĩ cho album này
                        </Text>
                        <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 2 }}>
                            Chỉ bài hát của ca sĩ được chọn mới có thể thêm vào album
                        </Text>
                    </View>

                    {/* Search */}
                    <View style={{ paddingHorizontal: 20, paddingVertical: 12 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: theme.bgInput, borderWidth: 1, borderColor: theme.bgCardBorder }}>
                            <Ionicons name="search" size={18} color={theme.textSecondary} />
                            <TextInput
                                value={artistSearch}
                                onChangeText={setArtistSearch}
                                placeholder="Tìm ca sĩ..."
                                placeholderTextColor={theme.textSecondary}
                                style={{ flex: 1, color: theme.textPrimary, marginLeft: 8 }}
                            />
                            {artistSearch.length > 0 && (
                                <TouchableOpacity onPress={() => setArtistSearch('')}>
                                    <Ionicons name="close-circle" size={18} color="#666" />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {isArtistsLoading ? (
                        <View className="flex-1 items-center justify-center">
                            <ActivityIndicator size="large" color="#EC4899" />
                        </View>
                    ) : filteredArtists.length === 0 ? (
                        <View className="flex-1 items-center justify-center">
                            <Ionicons name="person-outline" size={48} color="#444" />
                            <Text className="text-gray-400 mt-3">Không tìm thấy ca sĩ</Text>
                        </View>
                    ) : (
                        <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
                            <View className="h-2" />
                            {filteredArtists.map(artist => {
                                const avatarUrl = formatImg(artist.avatar);
                                return (
                                    <TouchableOpacity
                                        key={artist._id}
                                        onPress={() => selectArtistAndNext(artist)}
                                        activeOpacity={0.75}
                                        style={{ flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: theme.bgCardBorder, backgroundColor: theme.bgInput }}
                                    >
                                        {/* Avatar */}
                                        {avatarUrl ? (
                                            <Image
                                                source={{ uri: avatarUrl }}
                                                className="w-12 h-12 rounded-full"
                                            />
                                        ) : (
                                            <View className="w-12 h-12 rounded-full bg-pink-600/20 items-center justify-center">
                                                <Ionicons name="person" size={22} color="#EC4899" />
                                            </View>
                                        )}

                                        {/* Name */}
                                        <Text style={{ flex: 1, color: theme.textPrimary, fontWeight: '600', marginLeft: 12 }} numberOfLines={1}>
                                            {artist.name}
                                        </Text>

                                        {/* Arrow */}
                                        <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
                                    </TouchableOpacity>
                                );
                            })}
                            <View className="h-8" />
                        </ScrollView>
                    )}
                </View>
            )}

            {/* ══════════════════════════════════════════════════════════════════
                STEP 3: Pick songs
            ══════════════════════════════════════════════════════════════════ */}
            {step === 3 && (
                <View className="flex-1">
                    {/* Summary bar */}
                    <View style={{ paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.bgCardBorder }}>
                        <Text style={{ color: theme.textPrimary, fontWeight: '600' }} numberOfLines={1}>{name}</Text>
                        {collectionType === 'album' && selectedArtist && (
                            <View className="flex-row items-center mt-0.5">
                                <Ionicons name="person" size={12} color="#EC4899" />
                                <Text className="text-pink-400 text-xs ml-1">{selectedArtist.name}</Text>
                            </View>
                        )}
                        <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 2 }}>
                            {selectedSongIds.length > 0
                                ? `${selectedSongIds.length} bài đã chọn`
                                : 'Chưa chọn bài hát nào (tuỳ chọn)'}
                        </Text>
                    </View>

                    {/* Artist info banner (album) */}
                    {collectionType === 'album' && selectedArtist && (
                        <View className="mx-5 mt-3 mb-1 px-4 py-2.5 rounded-xl flex-row items-center"
                            style={{ backgroundColor: 'rgba(236,72,153,0.1)', borderWidth: 1, borderColor: 'rgba(236,72,153,0.25)' }}>
                            <Ionicons name="information-circle" size={16} color="#EC4899" />
                            <Text className="text-pink-300 text-xs ml-2 flex-1">
                                Chỉ hiển thị bài hát của <Text className="font-bold">{selectedArtist.name}</Text>
                            </Text>
                            {availableSongs.length === 0 && !isSongsLoading && (
                                <Text className="text-pink-400 text-xs font-semibold">0 bài</Text>
                            )}
                        </View>
                    )}

                    {/* Search */}
                    <View style={{ paddingHorizontal: 20, paddingVertical: 12 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: theme.bgInput, borderWidth: 1, borderColor: theme.bgCardBorder }}>
                            <Ionicons name="search" size={18} color={theme.textSecondary} />
                            <TextInput
                                value={songSearch}
                                onChangeText={setSongSearch}
                                placeholder="Tìm bài hát..."
                                placeholderTextColor={theme.textSecondary}
                                style={{ flex: 1, color: theme.textPrimary, marginLeft: 8 }}
                            />
                            {songSearch.length > 0 && (
                                <TouchableOpacity onPress={() => setSongSearch('')}>
                                    <Ionicons name="close-circle" size={18} color="#666" />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {/* Songs list */}
                    {isSongsLoading ? (
                        <View className="flex-1 items-center justify-center">
                            <ActivityIndicator size="large" color="#EC4899" />
                        </View>
                    ) : (
                        <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
                            {filteredSongs.length === 0 && !isSongsLoading && (
                                <View className="py-16 items-center">
                                    <Ionicons name="musical-notes-outline" size={48} color="#444" />
                                    <Text className="text-gray-400 mt-3 text-center">
                                        {collectionType === 'album' && selectedArtist
                                            ? `Ca sĩ "${selectedArtist.name}" chưa có bài hát nào`
                                            : 'Không tìm thấy bài hát'}
                                    </Text>
                                    {collectionType === 'album' && (
                                        <Text className="text-gray-500 text-xs mt-2 text-center px-8">
                                            Bạn vẫn có thể tạo album trống và thêm bài sau
                                        </Text>
                                    )}
                                </View>
                            )}
                            {filteredSongs.map(song => {
                                const selected = selectedSongIds.includes(song._id);
                                const artistNames = song.artist_ids?.map((a: any) => a.name).join(', ') || '';
                                const coverUrl = formatImg(song.cover_image);
                                return (
                                    <TouchableOpacity
                                        key={song._id}
                                        onPress={() => toggleSong(song._id)}
                                        activeOpacity={0.7}
                                        className={`flex-row items-center p-3 rounded-xl mb-2 border ${selected
                                            ? 'border-pink-500/50'
                                            : 'border-white/10'
                                            }`}
                                        style={{
                                            backgroundColor: selected
                                                ? 'rgba(236,72,153,0.15)'
                                                : 'rgba(255,255,255,0.05)',
                                        }}
                                    >
                                        {/* Cover */}
                                        {coverUrl ? (
                                            <Image source={{ uri: coverUrl }} className="w-12 h-12 rounded-lg" />
                                        ) : (
                                            <View className="w-12 h-12 rounded-lg bg-gray-700 items-center justify-center">
                                                <Ionicons name="musical-note" size={20} color="gray" />
                                            </View>
                                        )}

                                        {/* Info */}
                                        <View className="flex-1 ml-3">
                                            <Text
                                                className={`font-semibold ${selected ? 'text-pink-300' : 'text-white'}`}
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

                                        <Text className="text-gray-500 text-xs mr-3">
                                            {formatDuration(song.duration)}
                                        </Text>

                                        {/* Checkbox */}
                                        <View
                                            className={`w-6 h-6 rounded-full border-2 items-center justify-center ${selected
                                                ? 'bg-pink-500 border-pink-500'
                                                : 'border-gray-600'
                                                }`}
                                        >
                                            {selected && <Ionicons name="checkmark" size={14} color="white" />}
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                            <View className="h-28" />
                        </ScrollView>
                    )}

                    {/* Bottom action */}
                    <Animated.View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: theme.animCard, borderTopWidth: 1, borderTopColor: theme.bgCardBorder, paddingHorizontal: 20, paddingVertical: 16 }}>
                        <TouchableOpacity
                            onPress={handleCreate}
                            disabled={isCreating}
                            className={`py-4 rounded-xl items-center ${isCreating ? 'bg-gray-700' : collectionType === 'album' ? 'bg-pink-600' : 'bg-purple-700'}`}
                            activeOpacity={0.8}
                        >
                            {isCreating ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <View className="flex-row items-center">
                                    <Ionicons name="checkmark-circle" size={22} color="white" />
                                    <Text className="text-white font-bold text-lg ml-2">
                                        Tạo {collectionType === 'album' ? 'Album' : 'Playlist'}
                                        {selectedSongIds.length > 0 ? ` (${selectedSongIds.length} bài)` : ''}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            )}
        </SafeAreaView>
        </Animated.View>
    );
}
