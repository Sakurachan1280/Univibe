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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import axiosClient from '../../API/axiosClient';

interface Song {
    _id: string;
    title: string;
    duration: number;
    file_url: string;
    cover_image: string;
    artist_ids: any[];
    genres: string[];
}

export default function SongManagementScreen() {
    const navigation = useNavigation();
    const [songs, setSongs] = useState<Song[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedSong, setSelectedSong] = useState<Song | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDuration, setEditDuration] = useState('');
    const [editGenres, setEditGenres] = useState('');
    const [editCover, setEditCover] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchSongs();
    }, []);

    const fetchSongs = async () => {
        try {
            setIsLoading(true);
            const response = await axiosClient.get('/music/queue?type=new');
            setSongs(response.data);
        } catch (error) {
            console.error('Error fetching songs:', error);
            Alert.alert('Error', 'Failed to load songs');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (song: Song) => {
        setSelectedSong(song);
        setEditTitle(song.title);
        setEditDuration(song.duration?.toString() || '300');
        setEditGenres(song.genres?.join(', ') || '');
        setEditCover(null);
        setEditModalVisible(true);
    };

    const handleDelete = (song: Song) => {
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
                            await axiosClient.delete(`/music/songs/${song._id}`);
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

            await axiosClient.put(`/music/songs/${selectedSong?._id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

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

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <SafeAreaView className="flex-1 bg-black">
            <View className="flex-row items-center px-4 py-2 border-b border-white/10">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-lg font-bold ml-4">Quản Lý Bài Hát</Text>
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
                                className="bg-white/5 rounded-2xl p-4 mb-3 border border-white/10"
                            >
                                <View className="flex-row items-center">
                                    {song.cover_image ? (
                                        <Image
                                            source={{ uri: `http://192.168.1.27:5000${song.cover_image}` }}
                                            className="w-16 h-16 rounded-xl"
                                        />
                                    ) : (
                                        <View className="w-16 h-16 rounded-xl bg-gray-700 items-center justify-center">
                                            <Ionicons name="musical-note" size={32} color="gray" />
                                        </View>
                                    )}

                                    <View className="flex-1 ml-4">
                                        <Text className="text-white text-lg font-bold" numberOfLines={1}>
                                            {song.title}
                                        </Text>
                                        <Text className="text-gray-400 text-sm mt-1">
                                            {formatDuration(song.duration || 0)}
                                        </Text>
                                        {song.genres && song.genres.length > 0 && (
                                            <Text className="text-gray-500 text-xs mt-1" numberOfLines={1}>
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
                <View className="flex-1 bg-black/80 justify-end">
                    <View className="bg-gray-900 rounded-t-3xl p-6" style={{ maxHeight: '80%' }}>
                        <View className="flex-row items-center justify-between mb-6">
                            <Text className="text-white text-xl font-bold">Chỉnh Sửa Bài Hát</Text>
                            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                                <Ionicons name="close" size={28} color="white" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView>
                            {/* Cover */}
                            <View className="items-center mb-6">
                                <TouchableOpacity onPress={pickCover}>
                                    <View className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-pink-500">
                                        {editCover ? (
                                            <Image source={{ uri: editCover }} className="w-full h-full" />
                                        ) : selectedSong?.cover_image ? (
                                            <Image
                                                source={{ uri: `http://192.168.1.27:5000${selectedSong.cover_image}` }}
                                                className="w-full h-full"
                                            />
                                        ) : (
                                            <View className="w-full h-full bg-gray-700 items-center justify-center">
                                                <Ionicons name="image" size={40} color="gray" />
                                            </View>
                                        )}
                                    </View>
                                </TouchableOpacity>
                                <Text className="text-gray-400 text-sm mt-2">Nhấn để thay đổi ảnh bìa</Text>
                            </View>

                            {/* Title */}
                            <View className="mb-4">
                                <Text className="text-gray-400 text-sm mb-2">Tên Bài Hát *</Text>
                                <TextInput
                                    value={editTitle}
                                    onChangeText={setEditTitle}
                                    placeholder="Nhập tên bài hát"
                                    placeholderTextColor="#666"
                                    className="bg-white/10 text-white p-4 rounded-xl border border-white/10"
                                />
                            </View>

                            {/* Duration */}
                            <View className="mb-4">
                                <Text className="text-gray-400 text-sm mb-2">Thời lượng (giây)</Text>
                                <TextInput
                                    value={editDuration}
                                    onChangeText={setEditDuration}
                                    placeholder="300"
                                    placeholderTextColor="#666"
                                    keyboardType="numeric"
                                    className="bg-white/10 text-white p-4 rounded-xl border border-white/10"
                                />
                            </View>

                            {/* Genres */}
                            <View className="mb-6">
                                <Text className="text-gray-400 text-sm mb-2">Thể loại (phân cách bằng dấu phẩy)</Text>
                                <TextInput
                                    value={editGenres}
                                    onChangeText={setEditGenres}
                                    placeholder="Pop, Rock, Jazz"
                                    placeholderTextColor="#666"
                                    className="bg-white/10 text-white p-4 rounded-xl border border-white/10"
                                />
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
                                    <Text className="text-white font-bold text-lg">Lưu Thay Đổi</Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setEditModalVisible(false)}
                                className="py-4 rounded-xl items-center bg-white/10"
                            >
                                <Text className="text-white font-semibold">Hủy</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
