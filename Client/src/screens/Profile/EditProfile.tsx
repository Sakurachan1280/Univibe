import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    TextInput,
    Alert,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { BASE_URL } from '../../API/axiosClient';
import { getMeAPI, updateProfileAPI } from '../../API/userAPI';

export default function EditProfileScreen() {
    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // User data
    const [displayName, setDisplayName] = useState('');
    const [bio, setBio] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [coverUrl, setCoverUrl] = useState('');
    const [newAvatar, setNewAvatar] = useState<string | null>(null);
    const [newCover, setNewCover] = useState<string | null>(null);

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            setIsLoading(true);
            const userData = await getMeAPI();

            setDisplayName(userData.profile?.display_name || userData.username || '');
            setBio(userData.profile?.bio || '');
            setAvatarUrl(userData.profile?.avatar_url || '');
            setCoverUrl(userData.profile?.cover_url || '');
        } catch (error) {
            console.error('Error fetching profile:', error);
            Alert.alert('Error', 'Failed to load profile');
        } finally {
            setIsLoading(false);
        }
    };

    const pickImage = async (type: 'avatar' | 'cover') => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Camera roll permissions required');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: type === 'avatar' ? [1, 1] : [16, 9],
            quality: 0.8,
        });

        if (!result.canceled) {
            if (type === 'avatar') {
                setNewAvatar(result.assets[0].uri);
            } else {
                setNewCover(result.assets[0].uri);
            }
        }
    };

    const handleSave = async () => {
        if (!displayName.trim()) {
            Alert.alert('Error', 'Display name is required');
            return;
        }

        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append('display_name', displayName);
            formData.append('bio', bio);

            if (newAvatar) {
                const filename = newAvatar.split('/').pop() || 'avatar.jpg';
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : 'image/jpeg';

                // @ts-ignore
                formData.append('avatar', {
                    uri: newAvatar,
                    name: filename,
                    type,
                });
            }

            if (newCover) {
                const filename = newCover.split('/').pop() || 'cover.jpg';
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : 'image/jpeg';

                // @ts-ignore
                formData.append('cover', {
                    uri: newCover,
                    name: filename,
                    type,
                });
            }

            await updateProfileAPI(formData);

            Alert.alert('Success', 'Profile updated successfully');
            navigation.goBack();
        } catch (error: any) {
            console.error('Update error:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-black items-center justify-center">
                <ActivityIndicator size="large" color="#EC4899" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-black">
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-white/10">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
                    <Ionicons name="close" size={28} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-lg font-bold">Chỉnh sửa tài khoản</Text>
                <TouchableOpacity
                    onPress={handleSave}
                    disabled={isSaving}
                    className="px-4 py-2 bg-pink-600 rounded-full"
                >
                    {isSaving ? (
                        <ActivityIndicator size="small" color="white" />
                    ) : (
                        <Text className="text-white font-semibold">Lưu</Text>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1">
                {/* Cover Image */}
                <TouchableOpacity
                    onPress={() => pickImage('cover')}
                    className="relative h-48 bg-gray-800"
                    activeOpacity={0.8}
                >
                    {newCover || coverUrl ? (
                        <Image
                            source={{
                                uri: newCover || (
                                    coverUrl?.startsWith('http')
                                        ? coverUrl
                                        : coverUrl?.includes('spoti_images')
                                            ? coverUrl // Nếu đã là path của Cloudinary nhưng thiếu Domain
                                            : `${BASE_URL}${coverUrl?.startsWith('/uploads/') ? '' : '/uploads/'}${coverUrl?.replace(/^\/uploads\//, '')}`
                                )
                            }}
                            className="w-full h-full"
                        />
                    ) : (
                        <View className="w-full h-full items-center justify-center">
                            <Ionicons name="image-outline" size={48} color="#666" />
                        </View>
                    )}
                    <View className="absolute inset-0 bg-black/40 items-center justify-center">
                        <View className="bg-black/60 rounded-full p-3">
                            <Ionicons name="camera" size={24} color="white" />
                        </View>
                    </View>
                </TouchableOpacity>

                {/* Avatar */}
                <View className="px-6 -mt-16 mb-6">
                    <TouchableOpacity
                        onPress={() => pickImage('avatar')}
                        className="relative w-32 h-32"
                        activeOpacity={0.8}
                    >
                        <View className="w-32 h-32 rounded-full border-4 border-black overflow-hidden bg-gray-800">
                            {newAvatar || avatarUrl ? (
                                <Image
                                    source={{
                                        uri: newAvatar || (
                                            avatarUrl?.startsWith('http')
                                                ? avatarUrl
                                                : avatarUrl?.includes('spoti_images')
                                                    ? avatarUrl
                                                    : `${BASE_URL}${avatarUrl?.startsWith('/uploads/') ? '' : '/uploads/'}${avatarUrl?.replace(/^\/uploads\//, '')}`
                                        )
                                    }}
                                    className="w-full h-full"
                                />
                            ) : (
                                <View className="w-full h-full items-center justify-center">
                                    <Ionicons name="person" size={48} color="#666" />
                                </View>
                            )}
                        </View>
                        <View className="absolute bottom-0 right-0 bg-pink-600 rounded-full p-2 border-2 border-black">
                            <Ionicons name="camera" size={20} color="white" />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Form */}
                <View className="px-6">
                    {/* Display Name */}
                    <View className="mb-6">
                        <Text className="text-gray-400 text-sm mb-2 font-medium">Tên hiển thị *</Text>
                        <TextInput
                            value={displayName}
                            onChangeText={setDisplayName}
                            placeholder="Enter your display name"
                            placeholderTextColor="#666"
                            className="bg-white/10 text-white p-4 rounded-xl border border-white/10 text-base"
                        />
                    </View>

                    {/* Bio */}
                    <View className="mb-6">
                        <Text className="text-gray-400 text-sm mb-2 font-medium">Giới thiệu về tôi</Text>
                        <TextInput
                            value={bio}
                            onChangeText={setBio}
                            placeholder="Tell us about yourself"
                            placeholderTextColor="#666"
                            className="bg-white/10 text-white p-4 rounded-xl border border-white/10 h-32 text-base"
                            multiline
                            textAlignVertical="top"
                        />
                    </View>

                    {/* Info */}
                    <View className="bg-white/5 rounded-xl p-4 border border-white/10 mb-6">
                        <View className="flex-row items-center">
                            <Ionicons name="information-circle-outline" size={20} color="#06B6D4" />
                            <Text className="text-gray-400 text-sm ml-2 flex-1">
                                Your profile information will be visible to other users
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
