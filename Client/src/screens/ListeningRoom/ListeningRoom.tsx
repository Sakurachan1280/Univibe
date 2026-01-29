import { View, Text, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppNavigation } from "../../navigation/useAppNavigation";
import { SafeAreaView } from "react-native-safe-area-context";
import Slider from "@react-native-community/slider";
import { useState } from "react";

export default function ListeningRoomScreen() {
  const navigation = useAppNavigation();
  const [message, setMessage] = useState("");
  const [isHidden, setIsHidden] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* HEADER */}
      <View className="px-4 py-4 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-semibold ml-4">
          Cùng nghe album của Lowg
        </Text>
      </View>

      <ScrollView className="flex-1">
        {/* SONG PLAYER SECTION */}
        <View className="px-4 mt-6">
          <View className="flex-row items-start">
            {/* Album Art */}
            <View className="w-24 h-24 bg-neutral-600 rounded-lg"></View>

            {/* Song Info and Controls */}
            <View className="ml-4 flex-1">
              <Text className="text-white text-lg font-bold">Người Đi Bao</Text>
              <Text className="text-gray-400 text-sm mb-3">tlinh, Low G</Text>

              {/* Slider */}
              <View className="mb-2">
                <Slider
                  minimumValue={0}
                  maximumValue={193}
                  value={currentTime}
                  minimumTrackTintColor="#fff"
                  maximumTrackTintColor="#777"
                  onValueChange={setCurrentTime}
                  thumbTintColor="#fff"
                  style={{ width: '100%', height: 20 }}
                />
                {/* Time Display */}
                <View className="flex-row justify-between">
                  <Text className="text-gray-400 text-xs">
                    {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')}
                  </Text>
                  <Text className="text-white text-xs">3:13</Text>
                </View>
              </View>

              {/* Play Button */}
              <View className="items-center mt-1">
                <TouchableOpacity onPress={() => setIsPlaying(!isPlaying)}>
                  <Ionicons 
                    name={isPlaying ? "pause-circle" : "play-circle"} 
                    size={40} 
                    color="white" 
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>


        {/* HOST INFO */}
        <View className="mx-4 mt-8 flex-row items-center justify-between">
          <View className="flex-row items-center">
            {/* Avatar */}
            <View className="w-12 h-12 bg-neutral-600 rounded-full"></View>
            
            <View className="ml-3">
              <Text className="text-white font-semibold">Bá Minh</Text>
              <Text className="text-gray-400 text-xs">Được tạo vài giây trước</Text>
            </View>
          </View>

          <TouchableOpacity>
            <Ionicons name="share-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* HIDE CHAT TOGGLE */}
        <View className="mx-4 mt-4 flex-row items-center justify-between">
          <Text className="text-white text-sm">Ẩn chat</Text>
          <TouchableOpacity
            className={`w-12 h-7 rounded-full flex-row items-center px-1 ${
              isHidden ? "bg-indigo-500 justify-end" : "bg-gray-600 justify-start"
            }`}
            onPress={() => setIsHidden(!isHidden)}
          >
            <View className="w-5 h-5 bg-white rounded-full"></View>
          </TouchableOpacity>
        </View>

        {/* CHAT MESSAGES - Only show when not hidden */}
        {!isHidden && (
          <View className="mx-4 mt-8 space-y-4">
            {/* Message 1 */}
            <View className="flex-row items-start">
              <View className="w-10 h-10 bg-neutral-600 rounded-full"></View>
              <View className="ml-3 flex-1">
                <Text className="text-white font-semibold text-sm">Bá Minh</Text>
                <Text className="text-gray-300 text-sm">Nhạc hay quá</Text>
              </View>
            </View>

            {/* System Message - Centered, no background */}
            <View className="items-center py-2">
              <Text className="text-gray-400 text-sm">Bá Minh vừa tham gia phòng</Text>
            </View>

            {/* Message 2 */}
            <View className="flex-row items-start">
              <View className="w-10 h-10 bg-neutral-600 rounded-full"></View>
              <View className="ml-3 flex-1">
                <Text className="text-white font-semibold text-sm">Bá Minh</Text>
                <Text className="text-gray-300 text-sm">Đầu tư HDPE là ngon luôn</Text>
              </View>
            </View>
          </View>
        )}

        <View className="h-24"></View>
      </ScrollView>

      {/* MESSAGE INPUT */}
      
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View className="px-4 pb-4 flex-row items-center bg-black border-t border-neutral-800">
          <TouchableOpacity className="mr-3">
            <Ionicons name="happy-outline" size={28} color="white" />
          </TouchableOpacity>

          <TextInput
            className="flex-1 bg-neutral-900 text-white rounded-full px-4 py-3 mr-3"
            placeholder="Chat gì đó"
            placeholderTextColor="#666"
            value={message}
            onChangeText={setMessage}
          />

          <TouchableOpacity>
            <Ionicons name="send" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}