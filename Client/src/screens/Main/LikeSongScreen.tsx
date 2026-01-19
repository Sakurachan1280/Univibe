import { View, Text, TextInput, TouchableOpacity, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppNavigation } from "../../navigation/useAppNavigation";

export default function LikeSongScreen() {
    const navigation = useAppNavigation();
    return (
        <SafeAreaView className="flex-1 bg-[#614385]" >
            <ScrollView>
                <Pressable onPress={() => navigation.goBack()} className="mx-2">
                <Ionicons name="arrow-back" size={24} color="white" />
                </Pressable>
                    
                <Pressable className="mx-2 mt-2 flex-row items-center justify-between">
                    <Pressable className="flex-1 flex-row items-center gap-2 bg-[#42275a] px-3 rounded h-[38px]">
                        <Ionicons name="search" color="white"/>

                        <TextInput
                            placeholder="Find in Liked songs"
                            placeholderTextColor="white"
                            className="text-white flex-1 font-medium"
                        />
                    </Pressable>
                    <Pressable className="mx-2 bg-[#42275a] p-2 rounded h-[38px] justify-center sm:h-[44px] md:h-[48px]">
                        <Text className="text-white font-medium text-base sm:text-lg">Sort</Text>
                    </Pressable>
                </Pressable>

                <View className="h-[50px]"/>

                <View className="mx-2">
                        <Text className="text-white font-bold text-lg">Liked Songs</Text>
                        <Text className="text-white text-xs mt-1">430 songs</Text>
                </View>

                <Pressable className="mx-2 flex-row items-center justify-between">
                    <Pressable className="w-[30px] h-[30px] rounded-full bg-[#1DB954] justify-center items-center">
                        <Ionicons name="arrow-down" size={18} color="white" />
                    </Pressable>

                    <View className="flex-row items-center gap-3">
                        <Ionicons name="add" size={24} color="#1DB954" />

                        <Pressable className="w-[60px] h-[60px] rounded-full bg-[#1DB954] justify-center items-center">
                        <Ionicons name="play" size={30} color="white" />
                        </Pressable>
                    </View>
                </Pressable>

            
                <View className="px-3 mt-4">
                    {[
                        { id: 1,  title: "Người Đi Bao", artist: "Low G" },
                        { id: 2,  title: "chẳng phải tình đầu sao đau đến thế", artist: "MIN, Dangrangto, antransax" },
                        { id: 3,  title: "Từng Ngày Yêu Em", artist: "buitruonglinh" },
                        { id: 4,  title: "Không Thời Gian", artist: "Dương Domic" },
                        { id: 5,  title: "Ngàn Năm Ánh Sáng", artist: "Đặng Vinh Thịnh, BMZ, Nguyễn Trung Đức" },
                        { id: 6,  title: "Giờ Thì", artist: "buitruonglinh" },
                        { id: 7,  title: "vạn vật như muốn ta bên nhau", artist: "RIO" },
                        { id: 8,  title: "một bài hát không vui mấy", artist: "T.R.I, Dangrangto, DONAL" },
                        { id: 9,  title: "Lễ Đường", artist: "Kai Đinh" },
                        { id: 10, title: "Trần Bộ Nhớ", artist: "Dương Domic" },
                        { id: 11, title: "Phép Màu - Đàn Cá Gỗ", artist: "MAYDAYs, Minh Tốc & Lam" },
                        { id: 12, title: "In Love", artist: "Low G, JustaTee"},
                    ].map((item) => (
                        <TouchableOpacity
                        key={item.id}
                        className="flex-row items-center justify-between py-2"
                        activeOpacity={0.5} onPress={() => navigation.navigate("MusicPlayer")}
                        >
                            <View className="flex-row items-center">
                                <View className="w-12 h-12 rounded bg-neutral-700 mr-3" />

                                <View>
                                <Text className="text-white font-semibold" numberOfLines={1}>
                                    {item.title}
                                </Text>
                                <Text className="text-gray-400 text-xs" numberOfLines={1}>
                                    {item.artist}
                                </Text>
                                </View>
                            </View>

                            <View className="flex-row items-center gap-4">
                                <Ionicons name="heart" size={20} color="#1DB954" />
                                <Ionicons name="ellipsis-vertical" size={20} color="white" />
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

            </ScrollView>
        </SafeAreaView>

    )
}
