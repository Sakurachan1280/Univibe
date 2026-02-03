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
import axiosClient from '../../API/axiosClient';

interface Artist {
    _id: string;
    name: string;
    bio: string;
    avatar: string;
}

export default function ArtistManagementScreen() {
    const navigation = useNavigation();
    const [artists, setArtists] = useState<Artist[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
    const [editName, setEditName] = useState('');
    const [editBio, setEditBio] = useState('');
    const [editAvatar, setEditAvatar] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchArtists();
    }, []);

    const fetchArtists = async () => {
        try {
            setIsLoading(true);
            const response = await axiosClient.get('/music/artists');
            setArtists(response.data);
        } catch (error) {
            console.error('Error fetching artists:', error);
            Alert.alert('Error', 'Failed to load artists');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (artist: Artist) => {
        setSelectedArtist(artist);
        setEditName(artist.name);
        setEditBio(artist.bio || '');
        setEditAvatar(null);
        setEditModalVisible(true);
    };

    const handleDelete = (artist: Artist) => {
        Alert.alert(
            'Xóa Nghệ Sĩ',
            `Bạn có chắc muốn xóa "${artist.name}"?`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            console.log('Deleting artist:', artist._id);
                            const response = await axiosClient.delete(`/music/artists/${artist._id}`);
                            console.log('Delete response:', response.data);
                            Alert.alert('Success', 'Đã xóa nghệ sĩ');
                            fetchArtists();
                        } catch (error: any) {
                            console.error('Delete error:', error);
                            console.error('Error response:', error.response?.data);
                            Alert.alert('Error', error.response?.data?.message || 'Failed to delete artist');
                        }
                    },
                },
            ]
        );
    };

    const pickImage = async () => {
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
            setEditAvatar(result.assets[0].uri);
        }
    };

    const handleSaveEdit = async () => {
        if (!editName.trim()) {
            Alert.alert('Error', 'Please enter artist name');
            return;
        }

        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append('name', editName);
            formData.append('bio', editBio);

            if (editAvatar) {
                const filename = editAvatar.split('/').pop() || 'avatar.jpg';
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : 'image/jpeg';

                // @ts-ignore
                formData.append('avatar', {
                    uri: editAvatar,
                    name: filename,
                    type,
                });
            }

            await axiosClient.put(`/music/artists/${selectedArtist?._id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            Alert.alert('Success', 'Đã cập nhật nghệ sĩ');
            setEditModalVisible(false);
            fetchArtists();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to update artist');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-black">
            <View className="flex-row items-center px-4 py-2 border-b border-white/10">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-lg font-bold ml-4">Quản Lý Nghệ Sĩ</Text>
            </View>

            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#EC4899" />
                </View>
            ) : (
                <ScrollView className="flex-1 px-5 pt-4">
                    {artists.length === 0 ? (
                        <View className="items-center justify-center py-20">
                            <Ionicons name="people-outline" size={64} color="#666" />
                            <Text className="text-gray-400 text-center mt-4">Chưa có nghệ sĩ nào</Text>
                        </View>
                    ) : (
                        artists.map((artist) => (
                            <View
                                key={artist._id}
                                className="bg-white/5 rounded-2xl p-4 mb-3 border border-white/10"
                            >
                                <View className="flex-row items-center">
                                    {artist.avatar ? (
                                        <Image
                                            source={{ uri: `http://192.168.1.27:5000${artist.avatar}` }}
                                            className="w-16 h-16 rounded-full"
                                        />
                                    ) : (
                                        <View className="w-16 h-16 rounded-full bg-gray-700 items-center justify-center">
                                            <Ionicons name="person" size={32} color="gray" />
                                        </View>
                                    )}

                                    <View className="flex-1 ml-4">
                                        <Text className="text-white text-lg font-bold">{artist.name}</Text>
                                        {artist.bio && (
                                            <Text className="text-gray-400 text-sm mt-1" numberOfLines={2}>
                                                {artist.bio}
                                            </Text>
                                        )}
                                    </View>

                                    <View className="flex-row">
                                        <TouchableOpacity
                                            onPress={() => handleEdit(artist)}
                                            className="bg-cyan-600/20 rounded-full p-2 mr-2"
                                        >
                                            <Ionicons name="create-outline" size={20} color="#06B6D4" />
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            onPress={() => handleDelete(artist)}
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
                            <Text className="text-white text-xl font-bold">Chỉnh Sửa Nghệ Sĩ</Text>
                            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                                <Ionicons name="close" size={28} color="white" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView>
                            {/* Avatar */}
                            <View className="items-center mb-6">
                                <TouchableOpacity onPress={pickImage}>
                                    <View className="w-24 h-24 rounded-full overflow-hidden border-2 border-pink-500">
                                        {editAvatar ? (
                                            <Image source={{ uri: editAvatar }} className="w-full h-full" />
                                        ) : selectedArtist?.avatar ? (
                                            <Image
                                                source={{ uri: `http://192.168.1.27:5000${selectedArtist.avatar}` }}
                                                className="w-full h-full"
                                            />
                                        ) : (
                                            <View className="w-full h-full bg-gray-700 items-center justify-center">
                                                <Ionicons name="camera" size={32} color="gray" />
                                            </View>
                                        )}
                                    </View>
                                </TouchableOpacity>
                                <Text className="text-gray-400 text-sm mt-2">Nhấn để thay đổi ảnh</Text>
                            </View>

                            {/* Name */}
                            <View className="mb-4">
                                <Text className="text-gray-400 text-sm mb-2">Tên Nghệ Sĩ *</Text>
                                <TextInput
                                    value={editName}
                                    onChangeText={setEditName}
                                    placeholder="Nhập tên nghệ sĩ"
                                    placeholderTextColor="#666"
                                    className="bg-white/10 text-white p-4 rounded-xl border border-white/10"
                                />
                            </View>

                            {/* Bio */}
                            <View className="mb-6">
                                <Text className="text-gray-400 text-sm mb-2">Tiểu Sử</Text>
                                <TextInput
                                    value={editBio}
                                    onChangeText={setEditBio}
                                    placeholder="Nhập tiểu sử"
                                    placeholderTextColor="#666"
                                    className="bg-white/10 text-white p-4 rounded-xl border border-white/10 h-24"
                                    multiline
                                    textAlignVertical="top"
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
