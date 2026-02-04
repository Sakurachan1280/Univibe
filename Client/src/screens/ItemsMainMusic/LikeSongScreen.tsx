import { View, Text, TextInput, TouchableOpacity, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppNavigation } from "../../navigation/useAppNavigation";

export default function LikeSongScreen() {
    const navigation = useAppNavigation();
    return (
        <SafeAreaView className="flex-1 bg-black" edges={['top']}>
            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                {/* Blue Section */}
                <View className="bg-[#2E4C9E] pb-6">
                    {/* Back Button */}
                    <Pressable onPress={() => navigation.goBack()} className="mx-4 mt-2">
                        <Ionicons name="chevron-back" size={28} color="white" />
                    </Pressable>

                    {/* Search and Sort */}
                    <View className="mx-4 mt-4 flex-row items-center gap-2">
                        <View className="flex-1 flex-row items-center gap-3 bg-white/20 px-4 rounded-lg h-12">
                            <Ionicons name="search" size={20} color="white" />
                            <TextInput
                                placeholder="Tìm trong mục Bài hát đã thích"
                                placeholderTextColor="rgba(255,255,255,0.7)"
                                className="text-white flex-1"
                            />
                        </View>
                        <Pressable className="bg-white/20 px-5 rounded-lg h-12 justify-center">
                            <Text className="text-white font-medium">Sắp xếp</Text>
                        </Pressable>
                    </View>

                    {/* Title Section */}
                    <View className="mx-4 mt-8">
                        <Text className="text-white font-bold text-2xl">Bài hát ưa thích</Text>
                        <Text className="text-white/80 text-sm mt-1">12 bài hát</Text>
                    </View>

                    {/* Action Buttons */}
                    <View className="mx-4 mt-6 flex-row items-center justify-between">
                        <View className="flex-row items-center gap-4">
                            <View className="w-12 h-12 rounded-lg bg-white/20" />
                            <Pressable className="w-10 h-10 rounded-full bg-gray-600 justify-center items-center">
                                <Ionicons name="arrow-down" size={20} color="white" />
                            </Pressable>
                            <Pressable className="w-10 h-10 rounded-full bg-gray-600 justify-center items-center">
                                <Ionicons name="shuffle" size={20} color="white" />
                            </Pressable>
                        </View>

                        <Pressable className="w-14 h-14 rounded-full bg-[#EC4899] justify-center items-center">
                            <Ionicons name="play" size={28} color="white" style={{ marginLeft: 2 }} />
                        </Pressable>
                    </View>
                </View>

                {/* Black Section */}
                <View className="bg-black">
                    {/* Add Song Button */}
                    <Pressable className="mx-4 mt-6 flex-row items-center gap-4">
                        <View className="w-12 h-12 rounded bg-neutral-800 justify-center items-center">
                            <Ionicons name="add" size={28} color="white" />
                        </View>
                        <Text className="text-white font-medium text-base">Thêm bài hát</Text>
                    </Pressable>

                    {/* Song List */}
                    <View className="px-4 mt-4">
                        {[
                            { id: 1, title: "Người Đi Bao", artist: "Low G" },
                            { id: 2, title: "chẳng phải tình đầu sao đau đến thế", artist: "MIN, Dangrangto, antransax" },
                            { id: 3, title: "Từng Ngày Yêu Em", artist: "buitruonglinh" },
                            { id: 4, title: "Không Thời Gian", artist: "Dương Domic" },
                            { id: 5, title: "Ngàn Năm Ánh Sáng", artist: "Đặng Vinh Thịnh, BMZ, Nguyễn Trung Đức" },
                            { id: 6, title: "Giờ Thì", artist: "buitruonglinh" },
                            { id: 7, title: "vạn vật như muốn ta bên nhau", artist: "RIO" },
                            { id: 8, title: "một bài hát không vui mấy", artist: "T.R.I, Dangrangto, DONAL" },
                            { id: 9, title: "Lễ Đường", artist: "Kai Đinh" },
                            { id: 10, title: "Trần Bộ Nhớ", artist: "Dương Domic" },
                            { id: 11, title: "Phép Màu - Đàn Cá Gỗ", artist: "MAYDAYs, Minh Tốc & Lam" },
                            { id: 12, title: "In Love", artist: "Low G, JustaTee" },
                        ].map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                className="flex-row items-center justify-between py-3"
                                activeOpacity={0.7}
                                onPress={() => navigation.navigate("MusicPlayer")}
                            >
                                <View className="flex-row items-center flex-1">
                                    <View className="w-14 h-14 rounded bg-neutral-700 mr-3" />
                                    <View className="flex-1">
                                        <Text className="text-white font-medium text-base" numberOfLines={1}>
                                            {item.title}
                                        </Text>
                                        <Text className="text-white/60 text-sm mt-0.5" numberOfLines={1}>
                                            {item.artist}
                                        </Text>
                                    </View>
                                </View>

                                <Ionicons name="ellipsis-horizontal" size={24} color="white" />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}