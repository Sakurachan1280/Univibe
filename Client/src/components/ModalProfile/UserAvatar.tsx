import React, { useState, useEffect } from 'react';
import { Image, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { getMeAPI, User } from '../../API/userAPI';
import { BASE_URL } from '../../API/axiosClient';

interface UserAvatarProps {
    size?: number;
    onPress?: () => void;
}

export default function UserAvatar({ size = 40, onPress }: UserAvatarProps) {
    const [userData, setUserData] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const data = await getMeAPI();
            setUserData(data);
        } catch (error) {
            console.error("Error fetching user data:", error);
        } finally {
            setLoading(false);
        }
    };

    const getAvatarSource = () => {
        if (userData?.profile?.avatar_url) {
            if (userData.profile.avatar_url.startsWith('http')) {
                return { uri: userData.profile.avatar_url };
            }
            return { uri: `${BASE_URL}${userData.profile.avatar_url}` };
        }
        return require("../../../assets/Icon/ava.jpg");
    };

    const AvatarContent = () => (
        loading ? (
            <View
                className="rounded-full bg-gray-800 items-center justify-center"
                style={{ width: size, height: size }}
            >
                <ActivityIndicator size="small" color="#EC4899" />
            </View>
        ) : (
            <Image
                source={getAvatarSource()}
                className="rounded-full"
                style={{ width: size, height: size }}
            />
        )
    );

    if (onPress) {
        return (
            <TouchableOpacity onPress={onPress}>
                <AvatarContent />
            </TouchableOpacity>
        );
    }

    return <AvatarContent />;
}
