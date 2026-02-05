import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StatusBar, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppNavigation } from "../../navigation/useAppNavigation";
import { getRandomSongs, Song } from "../../API/songAPI";

export default function ListSongScreen() {
    const navigation = useAppNavigation();
    const [isShuffled, setIsShuffled] = useState(false);
    const [songs, setSongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRandomSongs();
    }, []);

    const loadRandomSongs = async () => {
        try {
            setLoading(true);
            const randomSongs = await getRandomSongs(20);
            console.log('Loaded songs:', randomSongs);
            console.log('First song:', randomSongs[0]);
            setSongs(randomSongs);
        } catch (error) {
            console.error('Error loading random songs:', error);
        } finally {
            setLoading(false);
        }
    };
    return (
        <SafeAreaView className="flex-1 bg-black" edges={['top']}>
            <StatusBar barStyle="light-content" />

            <ScrollView className="flex-1">
                {/* Header with Purple Background */}
                <View className="bg-[#1B1B1B] pb-8">
                    {/* top nav */}
                    <View className="flex-row items-center justify-between px-4 pt-2">
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Ionicons name="chevron-back" size={28} color="white" />
                        </TouchableOpacity>
                    </View>

                    {/* cover + info */}
                    <View className="mt-6 px-4">
                        <View className="items-center mb-6">
                            <View className="w-64 h-64 rounded-lg bg-neutral-700 shadow-xl" />
                        </View>

                        <View className="items-start">
                            <Text className="text-white text-3xl font-extrabold mb-2 leading-tight">
                                Đầu tư HDPE là ngon luôn
                            </Text>

                            <View className="flex-row items-center">
                                <Image
                                    source={require('../../../assets/Icon/ava.jpg')}
                                    className="w-7 h-7 rounded-full mr-2"
                                />
                                <Text className="text-white/80 font-medium">Sakura</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Action Buttons */}
                <View className="px-4 pt-6 pb-4">
                    <View className="flex-row items-center justify-end mb-6">
                        <View className="flex-row items-center space-x-5 gap-5">
                            <TouchableOpacity onPress={() => setIsShuffled(!isShuffled)}>
                                <Ionicons
                                    name="shuffle"
                                    size={26}
                                    color={isShuffled ? "#EC4899" : "#b3b3b3"}
                                />
                            </TouchableOpacity>

                            <TouchableOpacity className="w-14 h-14 bg-[#EC4899] rounded-full items-center justify-center">
                                <Ionicons name="play" size={28} color="black" style={{ marginLeft: 2 }} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Horizontal Scrollable Buttons */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                        {[
                            { icon: "add", label: "Thêm" },
                            { icon: "swap-vertical", label: "Phối" },
                            { icon: "menu", label: "Chỉnh sửa" },
                            { icon: "layers", label: "Sắp xếp" },
                            { icon: "create-outline", label: "Tên & thông tin chi tiết" },
                        ].map((btn, index) => (
                            <TouchableOpacity
                                key={index}
                                className="bg-neutral-800 rounded-full px-4 py-2 mr-3 flex-row items-center"
                            >
                                <Ionicons name={btn.icon as any} size={18} color="white" />
                                <Text className="text-white ml-2">{btn.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Song List */}
                <View className="px-4">
                    {loading ? (
                        <View className="items-center justify-center py-10">
                            <ActivityIndicator size="large" color="#EC4899" />
                            <Text className="text-white/60 mt-4">Đang tải bài hát...</Text>
                        </View>
                    ) : songs.length === 0 ? (
                        <View className="items-center justify-center py-10">
                            <Text className="text-white/60">Không có bài hát nào</Text>
                        </View>
                    ) : (
                        songs.map((item, index) => (
                            <TouchableOpacity
                                key={item._id}
                                className="flex-row items-center justify-between py-3"
                                onPress={() => navigation.navigate("MusicPlayer")}
                            >
                                <View className="flex-row items-center flex-1">
                                    <View className="w-12 h-12 rounded bg-neutral-800 mr-3 items-center justify-center">
                                        <Text className="text-white/40 text-xs">{index + 1}</Text>
                                    </View>

                                    <View className="flex-1">
                                        <Text className="text-white font-medium text-base" numberOfLines={1}>
                                            {item.title}
                                        </Text>
                                        <Text className="text-white/60 text-sm mt-0.5" numberOfLines={1}>
                                            {item.artist}
                                        </Text>
                                    </View>
                                </View>

                                <TouchableOpacity className="ml-2">
                                    <Ionicons name="ellipsis-horizontal" size={22} color="white" />
                                </TouchableOpacity>
                            </TouchableOpacity>
                        ))
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};