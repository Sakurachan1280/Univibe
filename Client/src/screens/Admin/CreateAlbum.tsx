import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

import { createAdminAlbum, addSongToAlbum, Playlist } from '../../API/playlistAPI';
import { getAllSongs } from '../../API/songAPI';
import { Song } from '../../API/songAPI';
import { BASE_URL } from '../../API/axiosClient';

export default function CreateAlbumScreen() {
    const navigation = useNavigation();

    // Step state: 1 = info, 2 = pick songs
    const [step, setStep] = useState<1 | 2>(1);

    // Album info
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState('');
    const [coverUri, setCoverUri] = useState<string | null>(null);

    // Songs
    const [allSongs, setAllSongs] = useState<Song[]>([]);
    const [selectedSongIds, setSelectedSongIds] = useState<string[]>([]);
    const [searchText, setSearchText] = useState('');
    const [isSongsLoading, setIsSongsLoading] = useState(false);

    const [isCreating, setIsCreating] = useState(false);

    const fetchSongs = async () => {
        setIsSongsLoading(true);
        try {
            const data = await getAllSongs();
            setAllSongs(data);
        } catch (e) {
            Alert.alert('Lỗi', 'Không thể tải danh sách bài hát');
        } finally {
            setIsSongsLoading(false);
        }
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
            quality: 0.8,
        });
        if (!result.canceled) {
            setCoverUri(result.assets[0].uri);
        }
    };

    const goToStep2 = () => {
        if (!name.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập tên album');
            return;
        }
        setStep(2);
        if (allSongs.length === 0) fetchSongs();
    };

    const toggleSong = (id: string) => {
        setSelectedSongIds(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const handleCreate = async () => {
        if (!name.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập tên album');
            return;
        }

        setIsCreating(true);
        try {
            const tagsArray = tags
                .split(',')
                .map(t => t.trim())
                .filter(t => t.length > 0);

            // 1. Tạo album (playlist type=system_mix)
            const album: Playlist = await createAdminAlbum(
                name.trim(),
                description.trim() || undefined,
                tagsArray,
                coverUri ?? undefined
            );

            // 2. Thêm từng bài hát nếu có
            if (selectedSongIds.length > 0) {
                await Promise.all(
                    selectedSongIds.map(songId => addSongToAlbum(album._id, songId))
                );
            }

            Alert.alert('Thành công', `Đã tạo album "${album.name}" với ${selectedSongIds.length} bài hát`, [
                {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                },
            ]);
        } catch (error: any) {
            console.error('Create album error:', error);
            Alert.alert('Lỗi', error?.response?.data?.message || 'Không thể tạo album');
        } finally {
            setIsCreating(false);
        }
    };

    const filteredSongs = allSongs.filter(s =>
        s.title.toLowerCase().includes(searchText.toLowerCase())
    );

    const formatDuration = (seconds: number | string | undefined) => {
        if (!seconds) return '0:00';
        const secs = typeof seconds === 'string' ? parseInt(seconds) : seconds;
        const mins = Math.floor(secs / 60);
        const rem = secs % 60;
        return `${mins}:${rem.toString().padStart(2, '0')}`;
    };

    return (
        <SafeAreaView className="flex-1 bg-black">

            {/* Header */}
            <View className="flex-row items-center px-4 py-3 border-b border-white/10">
                <TouchableOpacity
                    onPress={() => (step === 2 ? setStep(1) : navigation.goBack())}
                    className="p-2 mr-2"
                >
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <View className="flex-1">
                    <Text className="text-white text-xl font-bold">Tạo Album Mới</Text>
                    <Text className="text-gray-400 text-xs">
                        Bước {step}/2 · {step === 1 ? 'Thông tin album' : 'Chọn bài hát'}
                    </Text>
                </View>

                {/* Step indicator */}
                <View className="flex-row items-center">
                    <View className={`w-3 h-3 rounded-full mr-1 ${step >= 1 ? 'bg-pink-500' : 'bg-gray-600'}`} />
                    <View className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-pink-500' : 'bg-gray-600'}`} />
                </View>
            </View>

            {/* ── STEP 1: Album Info ── */}
            {step === 1 && (
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1"
                >
                    <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>

                        {/* Cover picker */}
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

                        {/* Name */}
                        <View className="mb-4">
                            <Text className="text-gray-400 text-sm mb-2">
                                Tên Album <Text className="text-pink-500">*</Text>
                            </Text>
                            <TextInput
                                value={name}
                                onChangeText={setName}
                                placeholder="Nhập tên album"
                                placeholderTextColor="#555"
                                className="bg-white/8 text-white p-4 rounded-xl border border-white/10"
                                style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
                            />
                        </View>

                        {/* Description */}
                        <View className="mb-4">
                            <Text className="text-gray-400 text-sm mb-2">Mô Tả</Text>
                            <TextInput
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Nhập mô tả album (tuỳ chọn)"
                                placeholderTextColor="#555"
                                multiline
                                textAlignVertical="top"
                                className="text-white p-4 rounded-xl border border-white/10 h-24"
                                style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
                            />
                        </View>

                        {/* Tags */}
                        <View className="mb-8">
                            <Text className="text-gray-400 text-sm mb-2">
                                Tags <Text className="text-gray-500">(phân cách bằng dấu phẩy)</Text>
                            </Text>
                            <TextInput
                                value={tags}
                                onChangeText={setTags}
                                placeholder="Pop, Ballad, V-Pop"
                                placeholderTextColor="#555"
                                className="text-white p-4 rounded-xl border border-white/10"
                                style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
                            />
                        </View>

                        {/* Admin notice */}
                        <View className="bg-pink-600/10 border border-pink-600/30 rounded-xl p-4 mb-6">
                            <View className="flex-row items-center">
                                <Ionicons name="shield-checkmark" size={20} color="#EC4899" />
                                <Text className="text-pink-400 font-semibold ml-2">Album Hệ Thống</Text>
                            </View>
                            <Text className="text-gray-400 text-sm mt-2">
                                Album này được tạo bởi Admin và sẽ hiển thị công khai. Người dùng thông thường không thể chỉnh sửa hoặc xóa album này.
                            </Text>
                        </View>

                        {/* Next button */}
                        <TouchableOpacity
                            onPress={goToStep2}
                            className="bg-pink-600 py-4 rounded-xl items-center mb-8"
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

            {/* ── STEP 2: Pick Songs ── */}
            {step === 2 && (
                <View className="flex-1">
                    {/* Summary bar */}
                    <View className="px-5 py-3 bg-white/5 border-b border-white/10">
                        <Text className="text-white font-semibold">{name}</Text>
                        <Text className="text-gray-400 text-sm">
                            {selectedSongIds.length > 0
                                ? `${selectedSongIds.length} bài đã chọn`
                                : 'Chưa chọn bài hát nào (tuỳ chọn)'}
                        </Text>
                    </View>

                    {/* Search */}
                    <View className="px-5 py-3">
                        <View className="flex-row items-center bg-white/8 rounded-xl px-4 py-2.5"
                            style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
                            <Ionicons name="search" size={18} color="#666" />
                            <TextInput
                                value={searchText}
                                onChangeText={setSearchText}
                                placeholder="Tìm bài hát..."
                                placeholderTextColor="#555"
                                className="flex-1 text-white ml-2"
                            />
                            {searchText.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchText('')}>
                                    <Ionicons name="close-circle" size={18} color="#666" />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {isSongsLoading ? (
                        <View className="flex-1 items-center justify-center">
                            <ActivityIndicator size="large" color="#EC4899" />
                        </View>
                    ) : (
                        <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
                            {filteredSongs.map(song => {
                                const selected = selectedSongIds.includes(song._id);
                                const artistNames = song.artist_ids?.map(a => a.name).join(', ') || '';
                                const coverUrl = song.cover_image
                                    ? (song.cover_image.startsWith('http')
                                        ? song.cover_image
                                        : `${BASE_URL}${song.cover_image}`)
                                    : null;

                                return (
                                    <TouchableOpacity
                                        key={song._id}
                                        onPress={() => toggleSong(song._id)}
                                        activeOpacity={0.7}
                                        className={`flex-row items-center p-3 rounded-xl mb-2 border ${selected
                                            ? 'bg-pink-600/20 border-pink-500/50'
                                            : 'bg-white/5 border-white/10'}`}
                                    >
                                        {/* Cover */}
                                        {coverUrl ? (
                                            <Image
                                                source={{ uri: coverUrl }}
                                                className="w-12 h-12 rounded-lg"
                                            />
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
                                                : 'border-gray-600'}`}
                                        >
                                            {selected && (
                                                <Ionicons name="checkmark" size={14} color="white" />
                                            )}
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                            <View className="h-28" />
                        </ScrollView>
                    )}

                    {/* Bottom action bar */}
                    <View className="absolute bottom-0 left-0 right-0 bg-gray-900 border-t border-white/10 px-5 py-4">
                        <TouchableOpacity
                            onPress={handleCreate}
                            disabled={isCreating}
                            className={`py-4 rounded-xl items-center ${isCreating ? 'bg-gray-700' : 'bg-pink-600'}`}
                            activeOpacity={0.8}
                        >
                            {isCreating ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <View className="flex-row items-center">
                                    <Ionicons name="checkmark-circle" size={22} color="white" />
                                    <Text className="text-white font-bold text-lg ml-2">
                                        Tạo Album{selectedSongIds.length > 0 ? ` (${selectedSongIds.length} bài)` : ''}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
}
