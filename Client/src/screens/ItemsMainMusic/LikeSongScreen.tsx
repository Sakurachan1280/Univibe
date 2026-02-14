import { View, Text, TextInput, TouchableOpacity, ScrollView, Pressable, Image, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppNavigation } from "../../navigation/useAppNavigation";
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect } from "react";
import { getLikedSongs, toggleLikeSong } from "../../API/libraryAPI";
import { Song } from "../../API/musicAPI";

export default function LikeSongScreen() {
    const navigation = useAppNavigation();
    const [likedSongs, setLikedSongs] = useState<Song[]>([]);
    const [filteredSongs, setFilteredSongs] = useState<Song[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        loadLikedSongs();
    }, []);

    useEffect(() => {
        if (searchQuery.trim() === "") {
            setFilteredSongs(likedSongs);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = likedSongs.filter(song =>
                song.title.toLowerCase().includes(query) ||
                song.artist_ids?.some(artist => artist.name.toLowerCase().includes(query))
            );
            setFilteredSongs(filtered);
        }
    }, [searchQuery, likedSongs]);

    const loadLikedSongs = async () => {
        try {
            setIsLoading(true);
            const songs = await getLikedSongs();
            setLikedSongs(songs);
            setFilteredSongs(songs);
        } catch (error: any) {
            console.error('Error loading liked songs:', error);
            Alert.alert('Lỗi', 'Không thể tải bài hát yêu thích. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUnlike = async (songId: string) => {
        try {
            await toggleLikeSong(songId);
            setLikedSongs(prev => prev.filter(s => s._id !== songId));
        } catch (error: any) {
            console.error('Error unliking song:', error);
            Alert.alert('Lỗi', 'Không thể bỏ thích bài hát. Vui lòng thử lại.');
        }
    };

    const handlePlayAll = () => {
        if (filteredSongs.length > 0) {
            navigation.navigate("MusicPlayer", { song: filteredSongs[0] });
        }
    };

    // Heart Cover Component
    const HeartCover = ({ size = 56 }: { size?: number }) => (
        <View style={{ width: size, height: size }} className="rounded-lg overflow-hidden">
            <LinearGradient
                colors={['#8B5CF6', '#EC4899', '#06B6D4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="w-full h-full items-center justify-center"
            >
                <Ionicons name="heart" size={size * 0.5} color="white" />
            </LinearGradient>
        </View>
    );

    return (
        <View className="flex-1 bg-black">
            <LinearGradient
                colors={['#1a0520', '#0f0314', '#000000']}
                className="flex-1"
            >
                <SafeAreaView className="flex-1" edges={['top']}>
                    {/* HEADER */}
                    <View className="px-6 pt-2 pb-4">
                        <View className="flex-row items-center justify-between mb-6">
                            <TouchableOpacity
                                onPress={() => navigation.goBack()}
                                className="w-10 h-10 rounded-full bg-white/10 items-center justify-center"
                            >
                                <Ionicons name="chevron-back" size={24} color="white" />
                            </TouchableOpacity>

                            <TouchableOpacity className="w-10 h-10 rounded-full bg-white/10 items-center justify-center">
                                <Ionicons name="ellipsis-horizontal" size={24} color="white" />
                            </TouchableOpacity>
                        </View>

                        {/* Title with Heart Icon */}
                        <View className="flex-row items-center gap-4 mb-6">
                            <HeartCover size={72} />
                            <View className="flex-1">
                                <Text className="text-white text-3xl font-bold">
                                    Bài hát yêu thích
                                </Text>
                                <Text className="text-white/60 text-base mt-1">
                                    {isLoading ? "Đang tải..." : `${likedSongs.length} bài hát`}
                                </Text>
                            </View>
                        </View>

                        {/* Search Bar */}
                        <View className="flex-row items-center bg-white/10 rounded-xl px-4 py-3 mb-4">
                            <Ionicons name="search" size={20} color="rgba(255,255,255,0.6)" />
                            <TextInput
                                placeholder="Tìm kiếm bài hát..."
                                placeholderTextColor="rgba(255,255,255,0.4)"
                                className="text-white flex-1 ml-3 text-base"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchQuery("")}>
                                    <Ionicons name="close-circle" size={20} color="rgba(255,255,255,0.4)" />
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Action Buttons */}
                        {filteredSongs.length > 0 && (
                            <View className="flex-row items-center gap-3">
                                <TouchableOpacity
                                    onPress={handlePlayAll}
                                    className="flex-1"
                                >
                                    <LinearGradient
                                        colors={['#EC4899', '#DB2777']}
                                        className="flex-row items-center justify-center py-3.5 rounded-full"
                                    >
                                        <Ionicons name="play" size={20} color="white" style={{ marginRight: 8, marginLeft: 2 }} />
                                        <Text className="text-white font-bold text-base">Phát tất cả</Text>
                                    </LinearGradient>
                                </TouchableOpacity>

                                <TouchableOpacity className="w-12 h-12 rounded-full bg-white/10 items-center justify-center">
                                    <Ionicons name="shuffle" size={22} color="white" />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    {/* Song List */}
                    <ScrollView
                        className="flex-1"
                        contentContainerStyle={{ paddingBottom: 120 }}
                        showsVerticalScrollIndicator={false}
                    >
                        {isLoading ? (
                            <View className="py-20 items-center">
                                <ActivityIndicator size="large" color="#EC4899" />
                                <Text className="text-white/60 mt-4 text-base">Đang tải bài hát...</Text>
                            </View>
                        ) : filteredSongs.length === 0 ? (
                            <View className="py-20 items-center px-8">
                                <View className="w-32 h-32 rounded-full bg-white/5 items-center justify-center mb-6">
                                    <Ionicons name="heart-outline" size={64} color="#EC4899" />
                                </View>
                                <Text className="text-white font-bold text-xl mb-2 text-center">
                                    {searchQuery ? "Không tìm thấy bài hát" : "Chưa có bài hát yêu thích"}
                                </Text>
                                <Text className="text-white/60 text-center text-base leading-6">
                                    {searchQuery
                                        ? "Thử tìm kiếm với từ khóa khác"
                                        : "Bấm vào icon tim khi nghe nhạc\nđể lưu bài hát yêu thích của bạn"}
                                </Text>
                            </View>
                        ) : (
                            <View className="px-6">
                                {filteredSongs.map((song, index) => (
                                    <TouchableOpacity
                                        key={song._id}
                                        className="flex-row items-center py-3"
                                        activeOpacity={0.7}
                                        onPress={() => navigation.navigate("MusicPlayer", { song })}
                                    >
                                        {/* Cover Image */}
                                        <View className="mr-4">
                                            {song.cover_image ? (
                                                <Image
                                                    source={{ uri: song.cover_image }}
                                                    className="w-14 h-14 rounded-lg"
                                                />
                                            ) : (
                                                <HeartCover size={56} />
                                            )}
                                        </View>

                                        {/* Song Info */}
                                        <View className="flex-1">
                                            <Text className="text-white font-semibold text-base mb-1" numberOfLines={1}>
                                                {song.title}
                                            </Text>
                                            <Text className="text-white/60 text-sm" numberOfLines={1}>
                                                {song.artist_ids?.map(a => a.name).join(', ') || 'Unknown Artist'}
                                            </Text>
                                        </View>

                                        {/* Unlike Button */}
                                        <TouchableOpacity
                                            onPress={() => handleUnlike(song._id)}
                                            className="w-10 h-10 items-center justify-center"
                                        >
                                            <Ionicons name="heart" size={24} color="#EC4899" />
                                        </TouchableOpacity>

                                        {/* Menu */}
                                        <TouchableOpacity className="w-10 h-10 items-center justify-center ml-1">
                                            <Ionicons name="ellipsis-horizontal" size={20} color="rgba(255,255,255,0.6)" />
                                        </TouchableOpacity>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </ScrollView>
                </SafeAreaView>
            </LinearGradient>
        </View>
    );
}