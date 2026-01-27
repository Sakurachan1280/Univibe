import React, { useState, useRef } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const SCREEN_WIDTH = Dimensions.get("window").width;

interface AddSongModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AddSongModal({ visible, onClose }: AddSongModalProps) {
  const scrollRef = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);

  const handleScroll = (event: any) => {
    const index = Math.round(
      event.nativeEvent.contentOffset.x /
      event.nativeEvent.layoutMeasurement.width
    );
    setPage(index);
  };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/60" onPress={onClose}>
        <Pressable
          className="bg-[#121212] h-[88%] rounded-t-3xl overflow-hidden"
          onPress={() => {}}
        >
          
          {/* Handle */}
          <View className="items-center pt-3 pb-2">
            <View className="w-10 h-1 bg-gray-500 rounded-full" />
          </View>

          {/* Title */}
          <Text className="text-center text-white text-xl font-bold mb-4">
            Thêm bài hát
          </Text>

          {/* Search */}
          <View className="px-4 mb-4">
            <View className="flex-row items-center bg-[#1E1E1E] rounded-xl px-3 py-2">
              <Ionicons name="search" size={20} color="#AAA" />
              <TextInput
                placeholder="Tìm kiếm"
                placeholderTextColor="#888"
                className="text-white ml-2 flex-1"
              />
            </View>
          </View>

          {/* Scroll Pager */}
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            decelerationRate={0.92}
            snapToInterval={SCREEN_WIDTH}
            snapToAlignment="start"
            className="flex-1"
          >
            {/* PAGE 1 */}
            <View style={{ width: SCREEN_WIDTH }} className="h-full px-4">
              <Text className="text-white text-lg font-bold mb-2">
                ✧ Nội dung đề xuất cho nhóm
              </Text>
              <Text className="text-gray-400 text-sm mb-4">
                Dựa trên toàn bộ các bài hát và gu nghe nhạc của bạn
              </Text>

              <ScrollView showsVerticalScrollIndicator={false}>
                {["Exit Sign", "Lạ Lùng", "Không Thể Say", "Nước Mắt Em Lau Bằng Tình Yêu", "Thằng Điên"].map((title, i) => (
                  <View key={i} className="flex-row items-center py-3">
                    <View className="w-12 h-12 bg-neutral-700 rounded mr-3" />
                    <View className="flex-1 mr-2">
                      <Text className="text-white font-medium" numberOfLines={1}>{title}</Text>
                      <Text className="text-gray-400 text-sm" numberOfLines={1}>Artist name</Text>
                    </View>
                    <TouchableOpacity>
                      <Ionicons name="add-circle-outline" size={28} color="white" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* PAGE 2 */}
            <View style={{ width: SCREEN_WIDTH }} className="h-full px-4">
              <Text className="text-white text-lg font-bold mb-2">Bài hát bạn đã thích</Text>
              <ScrollView showsVerticalScrollIndicator={false}>
                {["frog", "Video Games", "Mãi Mãi Một Tình Yêu", "Nói Đi Là Đi (Lofi)", "Mashup"].map((title, i) => (
                  <View key={i} className="flex-row items-center py-3">
                    <View className="w-12 h-12 bg-neutral-700 rounded mr-3" />
                    <View className="flex-1 mr-2">
                      <Text className="text-white font-medium" numberOfLines={1}>{title}</Text>
                      <Text className="text-gray-400 text-sm" numberOfLines={1}>Artist name</Text>
                    </View>
                    <TouchableOpacity>
                      <Ionicons name="add-circle-outline" size={28} color="white" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          </ScrollView>

          {/* PAGE DOTS */}
          <View className="flex-row justify-center items-center gap-2 py-4 bg-[#121212]">
            <View
              className={page === 0 ? "w-2 h-2 rounded-full bg-white" : "w-2 h-2 rounded-full bg-gray-500"}
            />
            <View
              className={page === 1 ? "w-2 h-2 rounded-full bg-white" : "w-2 h-2 rounded-full bg-gray-500"}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
