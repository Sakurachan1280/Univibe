import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StatusBar, ActivityIndicator, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppNavigation } from "../../navigation/useAppNavigation";
import { LinearGradient } from 'expo-linear-gradient';
import musicAPI, { Song } from "../../API/musicAPI";
import { QUICK_PLAY } from '../../constants/quickPlay';
import { useRoute, RouteProp } from '@react-navigation/native';

const { width } = Dimensions.get('window');

// Extend route params to include title
type PlaylistsRouteProp = RouteProp<{
    Playlists: { title?: string };
}, 'Playlists'>;

export default function ListSongScreen() {
    const navigation = useAppNavigation();
    const route = useRoute<PlaylistsRouteProp>();

    const [songs, setSongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState(true);
    const [isLiked, setIsLiked] = useState(false);
    const [pageTitle, setPageTitle] = useState("Danh sách phát");

    useEffect(() => {
        // Determine title: use param if available, otherwise random from QUICK_PLAY (matching 'Playlists' screen)
        if (route.params?.title) {
            setPageTitle(route.params.title);
        } else {
            const playlistItems = QUICK_PLAY.filter(item => item.screen === 'Playlists');
            if (playlistItems.length > 0) {
                const randomItem = playlistItems[Math.floor(Math.random() * playlistItems.length)];
                setPageTitle(randomItem.title);
            }
        }
        loadRandomSongs();
    }, [route.params?.title]);

    const loadRandomSongs = async () => {
        try {
            setLoading(true);
            const randomSongs = await musicAPI.getRandomSongs(20);
            setSongs(randomSongs);
        } catch (error) {
            console.error('Error loading random songs:', error);
        } finally {
            setLoading(false);
        }
    };

    const playSong = (song: Song) => {
        navigation.navigate("MusicPlayer", { song });
    };

    const renderHeader = () => (
        <View className="items-center pt-4 pb-8">
            <View
                style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 10 },
                    shadowOpacity: 0.5,
                    shadowRadius: 20,
                    elevation: 10
                }}
                className="mb-8"
            >
                <Image
                    source={
                        songs.length > 0 && songs[0].cover_image
                            ? { uri: songs[0].cover_image }
                            : require('../../../assets/Icon/ava.jpg')
                    }
                    style={{ width: width * 0.6, height: width * 0.6 }}
                    className="rounded-lg"
                />
            </View>

            <View className="px-6 w-full">
                <Text className="text-white text-3xl font-bold mb-2 leading-tight">
                    {pageTitle}
                </Text>

                <View className="flex-row items-center mb-2">
                    <Image
                        source={require('../../../assets/Icon/ava.jpg')}
                        className="w-6 h-6 rounded-full mr-2"
                    />
                    <Text className="text-white font-bold text-sm">Sakura</Text>
                </View>

                <Text className="text-gray-400 text-xs font-medium">
                    {songs.length > 0 ? `${Math.floor(songs.length * 3.5)} phút` : '...'} • {songs.length} bài hát
                </Text>

                <View className="flex-row items-center justify-between mt-6">
                    <View className="flex-row items-center space-x-5 gap-5">
                        <TouchableOpacity onPress={() => setIsLiked(!isLiked)}>
                            <Ionicons
                                name={isLiked ? "heart" : "heart-outline"}
                                size={28}
                                color={isLiked ? "#EC4899" : "#b3b3b3"}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity>
                            <Ionicons name="arrow-down-circle-outline" size={28} color="#b3b3b3" />
                        </TouchableOpacity>
                        <TouchableOpacity>
                            <Ionicons name="ellipsis-horizontal" size={28} color="#b3b3b3" />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        className="w-14 h-14 bg-[#EC4899] rounded-full items-center justify-center shadow-lg shadow-pink-500/30"
                        onPress={() => songs.length > 0 && playSong(songs[0])}
                    >
                        <Ionicons name="play" size={28} color="white" style={{ marginLeft: 3 }} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    const renderSongItem = (item: Song, index: number) => {
        const artistName = item.artist_ids?.map(a => a.name).join(", ") || "Unknown Artist";

        return (
            <TouchableOpacity
                key={item._id}
                activeOpacity={0.7}
                className="flex-row items-center justify-between py-3 px-4 mb-1"
                onPress={() => playSong(item)}
            >
                <View className="flex-row items-center flex-1">
                    {/* Song Cover Thumbnail */}
                    {item.cover_image ? (
                        <Image
                            source={{ uri: item.cover_image }}
                            className="w-12 h-12 rounded mx-3"
                        />
                    ) : (
                        <View className="w-12 h-12 rounded bg-neutral-800 mx-3 items-center justify-center">
                            <Ionicons name="musical-note" size={20} color="#666" />
                        </View>
                    )}

                    <View className="flex-1">
                        <Text className="text-white font-semibold text-base" numberOfLines={1}>
                            {item.title}
                        </Text>
                        <View className="flex-row items-center mt-1">
                            {item.lyrics && (
                                <View className="bg-neutral-600 px-1 rounded-[2px] mr-1.5">
                                    <Text className="text-[9px] text-black font-bold">LYRICS</Text>
                                </View>
                            )}
                            <Text className="text-gray-400 text-sm" numberOfLines={1}>
                                {artistName}
                            </Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity className="p-2">
                    <Ionicons name="ellipsis-horizontal" size={20} color="#b3b3b3" />
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    return (
        <View className="flex-1 bg-black">
            <StatusBar barStyle="light-content" />

            {/* Back Button Overlay - Fixed */}
            <SafeAreaView className="absolute top-0 left-0 z-50 w-full px-4" edges={['top']}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="w-10 h-10 items-center justify-center bg-black/40 rounded-full"
                    style={{ marginTop: 10 }}
                >
                    <Ionicons name="chevron-back" size={24} color="white" />
                </TouchableOpacity>
            </SafeAreaView>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
            >
                {/* Hero / Header Section Gradient */}
                <LinearGradient
                    colors={['#831843', '#1a060f', '#000000']} // Pink/Deep Pink to Black
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    className="w-full pb-6"
                >
                    <SafeAreaView edges={['top']}>
                        {renderHeader()}
                    </SafeAreaView>
                </LinearGradient>

                {/* Song List Section */}
                <View className="bg-black pb-24">
                    {loading ? (
                        <View className="items-center justify-center py-20">
                            <ActivityIndicator size="large" color="#EC4899" />
                            <Text className="text-gray-500 mt-4 text-sm">Đang tải giai điệu...</Text>
                        </View>
                    ) : songs.length === 0 ? (
                        <View className="items-center justify-center py-20">
                            <Text className="text-gray-500">Không có bài hát nào</Text>
                        </View>
                    ) : (
                        songs.map((item, index) => renderSongItem(item, index))
                    )}
                </View>
            </ScrollView>
        </View>
    );
};