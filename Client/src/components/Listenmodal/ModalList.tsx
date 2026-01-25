import React from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    Image,
    ScrollView,
    Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ListenModalProps {
    isVisible: boolean;
    onClose: () => void;
}

export default function ListenModal({ isVisible, onClose }: ListenModalProps) {

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            {/* Overlay – chạm là out */}
            <Pressable
                className="flex-1 justify-end bg-black/50"
                onPress={onClose}
            >
                {/* Content – chặn sự kiện */}
                <Pressable
                    className="bg-[#121212] h-[85%] rounded-t-3xl overflow-hidden w-full"
                    onPress={() => { }}
                >
                    {/* Handle Bar */}
                    <View className="items-center pt-3 pb-2">
                        <View className="w-10 h-1 bg-gray-600 rounded-full" />
                    </View>

                    <View className="flex-1 px-4 pt-2">
                        {/* Header */}
                        <View className="flex-row items-center justify-between mb-4">
                            <View>
                                <Text className="text-white text-xl font-bold">
                                    Jam của Sakura
                                </Text>
                                <View className="flex-row items-center mt-3 gap-2">
                                    <TouchableOpacity className="w-10 h-10 rounded-full bg-neutral-800 items-center justify-center border border-neutral-700">
                                        <Ionicons name="add" size={24} color="white" />
                                    </TouchableOpacity>
                                    <Image
                                        source={require('../../../assets/Icon/ava.jpg')}
                                        className="w-10 h-10 rounded-full border-2 border-black"
                                    />
                                </View>
                            </View>

                            <View className="items-end gap-3">
                                <TouchableOpacity className="flex-row items-center gap-1">
                                    <Ionicons name="sparkles" size={16} color="white" />
                                    <Text className="text-white font-medium text-sm">
                                        Thêm bài hát
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={onClose}
                                    className="bg-transparent border border-gray-600 px-4 py-1.5 rounded-full"
                                >
                                    <Text className="text-white font-medium text-sm">
                                        Kết thúc
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Queue Title */}
                        <View className="mt-4 mb-2">
                            <Text className="text-white text-lg font-bold">
                                Danh sách chờ
                            </Text>
                            <Text className="text-gray-400 text-sm">
                                Đang phát Full
                            </Text>
                        </View>

                        {/* Song List */}
                        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                            {/* Current Song */}
                            <View className="flex-row items-center py-3 bg-white/5 rounded-lg mb-2 px-2">
                                <View className="w-12 h-12 bg-neutral-700 rounded mr-3 overflow-hidden">
                                    <View className="w-full h-full bg-yellow-600" />
                                </View>
                                <View className="flex-1">
                                    <Text
                                        className="text-[#1DB954] font-medium text-base mb-0.5"
                                        numberOfLines={1}
                                    >
                                        ... Mười Năm (Lộn Xộn 3)
                                    </Text>
                                    <Text
                                        className="text-gray-400 text-sm"
                                        numberOfLines={1}
                                    >
                                        Đen, Ngọc Linh
                                    </Text>
                                </View>
                                <TouchableOpacity>
                                    <Ionicons name="play-circle" size={32} color="white" />
                                </TouchableOpacity>
                            </View>

                            {/* Other Songs */}
                            {[
                                { title: "Buồn Không Thể Buông", artist: "Phí Phương Anh, DREAMeR, MiiNa, RIN9" },
                                { title: "Không Ra Gì", artist: "Trúc Nhân" },
                                { title: "Như Phút Ban Đầu", artist: "Noo Phước Thịnh" },
                                { title: "Em Khong The", artist: "Tien Tien, Touliver" },
                            ].map((song, bgIdx) => (
                                <View key={bgIdx} className="flex-row items-center py-3 px-2">
                                    <View className="w-12 h-12 bg-neutral-700 rounded mr-3 overflow-hidden" />
                                    <View className="flex-1">
                                        <Text
                                            className="text-white font-medium text-base mb-0.5"
                                            numberOfLines={1}
                                        >
                                            {song.title}
                                        </Text>
                                        <Text
                                            className="text-gray-400 text-sm"
                                            numberOfLines={1}
                                        >
                                            {song.artist}
                                        </Text>
                                    </View>
                                    <TouchableOpacity>
                                        <Ionicons name="menu" size={24} color="#b3b3b3" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Bottom Controls */}
                    <View className="flex-row px-4 pb-8 pt-4 justify-between gap-3 bg-[#121212]">
                        <TouchableOpacity className="flex-1 bg-[#2a2a2a] rounded-xl py-3 items-center justify-center gap-1">
                            <Ionicons name="shuffle" size={24} color="#1DB954" />
                            <Text className="text-[#1DB954] text-xs font-medium">
                                Phát ngẫu nhiên
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity className="flex-1 bg-[#2a2a2a] rounded-xl py-3 items-center justify-center gap-1">
                            <Ionicons name="repeat" size={24} color="#1DB954" />
                            <Text className="text-[#1DB954] text-xs font-medium">
                                Lặp lại
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity className="flex-1 bg-[#2a2a2a] rounded-xl py-3 items-center justify-center gap-1">
                            <Ionicons name="timer-outline" size={24} color="white" />
                            <Text className="text-white text-xs font-medium">
                                Đồng hồ hẹn giờ
                            </Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
}
