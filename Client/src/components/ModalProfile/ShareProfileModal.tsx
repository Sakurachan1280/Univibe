import React from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    Image,
    Share,
    Linking,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { User } from '../../API/userAPI';
import { BASE_URL } from '../../API/axiosClient';

interface ShareProfileModalProps {
    visible: boolean;
    onClose: () => void;
    userData: User | null;
}

export default function ShareProfileModal({
    visible,
    onClose,
    userData,
}: ShareProfileModalProps) {
    const getAvatarSource = () => {
        if (userData?.profile?.avatar_url) {
            if (userData.profile.avatar_url.startsWith('http')) {
                return { uri: userData.profile.avatar_url };
            } else {
                return { uri: `${BASE_URL}${userData.profile.avatar_url}` };
            }
        }
        return require('../../../assets/Icon/ava.jpg');
    };

    const getDisplayName = () => {
        return userData?.profile?.display_name || userData?.username || 'User';
    };

    const handleShare = async (platform?: string) => {
        const shareMessage = `Xem hồ sơ của ${getDisplayName()} trên UniVibe! 🎵`;

        try {
            if (platform === 'whatsapp') {
                await Linking.openURL(`whatsapp://send?text=${encodeURIComponent(shareMessage)}`);
            } else if (platform === 'instagram') {
                await Share.share({ message: shareMessage });
            } else if (platform === 'messages') {
                await Linking.openURL(`sms:?body=${encodeURIComponent(shareMessage)}`);
            } else if (platform === 'copy') {
                await Share.share({
                    message: shareMessage,
                    title: 'Chia sẻ hồ sơ',
                });
            } else {
                await Share.share({
                    message: shareMessage,
                    title: 'Chia sẻ hồ sơ',
                });
            }
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/95">
                {/* Header */}
                <View className="pt-14 px-6 pb-4 flex-row items-center justify-between">
                    <TouchableOpacity
                        onPress={onClose}
                        className="w-10 h-10 items-center justify-center rounded-full bg-white/10 active:bg-white/20"
                    >
                        <Ionicons name="close" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text className="text-white text-lg font-bold">Chia sẻ hồ sơ</Text>
                    <View className="w-10" />
                </View>

                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Profile Card with Gradient */}
                    <View className="mt-6 mb-8">
                        <View className="rounded-3xl overflow-hidden bg-gradient-to-br from-pink-500 to-cyan-500 p-[2px]">
                            <View className="bg-[#1a1a1a] rounded-3xl p-8">
                                {/* Avatar with Glow Effect */}
                                <View className="items-center mb-6">
                                    <View className="relative">
                                        {/* Glow effect */}
                                        <View className="absolute inset-0 bg-pink-500/30 rounded-full blur-2xl scale-110" />

                                        {/* Avatar */}
                                        <View className="w-32 h-32 rounded-full overflow-hidden border-4 border-pink-500/50 relative z-10">
                                            <Image
                                                source={getAvatarSource()}
                                                className="w-full h-full"
                                                resizeMode="cover"
                                            />
                                        </View>

                                        {/* Verified Badge */}
                                        <View className="absolute bottom-0 right-0 w-10 h-10 bg-gradient-to-br from-pink-500 to-cyan-500 rounded-full items-center justify-center border-4 border-[#1a1a1a] z-20">
                                            <Ionicons name="musical-notes" size={18} color="#fff" />
                                        </View>
                                    </View>
                                </View>

                                {/* Name */}
                                <Text className="text-white text-3xl font-bold text-center mb-2">
                                    {getDisplayName()}
                                </Text>

                                {/* Bio */}
                                <Text className="text-gray-400 text-sm text-center mb-6">
                                    {userData?.profile?.bio || 'Hồ sơ trên UniVibe'}
                                </Text>

                                {/* Stats */}
                                <View className="flex-row justify-around mb-6 bg-white/5 rounded-2xl p-4">
                                    <View className="items-center">
                                        <Text className="text-white text-2xl font-bold">38</Text>
                                        <Text className="text-gray-400 text-xs mt-1">Theo dõi</Text>
                                    </View>
                                    <View className="w-[1px] bg-white/10" />
                                    <View className="items-center">
                                        <Text className="text-white text-2xl font-bold">1</Text>
                                        <Text className="text-gray-400 text-xs mt-1">Người theo dõi</Text>
                                    </View>
                                    <View className="w-[1px] bg-white/10" />
                                    <View className="items-center">
                                        <Text className="text-white text-2xl font-bold">24</Text>
                                        <Text className="text-gray-400 text-xs mt-1">Playlist</Text>
                                    </View>
                                </View>

                                {/* SpotiChat Badge */}
                                <View className="items-center">
                                    <View className="bg-gradient-to-r from-pink-500 to-cyan-500 rounded-full px-6 py-2.5">
                                        <Text className="text-white text-sm font-bold">UniVibe Premium</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Share Options Title */}
                    <Text className="text-white text-lg font-bold mb-4">Chia sẻ qua</Text>

                    {/* Share Options Grid */}
                    <View className="flex-row flex-wrap gap-4 mb-6">
                        {/* Copy Link */}
                        <TouchableOpacity
                            className="flex-1 min-w-[45%] bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-4 active:opacity-80"
                            onPress={() => handleShare('copy')}
                        >
                            <View className="flex-row items-center">
                                <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center mr-3">
                                    <Ionicons name="link" size={24} color="#fff" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-white font-bold text-base">Sao chép link</Text>
                                    <Text className="text-white/70 text-xs mt-0.5">Chia sẻ đường dẫn</Text>
                                </View>
                            </View>
                        </TouchableOpacity>

                        {/* WhatsApp */}
                        <TouchableOpacity
                            className="flex-1 min-w-[45%] bg-[#25D366] rounded-2xl p-4 active:opacity-80"
                            onPress={() => handleShare('whatsapp')}
                        >
                            <View className="flex-row items-center">
                                <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center mr-3">
                                    <Ionicons name="logo-whatsapp" size={26} color="#fff" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-white font-bold text-base">WhatsApp</Text>
                                    <Text className="text-white/70 text-xs mt-0.5">Gửi tin nhắn</Text>
                                </View>
                            </View>
                        </TouchableOpacity>

                        {/* Instagram */}
                        <TouchableOpacity
                            className="flex-1 min-w-[45%] rounded-2xl p-4 active:opacity-80 overflow-hidden"
                            onPress={() => handleShare('instagram')}
                            style={{ backgroundColor: '#E1306C' }}
                        >
                            <View className="flex-row items-center">
                                <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center mr-3">
                                    <Ionicons name="logo-instagram" size={26} color="#fff" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-white font-bold text-base">Instagram</Text>
                                    <Text className="text-white/70 text-xs mt-0.5">Chia sẻ story</Text>
                                </View>
                            </View>
                        </TouchableOpacity>

                        {/* Messages */}
                        <TouchableOpacity
                            className="flex-1 min-w-[45%] bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-4 active:opacity-80"
                            onPress={() => handleShare('messages')}
                        >
                            <View className="flex-row items-center">
                                <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center mr-3">
                                    <Ionicons name="chatbubble" size={22} color="#fff" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-white font-bold text-base">Tin nhắn</Text>
                                    <Text className="text-white/70 text-xs mt-0.5">Gửi SMS</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* More Options */}
                    <TouchableOpacity
                        className="bg-white/10 rounded-2xl p-4 flex-row items-center justify-center active:bg-white/20"
                        onPress={() => handleShare()}
                    >
                        <Ionicons name="share-social" size={22} color="#fff" />
                        <Text className="text-white font-semibold ml-2">Tùy chọn khác</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </Modal>
    );
}
