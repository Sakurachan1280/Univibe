import React, { useState, useEffect } from 'react';
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
    Animated,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { BASE_URL } from '../../API/axiosClient';
import { getAllSongs, deleteSong, updateSong } from '../../API/songAPI';
import { getAllArtists } from '../../API/artistAPI';
import { useAdminTheme } from '../../context/AdminThemeContext';

// Local interface for admin song management - matches server response structure
interface AdminSong {
    _id: string;
    title: string;
    duration: number | string;
    file_url: string;
    cover_image: string;
    artist_ids: any[];
    genres: string[];
}

export default function SongManagementScreen() {
    const navigation = useNavigation();
    const theme = useAdminTheme();
    const [songs, setSongs] = useState<AdminSong[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedSong, setSelectedSong] = useState<AdminSong | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDuration, setEditDuration] = useState('');
    const [editGenres, setEditGenres] = useState('');
    const [editCover, setEditCover] = useState<string | null>(null);
    const [editArtistIds, setEditArtistIds] = useState<string[]>([]);
    const [allArtists, setAllArtists] = useState<any[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchSongs();
        // Fetch danh sách ca sĩ một lần khi mount
        getAllArtists().then(setAllArtists).catch(console.error);
    }, []);


    const fetchSongs = async () => {
        try {
            setIsLoading(true);
            const songsData = await getAllSongs(); // Lấy toàn bộ, không giới hạn
            setSongs(songsData as any);
        } catch (error) {
            console.error('Error fetching songs:', error);
            Alert.alert('Error', 'Failed to load songs');
        } finally {
            setIsLoading(false);
        }
    };


    const handleEdit = (song: AdminSong) => {
        setSelectedSong(song);
        setEditTitle(song.title);
        setEditDuration(song.duration?.toString() || '200');
        setEditGenres(song.genres?.join(', ') || '');
        setEditCover(null);
        // Pre-select ca sĩ hiện tại của bài hát
        const currentArtistIds = song.artist_ids?.map((a: any) => a._id || a) || [];
        setEditArtistIds(currentArtistIds);
        setEditModalVisible(true);
    };


    const handleDelete = (song: AdminSong) => {
        Alert.alert(
            'Xóa Bài Hát',
            `Bạn có chắc muốn xóa "${song.title}"?`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteSong(song._id);
                            Alert.alert('Success', 'Đã xóa bài hát');
                            fetchSongs();
                        } catch (error: any) {
                            console.error('Delete error:', error);
                            Alert.alert('Error', error.response?.data?.message || 'Failed to delete song');
                        }
                    },
                },
            ]
        );
    };

    const pickCover = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Camera roll permissions required');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setEditCover(result.assets[0].uri);
        }
    };

    const handleSaveEdit = async () => {
        if (!editTitle.trim()) {
            Alert.alert('Error', 'Please enter song title');
            return;
        }

        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append('title', editTitle);
            formData.append('duration', editDuration);

            if (editGenres.trim()) {
                const genresArray = editGenres.split(',').map(g => g.trim()).filter(g => g);
                genresArray.forEach(genre => {
                    formData.append('genres[]', genre);
                });
            }

            // Gửi artist_ids
            formData.append('artist_ids', editArtistIds.join(','));

            if (editCover) {
                const filename = editCover.split('/').pop() || 'cover.jpg';
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : 'image/jpeg';

                // @ts-ignore
                formData.append('cover', {
                    uri: editCover,
                    name: filename,
                    type,
                });
            }

            await updateSong(selectedSong?._id!, formData);

            Alert.alert('Success', 'Đã cập nhật bài hát');
            setEditModalVisible(false);
            fetchSongs();
        } catch (error: any) {
            console.error('Update error:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to update song');
        } finally {
            setIsSaving(false);
        }
    };

    const formatDuration = (seconds: number | string) => {
        const secs = typeof seconds === 'string' ? parseInt(seconds) : seconds;
        const mins = Math.floor(secs / 60);
        const remainder = secs % 60;
        return `${mins}:${remainder.toString().padStart(2, '0')}`;
    };

    return (
        <Animated.View style={{ flex: 1, backgroundColor: theme.animBg }}>
        <SafeAreaView style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: theme.bgCardBorder }}>
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
                    <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
                </TouchableOpacity>
                <Text style={{ color: theme.textPrimary, fontSize: 18, fontWeight: 'bold', marginLeft: 16 }}>Quản Lý Bài Hát</Text>
            </View>

            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#EC4899" />
                </View>
            ) : (
                <ScrollView className="flex-1 px-5 pt-4">
                    {songs.length === 0 ? (
                        <View className="items-center justify-center py-20">
                            <Ionicons name="musical-notes-outline" size={64} color="#666" />
                            <Text className="text-gray-400 text-center mt-4">Chưa có bài hát nào</Text>
                        </View>
                    ) : (
                        songs.map((song) => (
                            <View
                                key={song._id}
                                style={{ backgroundColor: theme.bgInput, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: theme.bgCardBorder }}
                            >
                                <View className="flex-row items-center">
                                    {song.cover_image ? (
                                        <Image
                                            source={{
                                                uri: song.cover_image.startsWith('http')
                                                    ? song.cover_image
                                                    : `${BASE_URL}${song.cover_image}`
                                            }}
                                            className="w-16 h-16 rounded-lg"
                                        />
                                    ) : (
                                        <View className="w-16 h-16 rounded-xl bg-gray-700 items-center justify-center">
                                            <Ionicons name="musical-note" size={32} color="gray" />
                                        </View>
                                    )}

                                    <View className="flex-1 ml-4">
                                        <Text style={{ color: theme.textPrimary, fontSize: 18, fontWeight: 'bold' }} numberOfLines={1}>
                                            {song.title}
                                        </Text>
                                        <Text style={{ color: theme.textSecondary, fontSize: 14, marginTop: 4 }}>
                                            {formatDuration(song.duration || 0)}
                                        </Text>
                                        {song.genres && song.genres.length > 0 && (
                                            <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 4, opacity: 0.7 }} numberOfLines={1}>
                                                {song.genres.join(', ')}
                                            </Text>
                                        )}
                                    </View>

                                    <View className="flex-row">
                                        <TouchableOpacity
                                            onPress={() => handleEdit(song)}
                                            className="bg-cyan-600/20 rounded-full p-2 mr-2"
                                        >
                                            <Ionicons name="create-outline" size={20} color="#06B6D4" />
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            onPress={() => handleDelete(song)}
                                            className="bg-red-600/20 rounded-full p-2"
                                        >
                                            <Ionicons name="trash-outline" size={20} color="#EF4444" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        ))
                    )}
                </ScrollView>
            )}

            {/* Edit Modal */}
            <Modal
                visible={editModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setEditModalVisible(false)}
            >
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' }}>
                        <View style={{
                            borderTopLeftRadius: 24,
                            borderTopRightRadius: 24,
                            padding: 24,
                            maxHeight: '90%',
                            borderTopWidth: 1,
                            borderColor: theme.bgCardBorder,
                            backgroundColor: theme.isDark ? '#1C1C1E' : '#FFFFFF',
                        }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                                <Text style={{ color: theme.textPrimary, fontSize: 20, fontWeight: 'bold' }}>Chỉnh Sửa Bài Hát</Text>
                                <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                                    <Ionicons name="close" size={28} color={theme.textPrimary} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                                {/* Cover */}
                                <View className="items-center mb-6">
                                    <TouchableOpacity onPress={pickCover}>
                                        <View className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-pink-500">
                                            {editCover ? (
                                                <Image source={{ uri: editCover }} className="w-full h-full" />
                                            ) : selectedSong?.cover_image ? (
                                                <Image
                                                    source={{
                                                        uri: selectedSong.cover_image.startsWith('http')
                                                            ? selectedSong.cover_image
                                                            : `${BASE_URL}${selectedSong.cover_image}`
                                                    }}
                                                    className="w-full h-full"
                                                />
                                            ) : (
                                                <View className="w-full h-full bg-gray-700 items-center justify-center">
                                                    <Ionicons name="image" size={40} color="gray" />
                                                </View>
                                            )}
                                        </View>
                                    </TouchableOpacity>
                                    <Text style={{ color: theme.textSecondary, fontSize: 14, marginTop: 8 }}>Nhấn để thay đổi ảnh bìa</Text>
                                </View>

                                {/* Title */}
                                <View className="mb-4">
                                    <Text style={{ color: theme.textSecondary, fontSize: 14, marginBottom: 8 }}>Tên Bài Hát *</Text>
                                    <TextInput
                                        value={editTitle}
                                        onChangeText={setEditTitle}
                                        placeholder="Nhập tên bài hát"
                                        placeholderTextColor={theme.textSecondary}
                                        style={{ color: theme.textPrimary, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: theme.bgCardBorder, backgroundColor: theme.bgInput }}
                                    />
                                </View>

                                {/* Duration */}
                                <View className="mb-4">
                                    <Text style={{ color: theme.textSecondary, fontSize: 14, marginBottom: 8 }}>Thời lượng (giây)</Text>
                                    <TextInput
                                        value={editDuration}
                                        onChangeText={setEditDuration}
                                        placeholder="300"
                                        placeholderTextColor={theme.textSecondary}
                                        keyboardType="numeric"
                                        style={{ color: theme.textPrimary, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: theme.bgCardBorder, backgroundColor: theme.bgInput }}
                                    />
                                </View>

                                {/* Genres */}
                                <View className="mb-4">
                                    <Text style={{ color: theme.textSecondary, fontSize: 14, marginBottom: 8 }}>Thể loại (phân cách bằng dấu phẩy)</Text>
                                    <TextInput
                                        value={editGenres}
                                        onChangeText={setEditGenres}
                                        placeholder="Pop, Rock, Jazz"
                                        placeholderTextColor={theme.textSecondary}
                                        style={{ color: theme.textPrimary, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: theme.bgCardBorder, backgroundColor: theme.bgInput }}
                                    />
                                </View>

                                {/* Artists */}
                                <View className="mb-6">
                                    <Text style={{ color: theme.textSecondary, fontSize: 14, marginBottom: 8 }}>Ca Sĩ *</Text>
                                    <View style={{ backgroundColor: theme.bgInput, borderRadius: 12, borderWidth: 1, borderColor: theme.bgCardBorder, padding: 8, maxHeight: 220 }}>
                                        <ScrollView nestedScrollEnabled showsVerticalScrollIndicator>
                                            {allArtists.map((artist) => {
                                                const selected = editArtistIds.includes(artist._id);
                                                return (
                                                    <TouchableOpacity
                                                        key={artist._id}
                                                        onPress={() => {
                                                            setEditArtistIds(prev =>
                                                                selected
                                                                    ? prev.filter(id => id !== artist._id)
                                                                    : [...prev, artist._id]
                                                            );
                                                        }}
                                                        className={`flex-row items-center p-3 rounded-lg mb-1 ${selected ? 'bg-pink-600/30' : 'bg-transparent'}`}
                                                    >
                                                        {artist.avatar ? (
                                                            <Image
                                                                source={{ uri: artist.avatar.startsWith('http') ? artist.avatar : `${BASE_URL}${artist.avatar}` }}
                                                                className="w-9 h-9 rounded-full"
                                                            />
                                                        ) : (
                                                            <View className="w-9 h-9 rounded-full bg-gray-700 items-center justify-center">
                                                                <Ionicons name="person" size={18} color="gray" />
                                                            </View>
                                                        )}
                                                        <Text style={{ color: theme.textPrimary, marginLeft: 12, flex: 1 }} numberOfLines={1}>{artist.name}</Text>
                                                        {selected && <Ionicons name="checkmark-circle" size={22} color="#EC4899" />}
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </ScrollView>
                                    </View>
                                </View>

                                {/* Buttons */}
                                <TouchableOpacity
                                    onPress={handleSaveEdit}
                                    disabled={isSaving}
                                    className={`py-4 rounded-xl items-center mb-3 ${isSaving ? 'bg-gray-700' : 'bg-pink-600'
                                        }`}
                                >
                                    {isSaving ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 18 }}>Lưu Thay Đổi</Text>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => setEditModalVisible(false)}
                                    style={{ paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 8, backgroundColor: theme.bgCardBorder }}
                                >
                                    <Text style={{ color: theme.textPrimary, fontWeight: '600' }}>Hủy</Text>
                                </TouchableOpacity>
                            </ScrollView>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
        </Animated.View>
    );
}
