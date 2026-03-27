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
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

import { BASE_URL } from '../../API/axiosClient';
import { getAllArtists, deleteArtist, updateArtist, Artist } from '../../API/artistAPI';
import { useAdminTheme } from '../../context/AdminThemeContext';
import { Animated } from 'react-native';

export default function ArtistManagementScreen() {
    const navigation = useNavigation();
    const theme = useAdminTheme();
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
            const artistsData = await getAllArtists();
            setArtists(artistsData);
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
                            await deleteArtist(artist._id);
                            Alert.alert('Success', 'Đã xóa nghệ sĩ');
                            fetchArtists();
                        } catch (error: any) {
                            console.error('Delete error:', error);
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

            await updateArtist(selectedArtist?._id!, formData);

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
        <Animated.View style={{ flex: 1, backgroundColor: theme.animBg }}>
        <SafeAreaView style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.bgCardBorder }}>
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
                    <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
                </TouchableOpacity>
                <Text style={{ color: theme.textPrimary, fontSize: 18, fontWeight: 'bold', marginLeft: 16 }}>Quản Lý Nghệ Sĩ</Text>
            </View>

            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#EC4899" />
                </View>
            ) : (
                <ScrollView className="flex-1 px-5 pt-4">
                    {artists.length === 0 ? (
                        <View className="items-center justify-center py-20">
                            <Ionicons name="people-outline" size={64} color={theme.textSecondary} />
                            <Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 16 }}>Chưa có nghệ sĩ nào</Text>
                        </View>
                    ) : (
                        artists.map((artist) => (
                            <View
                                key={artist._id}
                                style={{ backgroundColor: theme.bgInput, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: theme.bgCardBorder }}
                            >
                                <View className="flex-row items-center">
                                    {artist.avatar ? (
                                        <Image
                                            source={{
                                                uri: artist.avatar.startsWith('http')
                                                    ? artist.avatar
                                                    : `${BASE_URL}${artist.avatar}`
                                            }}
                                            className="w-16 h-16 rounded-full"
                                        />
                                    ) : (
                                        <View className="w-16 h-16 rounded-full bg-gray-700 items-center justify-center">
                                            <Ionicons name="person" size={32} color="gray" />
                                        </View>
                                    )}

                                    <View className="flex-1 ml-4">
                                        <Text style={{ color: theme.textPrimary, fontSize: 16, fontWeight: 'bold' }}>{artist.name}</Text>
                                        {artist.bio && (
                                            <Text style={{ color: theme.textSecondary, fontSize: 14, marginTop: 4 }} numberOfLines={2}>
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
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.8)' }}
                >
                    <Animated.View style={{ backgroundColor: theme.animCard, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%', borderTopWidth: 1, borderColor: theme.bgCardBorder }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                            <Text style={{ color: theme.textPrimary, fontSize: 20, fontWeight: 'bold' }}>Chỉnh Sửa Nghệ Sĩ</Text>
                            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                                <Ionicons name="close" size={28} color={theme.textPrimary} />
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
                                                source={{
                                                    uri: selectedArtist.avatar.startsWith('http')
                                                        ? selectedArtist.avatar
                                                        : `${BASE_URL}${selectedArtist.avatar}`
                                                }}
                                                className="w-full h-full"
                                            />
                                        ) : (
                                            <View className="w-full h-full bg-gray-700 items-center justify-center">
                                                <Ionicons name="camera" size={32} color="gray" />
                                            </View>
                                        )}
                                    </View>
                                </TouchableOpacity>
                                <Text style={{ color: theme.textSecondary, fontSize: 14, marginTop: 8 }}>Nhấn để thay đổi ảnh</Text>
                            </View>

                            {/* Name */}
                            <View className="mb-4">
                                <Text style={{ color: theme.textSecondary, fontSize: 14, marginBottom: 8 }}>Tên Nghệ Sĩ *</Text>
                                <TextInput
                                    value={editName}
                                    onChangeText={setEditName}
                                    placeholder="Nhập tên nghệ sĩ"
                                    placeholderTextColor={theme.textSecondary}
                                    style={{ color: theme.textPrimary, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: theme.bgCardBorder, backgroundColor: theme.bgInput }}
                                />
                            </View>

                            {/* Bio */}
                            <View className="mb-6">
                                <Text style={{ color: theme.textSecondary, fontSize: 14, marginBottom: 8 }}>Tiểu Sử</Text>
                                <TextInput
                                    value={editBio}
                                    onChangeText={setEditBio}
                                    placeholder="Nhập tiểu sử"
                                    placeholderTextColor={theme.textSecondary}
                                    multiline
                                    textAlignVertical="top"
                                    style={{ color: theme.textPrimary, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: theme.bgCardBorder, backgroundColor: theme.bgInput, height: 96 }}
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
                                    <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 18 }}>Lưu Thay Đổi</Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setEditModalVisible(false)}
                                style={{ paddingVertical: 16, borderRadius: 12, alignItems: 'center', backgroundColor: theme.bgCardBorder }}
                            >
                                <Text style={{ color: theme.textPrimary, fontWeight: '600' }}>Hủy</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </Animated.View>

                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
        </Animated.View>
    );
}
