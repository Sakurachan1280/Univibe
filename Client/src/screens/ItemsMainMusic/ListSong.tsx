import React, { useState } from 'react';
import {View, Text, Image, TouchableOpacity, ScrollView, StatusBar} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppNavigation } from "../../navigation/useAppNavigation";

export default function ListSongScreen() {
    const navigation = useAppNavigation();
    const [isShuffled, setIsShuffled] = useState(false);
    return (
        <SafeAreaView className="flex-1 bg-black" edges={['top']}>
            <StatusBar barStyle="light-content" />
            
            <ScrollView className="flex-1">
                {/* Header with Purple Background */}
                <View className="bg-[#2E4C9E] pb-6">
                    {/* Top Navigation */}
                    <View className="flex-row items-center justify-between px-4 pt-2">
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Ionicons name="chevron-back" size={28} color="white" />
                        </TouchableOpacity>
                    </View>

                    {/* Playlist Cover & Info */}
                    <View className="mt-8 px-4">
                        {/*Playlist Art - Full width with gray background */}
                        <View className="items-center mb-8">
                            <View className="w-72 h-72 rounded-lg shadow-2xl bg-gray-600"></View>
                        </View>
                        
                        {/*Playlist info - aligned to left */}
                        <View className="items-start">
                            <Text className="text-white text-2xl font-bold mb-2">Đầu tư HDPE là ngon luôn</Text>

                            <View className="flex-row items-center mb-2">
                                <Image source={require('../../../assets/Icon/ava.jpg')}className="w-6 h-6 rounded-full mr-2"/>
                                <Text className="text-white font-medium">Sakura</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Action Buttons */}
                <View className="bg-black px-4 pt-6 pb-4">
                    <View className="flex-row items-center justify-between mb-6">
                        {/* Left Actions */}
                        <View className="flex-row items-center space-x-6 flex-1">
                            <TouchableOpacity>
                                <Ionicons name="add-circle-outline" size={32} color="#b3b3b3" />
                            </TouchableOpacity>
                            <TouchableOpacity>
                                <Ionicons name="arrow-down-circle-outline" size={32} color="#b3b3b3" />
                            </TouchableOpacity>
                            <TouchableOpacity>
                                <Ionicons name="share-outline" size={28} color="#b3b3b3" />
                            </TouchableOpacity>
                        </View>

                        {/* Right Actions */}
                        <View className="flex-row items-center space-x-6">
                            <TouchableOpacity
                                onPress={() => setIsShuffled(!isShuffled)}
                            >
                                <Ionicons
                                    name="shuffle"
                                    size={28}
                                    color={isShuffled ? "#1ed760" : "#b3b3b3"}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity className="w-14 h-14 bg-green-500 rounded-full items-center justify-center">
                                <Ionicons name="play" size={28} color="black" style={{ marginLeft: 2 }} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Horizontal Scrollable Buttons */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        className="mb-4"
                    >
                        <TouchableOpacity className="bg-neutral-800 rounded-full px-4 py-2 mr-3 flex-row items-center">
                            <Ionicons name="add" size={20} color="white" />
                            <Text className="text-white ml-2 font-medium">Thêm</Text>
                        </TouchableOpacity>

                        <TouchableOpacity className="bg-neutral-800 rounded-full px-4 py-2 mr-3 flex-row items-center">
                            <Ionicons name="swap-vertical" size={20} color="white" />
                            <Text className="text-white ml-2 font-medium">Phối</Text>
                        </TouchableOpacity>

                        <TouchableOpacity className="bg-neutral-800 rounded-full px-4 py-2 mr-3 flex-row items-center">
                            <Ionicons name="menu" size={20} color="white" />
                            <Text className="text-white ml-2 font-medium">Chỉnh sửa</Text>
                        </TouchableOpacity>

                        <TouchableOpacity className="bg-neutral-800 rounded-full px-4 py-2 mr-3 flex-row items-center">
                            <Ionicons name="layers" size={20} color="white" />
                            <Text className="text-white ml-2 font-medium">Sắp xếp</Text>
                        </TouchableOpacity>

                        <TouchableOpacity className="bg-neutral-800 rounded-full px-4 py-2 flex-row items-center">
                            <Ionicons name="create-outline" size={20} color="white" />
                            <Text className="text-white ml-2 font-medium">Tên và thông tin chi tiết</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>

                {/* Song List */}
                <View className="px-4">
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
                    ].map((item, index) => (
                        <TouchableOpacity
                            key={item.id}
                            className="flex-row items-center justify-between py-3"
                            activeOpacity={0.7}
                            onPress={() => navigation.navigate("MusicPlayer")}
                        >
                            <View className="flex-row items-center flex-1">
                                <View className="w-14 h-14 rounded bg-neutral-700 mr-3 items-center justify-center">
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
                                <Ionicons name="ellipsis-horizontal" size={24} color="white" />
                            </TouchableOpacity>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};