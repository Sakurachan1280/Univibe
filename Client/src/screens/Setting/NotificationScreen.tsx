import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppNavigation } from '../../navigation/useAppNavigation';

// Demo notification data
const DEMO_NOTIFICATIONS = [
    {
        id: '1',
        type: 'message',
        title: 'Tin nhắn mới từ Minh Anh',
        message: 'Hey! Bạn đã nghe bài hát mới của Taylor Swift chưa? 🎵',
        avatar: require('../../../assets/Icon/ava.jpg'),
        time: '5 phút trước',
        unread: true,
    },
    {
        id: '2',
        type: 'message',
        title: 'Tin nhắn mới từ Hoàng',
        message: 'Playlist của bạn hay quá! Có thể chia sẻ cho mình được không?',
        avatar: require('../../../assets/Icon/ava.jpg'),
        time: '1 giờ trước',
        unread: true,
    },
    {
        id: '3',
        type: 'follow',
        title: 'Người theo dõi mới',
        message: 'Quỳnh Anh đã bắt đầu theo dõi bạn',
        avatar: require('../../../assets/Icon/ava.jpg'),
        time: '2 giờ trước',
        unread: true,
    },
    {
        id: '4',
        type: 'message',
        title: 'Tin nhắn mới từ Tuấn',
        message: 'Cảm ơn bạn đã chia sẻ playlist! 😊',
        avatar: require('../../../assets/Icon/ava.jpg'),
        time: '3 giờ trước',
        unread: false,
    },
    {
        id: '5',
        type: 'like',
        title: 'Playlist được yêu thích',
        message: 'Lan Anh đã thích playlist "Chill Vibes" của bạn',
        avatar: require('../../../assets/Icon/ava.jpg'),
        time: '5 giờ trước',
        unread: false,
    },
    {
        id: '6',
        type: 'message',
        title: 'Tin nhắn mới từ Phương',
        message: 'Bạn có rảnh tối nay không? Đi karaoke nhé! 🎤',
        avatar: require('../../../assets/Icon/ava.jpg'),
        time: 'Hôm qua',
        unread: false,
    },
    {
        id: '7',
        type: 'system',
        title: 'Cập nhật hệ thống',
        message: 'SpotiChat đã có tính năng mới: Chia sẻ hồ sơ! Hãy thử ngay.',
        avatar: null,
        time: '2 ngày trước',
        unread: false,
    },
];

export default function NotificationScreen() {
    const navigation = useAppNavigation();
    const [notifications, setNotifications] = useState(DEMO_NOTIFICATIONS);

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'message':
                return 'chatbubble';
            case 'follow':
                return 'person-add';
            case 'like':
                return 'heart';
            case 'system':
                return 'information-circle';
            default:
                return 'notifications';
        }
    };

    const getIconColor = (type: string) => {
        switch (type) {
            case 'message':
                return '#06B6D4'; // cyan
            case 'follow':
                return '#EC4899'; // pink
            case 'like':
                return '#EF4444'; // red
            case 'system':
                return '#8B5CF6'; // purple
            default:
                return '#9CA3AF';
        }
    };

    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(notif =>
                notif.id === id ? { ...notif, unread: false } : notif
            )
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev =>
            prev.map(notif => ({ ...notif, unread: false }))
        );
    };

    const unreadCount = notifications.filter(n => n.unread).length;

    return (
        <SafeAreaView className="flex-1 bg-black">
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-3 bg-neutral-900/95 border-b border-white/10">
                <View className="flex-row items-center flex-1">
                    <TouchableOpacity
                        className="w-10 h-10 items-center justify-center rounded-full bg-white/10 active:bg-white/20"
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="chevron-back" size={24} color="#fff" />
                    </TouchableOpacity>

                    <View className="ml-4">
                        <Text className="text-white text-xl font-bold">Thông báo</Text>
                        {unreadCount > 0 && (
                            <Text className="text-gray-400 text-xs mt-0.5">
                                {unreadCount} thông báo chưa đọc
                            </Text>
                        )}
                    </View>
                </View>

                {unreadCount > 0 && (
                    <TouchableOpacity
                        onPress={markAllAsRead}
                        className="px-3 py-1.5 bg-pink-600 rounded-full active:bg-pink-700"
                    >
                        <Text className="text-white text-xs font-semibold">
                            Đánh dấu đã đọc
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Notifications List */}
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {notifications.map((notification) => (
                    <TouchableOpacity
                        key={notification.id}
                        className={`flex-row items-start px-4 py-4 border-b border-white/5 active:bg-white/5 ${notification.unread ? 'bg-pink-500/5' : ''
                            }`}
                        onPress={() => markAsRead(notification.id)}
                    >
                        {/* Avatar or Icon */}
                        <View className="mr-3">
                            {notification.avatar ? (
                                <View className="relative">
                                    <Image
                                        source={notification.avatar}
                                        className="w-12 h-12 rounded-full"
                                    />
                                    {notification.unread && (
                                        <View className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full border-2 border-black" />
                                    )}
                                </View>
                            ) : (
                                <View
                                    className="w-12 h-12 rounded-full items-center justify-center"
                                    style={{ backgroundColor: getIconColor(notification.type) + '20' }}
                                >
                                    <Ionicons
                                        name={getNotificationIcon(notification.type) as any}
                                        size={24}
                                        color={getIconColor(notification.type)}
                                    />
                                </View>
                            )}
                        </View>

                        {/* Content */}
                        <View className="flex-1">
                            <View className="flex-row items-start justify-between mb-1">
                                <Text
                                    className={`flex-1 text-base ${notification.unread
                                        ? 'text-white font-bold'
                                        : 'text-gray-300 font-medium'
                                        }`}
                                >
                                    {notification.title}
                                </Text>
                                <Text className="text-gray-500 text-xs ml-2">
                                    {notification.time}
                                </Text>
                            </View>

                            <Text
                                className={`text-sm leading-5 ${notification.unread ? 'text-gray-300' : 'text-gray-500'
                                    }`}
                                numberOfLines={2}
                            >
                                {notification.message}
                            </Text>

                            {/* Action buttons for messages */}
                            {notification.type === 'message' && notification.unread && (
                                <View className="flex-row gap-2 mt-3">
                                    <TouchableOpacity className="bg-pink-600 rounded-full px-4 py-2 active:bg-pink-700">
                                        <Text className="text-white text-xs font-semibold">
                                            Trả lời
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity className="bg-white/10 rounded-full px-4 py-2 active:bg-white/20">
                                        <Text className="text-white text-xs font-semibold">
                                            Xem
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                ))}

                {/* Empty state if no notifications */}
                {notifications.length === 0 && (
                    <View className="items-center justify-center py-20">
                        <View className="w-20 h-20 bg-white/5 rounded-full items-center justify-center mb-4">
                            <Ionicons name="notifications-off-outline" size={40} color="#666" />
                        </View>
                        <Text className="text-gray-400 text-base">
                            Không có thông báo nào
                        </Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
