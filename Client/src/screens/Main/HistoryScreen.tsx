import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { getListeningHistory, ListeningHistoryItem } from "../../API/libraryAPI";
import { useMusic } from "../../context/MusicContext";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export default function HistoryScreen() {
  const navigation = useNavigation();
  const { playSong } = useMusic();
  const [history, setHistory] = useState<ListeningHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await getListeningHistory();
      setHistory(data);
    } catch (error) {
      console.error("Error loading history:", error);
      Alert.alert("Lỗi", "Không thể tải lịch sử nghe nhạc");
    } finally {
      setLoading(false);
    }
  };

  const handlePlaySong = async (item: ListeningHistoryItem) => {
    if (item.song_id) {
        // Create a queue from the history list, filtering out items without valid songs
        const queue = history
            .map(h => h.song_id)
            .filter(s => s != null);
        
        // Find the index of the selected song in the new queue to play correctly
        // However, history might have duplicate songs. 
        // For simplicity, just play the selected song and set the queue as the history list (unique songs might be better but let's stick to simple first)
        // Actually, playing from history usually just plays that song. 
        // Let's play that song and set the queue to include this song and maybe some context.
        // For now, just play the song and maybe set queue to just this song or all distinct songs in history.
        // Let's just play the song with itself as queue for now to avoid complexity with duplicates in history.
        await playSong(item.song_id, [item.song_id]);
    }
  };

  const renderItem = ({ item }: { item: ListeningHistoryItem }) => {
    if (!item.song_id) return null; // Skip if song data is missing

    const song = item.song_id;
    const artistNames = song.artist_ids?.map((a: any) => a.name).join(", ") || "Unknown Artist";

    return (
      <TouchableOpacity
        className="flex-row items-center p-3 mb-2 bg-neutral-900/50 rounded-xl"
        onPress={() => handlePlaySong(item)}
      >
        <Image
          source={song.cover_image || "https://via.placeholder.com/50"}
          style={{ width: 56, height: 56, borderRadius: 8 }}
          cachePolicy="memory-disk"
        />
        <View className="flex-1 ml-3">
            <Text className="text-white font-semibold text-base" numberOfLines={1}>
                {song.title}
            </Text>
            <Text className="text-gray-400 text-sm" numberOfLines={1}>
                {artistNames}
            </Text>
            <Text className="text-gray-500 text-xs mt-1">
                {format(new Date(item.timestamp), "HH:mm dd/MM/yyyy", { locale: vi })}
            </Text>
        </View>
        <Ionicons name="play-circle-outline" size={32} color="#ec4899" />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-black" edges={["top"]}>
      {/* HEADER */}
      <View className="flex-row items-center px-4 py-3 border-b border-neutral-800">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold ml-4">Lịch sử nghe nhạc</Text>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#ec4899" />
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <View className="items-center mt-20">
              <Ionicons name="time-outline" size={64} color="#333" />
              <Text className="text-gray-500 mt-4 text-center">Chưa có lịch sử nghe nhạc</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
