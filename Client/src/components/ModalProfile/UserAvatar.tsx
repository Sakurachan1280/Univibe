import React, { useState, useEffect, memo } from 'react';
import { View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { getMeAPI, User } from '../../API/userAPI';
import { BASE_URL } from '../../API/axiosClient';

interface UserAvatarProps {
    size?: number;
    onPress?: () => void;
}

// ─── AvatarImage: outside parent to avoid remount on every render ─────────────
interface AvatarImageProps {
    size: number;
    loading: boolean;
    avatarUri: string | null;  // null = use local asset
}

const AvatarImage = memo(({ size, loading, avatarUri }: AvatarImageProps) => {
    if (loading) {
        return (
            <View
                style={{
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: '#1f2937',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <ActivityIndicator size="small" color="#EC4899" />
            </View>
        );
    }

    return (
        <Image
            source={avatarUri ?? require('../../../assets/Icon/ava.jpg')}
            style={{ width: size, height: size, borderRadius: size / 2 }}
            cachePolicy="memory-disk"
        />
    );
});

export default function UserAvatar({ size = 40, onPress }: UserAvatarProps) {
    const [avatarUri, setAvatarUri] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const data: User | null = await getMeAPI();
            const url = data?.profile?.avatar_url;
            if (url) {
                if (url.startsWith('http') || url.includes('spoti_images')) {
                    setAvatarUri(url);
                } else {
                    setAvatarUri(`${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`);
                }
            } else {
                setAvatarUri(null);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            setAvatarUri(null);
        } finally {
            setLoading(false);
        }
    };

    if (onPress) {
        return (
            <TouchableOpacity onPress={onPress}>
                <AvatarImage size={size} loading={loading} avatarUri={avatarUri} />
            </TouchableOpacity>
        );
    }

    return <AvatarImage size={size} loading={loading} avatarUri={avatarUri} />;
}
