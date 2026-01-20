import { View, Text, Image, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppNavigation } from "../../navigation/useAppNavigation";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";

export default function CreateRoomScreen() {
  const navigation = useAppNavigation();
  const [roomName, setRoomName] = useState("");
  const [selectedAlbum, setSelectedAlbum] = useState("Chọn album");
  const [showAlbumPicker, setShowAlbumPicker] = useState(false);

  const albums = ["L2K", "Bảo Tàng Của Nuối Tiếc", "Space City"];

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* HEADER */}
      <View className="px-4 py-4 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-semibold ml-4">
          Tạo phòng nghe chung
        </Text>
      </View>

      {/* SONG INFO CARD */}
      <View className="mx-4 mt-4 bg-neutral-800 rounded-2xl p-4 flex-row items-center">
        {/* Grey placeholder image */}
        <View className="w-24 h-24 bg-neutral-600 rounded-lg"></View>

        {/* Song details */}
        <View className="ml-4 flex-1">
          <Text className="text-white text-lg font-bold">Người Đi Bao</Text>
          <Text className="text-gray-400 text-sm">tlinh, Low G</Text>
        </View>
      </View>

      {/* FORM SECTION */}
      <View className="mx-4 mt-6 bg-white rounded-3xl p-6">
        {/* Room Name */}
        <View className="mb-6">
          <Text className="text-black text-base font-semibold mb-2">
            1. Tên phòng
          </Text>
          <TextInput
            className="bg-gray-100 rounded-lg px-4 py-3 text-black"
            placeholder="Cùng nghe Album của Lowg"
            placeholderTextColor="#999"
            value={roomName}
            onChangeText={setRoomName}
          />
        </View>

        {/* Album Selection */}
        <View>
          <Text className="text-black text-base font-semibold mb-2">
            2. Chọn Album theo bài nhạc
          </Text>
          
          <TouchableOpacity
            className="bg-gray-100 rounded-lg px-4 py-3 flex-row justify-between items-center"
            onPress={() => setShowAlbumPicker(!showAlbumPicker)}
          >
            <Text className="text-gray-700">{selectedAlbum}</Text>
            <Ionicons 
              name={showAlbumPicker ? "chevron-up" : "chevron-down"} 
              size={20} 
              color="#666" 
            />
          </TouchableOpacity>

          {/* Dropdown List */}
          {showAlbumPicker && (
            <View className="mt-2 bg-gray-100 rounded-lg overflow-hidden">
              {albums.map((album, index) => (
                <TouchableOpacity
                  key={index}
                  className="px-4 py-3 border-b border-gray-200"
                  onPress={() => {
                    setSelectedAlbum(album);
                    setShowAlbumPicker(false);
                  }}
                >
                  <Text className="text-gray-700">{album}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Create Room Button */}
        <TouchableOpacity className="bg-indigo-500 rounded-full py-4 mt-8" activeOpacity={0.5} onPress={() => navigation.navigate("ListeningRoom")}>
          <Text className="text-white text-center text-base font-semibold">
            Tạo phòng
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}