import { useState, useEffect, useRef, memo } from "react";
import { useRoute } from "@react-navigation/native";
import { View, Text, TouchableOpacity, Dimensions, ActivityIndicator, Alert, StyleSheet, Modal, ScrollView } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useAppNavigation } from "../../navigation/useAppNavigation";
import Slider from "@react-native-community/slider";
import { SafeAreaView } from "react-native-safe-area-context";
import musicAPI, { Song } from "../../API/musicAPI";
import { LinearGradient } from "expo-linear-gradient";
import { useMusic } from "../../context/MusicContext";
import { usePlaybackProgress } from "../../context/PlaybackProgressContext";
import { toggleLikeSong, getLikedSongs } from "../../API/libraryAPI";

const { width, height } = Dimensions.get("window");

// ─── Progress/Slider tách riêng: chỉ re-render theo currentTime ──────────────
const PlayerProgressBar = memo(({ handleSeek }: { handleSeek: (v: number) => Promise<void> }) => {
  const { currentTime, duration } = usePlaybackProgress();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <View className="px-8 mt-8">
      <Slider
        minimumValue={0}
        maximumValue={duration || 1}
        value={currentTime}
        onValueChange={() => { }}
        onSlidingComplete={handleSeek}
        minimumTrackTintColor="#ec4899"
        maximumTrackTintColor="rgba(255,255,255,0.2)"
        thumbTintColor="#ffffff"
        style={styles.slider}
      />
      <View className="flex-row justify-between mt-2">
        <Text className="text-white/60 text-sm font-medium">{formatTime(currentTime)}</Text>
        <Text className="text-white/60 text-sm font-medium">{formatTime(duration)}</Text>
      </View>
    </View>
  );
});

// ─── Album Art tách riêng: chỉ re-render khi đổi bài ─────────────────────────
const AlbumArt = memo(({ coverImage }: { coverImage?: string }) => (
  <View className="items-center mt-8">
    <View style={styles.albumArtContainer}>
      {coverImage ? (
        <Image
          source={coverImage}
          style={styles.albumArt}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
      ) : (
        <View style={[styles.albumArt, styles.placeholderAlbumArt]}>
          <Ionicons name="musical-notes" size={100} color="#ec4899" />
        </View>
      )}
    </View>
  </View>
));

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function MusicPlayerScreen() {
  const navigation = useAppNavigation();
  const route = useRoute<any>();
  const {
    isPlaying,
    currentSong: song,
    queue,
    currentIndex,
    loading,
    isShuffle,
    repeatMode,
    playSong,
    togglePlayPause,
    handleNext,
    handlePrevious,
    handleSeek,
    toggleShuffle,
    toggleRepeat,
    setMiniPlayerVisible,
    setCurrentIndex,
  } = useMusic();

  const [queueModalVisible, setQueueModalVisible] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const initialSong = route.params?.song;
    if (initialSong && initialSong._id !== song?._id) {
      loadQueueWithInitial(initialSong);
    } else if (!song) {
      loadQueue();
    }
    setMiniPlayerVisible(false);
    return () => { setMiniPlayerVisible(true); };
  }, [route.params?.song]);

  useEffect(() => {
    if (song?._id) checkIfLiked();
  }, [song?._id]);

  const checkIfLiked = async () => {
    try {
      const likedSongs = await getLikedSongs();
      setIsLiked(likedSongs.some(s => s._id === song?._id));
    } catch (error) {
      console.error("Error checking if song is liked:", error);
    }
  };

  const loadQueueWithInitial = async (initialSong: Song) => {
    try {
      const randomSongs = await musicAPI.getRandomSongs(19);
      const filteredRandom = randomSongs.filter(s => s._id !== initialSong._id);
      await playSong(initialSong, [initialSong, ...filteredRandom]);
    } catch (error) {
      console.error("Error loading queue with initial song:", error);
      await playSong(initialSong, [initialSong]);
    }
  };

  const loadQueue = async () => {
    try {
      const songs = await musicAPI.getRandomSongs(20);
      if (songs.length > 0) {
        await playSong(songs[0], songs);
      } else {
        Alert.alert("Lỗi", "Không có bài hát nào");
      }
    } catch (error) {
      console.error("Error loading queue:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách bài hát");
    }
  };

  const toggleLike = async () => {
    if (!song?._id) return;
    try {
      setIsLiked(prev => !prev);
      const result = await toggleLikeSong(song._id);
      console.log(result.liked ? "Added to liked songs" : "Removed from liked songs");
    } catch (error: any) {
      console.error("Error toggling like:", error);
      setIsLiked(prev => !prev);
      Alert.alert("Lỗi", "Không thể cập nhật trạng thái yêu thích. Vui lòng thử lại.");
    }
  };

  if (loading && !song) {
    return (
      <LinearGradient colors={["#1a0520", "#0f0314", "#000000"]} style={{ flex: 1 }}>
        <SafeAreaView className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#ec4899" />
          <Text className="text-white mt-4 text-lg">Đang tải bài hát...</Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const artistNames = song?.artist_ids?.map(a => a.name).join(", ") || "Unknown Artist";

  const handleArtistPress = (artistId: string, artistName: string) => {
    navigation.navigate("ArtistDetail", { artistId, artistName });
  };

  return (
    <LinearGradient colors={["#1a0520", "#2d1b3d", "#4a1942", "#000000"]} style={{ flex: 1 }}>
      <SafeAreaView className="flex-1">
        <View className="flex-1 justify-between">
          {/* HEADER */}
          <View className="px-6 pt-2 pb-4 flex-row justify-between items-center">
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
              <Ionicons name="chevron-down" size={28} color="white" />
            </TouchableOpacity>
            <View className="flex-1 mx-4">
              <Text className="text-white/60 text-xs text-center uppercase tracking-widest">Đang phát từ</Text>
              <Text className="text-white text-sm font-semibold text-center mt-1" numberOfLines={1}>{artistNames}</Text>
            </View>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="ellipsis-horizontal" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* ALBUM ART — memo, chỉ re-render khi đổi bài */}
          <AlbumArt coverImage={song?.cover_image} />

          {/* SONG INFO */}
          <View className="px-8 mt-10">
            <View className="flex-row justify-between items-start">
              <View className="flex-1 mr-4">
                <Text className="text-white text-3xl font-bold" numberOfLines={2}>{song?.title || "Loading..."}</Text>
                <View className="flex-row flex-wrap mt-2">
                  {song?.artist_ids && song.artist_ids.length > 0 ? (
                    song.artist_ids.map((artist, idx) => (
                      <View key={artist._id} className="flex-row items-center">
                        <TouchableOpacity activeOpacity={0.7} onPress={() => handleArtistPress(artist._id, artist.name)}>
                          <Text className="text-white/70 text-lg underline">{artist.name}</Text>
                        </TouchableOpacity>
                        {idx < song.artist_ids!.length - 1 && (
                          <Text className="text-white/70 text-lg">{', '}</Text>
                        )}
                      </View>
                    ))
                  ) : (
                    <Text className="text-white/70 text-lg">Unknown Artist</Text>
                  )}
                </View>
              </View>
              <TouchableOpacity onPress={toggleLike} style={styles.likeButton}>
                <Ionicons name={isLiked ? "heart" : "heart-outline"} size={32} color={isLiked ? "#ec4899" : "white"} />
              </TouchableOpacity>
            </View>
          </View>

          {/* PROGRESS BAR — tách riêng, không kéo album art re-render */}
          <PlayerProgressBar handleSeek={handleSeek} />

          {/* PLAYBACK CONTROLS */}
          <View className="px-8 mt-6">
            <View className="flex-row justify-between items-center mb-8">
              <TouchableOpacity onPress={toggleShuffle} style={styles.secondaryControl}>
                <Ionicons name="shuffle" size={24} color={isShuffle ? "#ec4899" : "rgba(255,255,255,0.6)"} />
              </TouchableOpacity>

              <TouchableOpacity onPress={handlePrevious} style={styles.skipButton}>
                <Ionicons name="play-skip-back" size={36} color="white" />
              </TouchableOpacity>

              <TouchableOpacity onPress={togglePlayPause} disabled={!song} style={styles.playButton}>
                {loading ? (
                  <ActivityIndicator size="large" color="white" />
                ) : (
                  <LinearGradient colors={["#ec4899", "#db2777"]} style={styles.playButtonGradient}>
                    <Ionicons name={isPlaying ? "pause" : "play"} size={40} color="white" style={{ marginLeft: isPlaying ? 0 : 4 }} />
                  </LinearGradient>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={handleNext} style={styles.skipButton}>
                <Ionicons name="play-skip-forward" size={36} color="white" />
              </TouchableOpacity>

              <TouchableOpacity onPress={toggleRepeat} style={styles.secondaryControl}>
                <Ionicons name="repeat" size={24} color={repeatMode !== "off" ? "#ec4899" : "rgba(255,255,255,0.6)"} />
                {repeatMode === "one" && (
                  <View style={styles.repeatOneBadge}>
                    <Text style={styles.repeatOneText}>1</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* BOTTOM ACTIONS */}
          <View className="flex-row justify-between items-center px-8 pb-6">
            <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate("CreateRoom")} style={styles.bottomAction}>
              <Ionicons name="tv-outline" size={26} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.bottomAction}>
              <Ionicons name="share-outline" size={26} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setQueueModalVisible(true)} style={styles.bottomAction}>
              <Ionicons name="list" size={26} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* QUEUE MODAL */}
      <Modal visible={queueModalVisible} animationType="slide" transparent={true} onRequestClose={() => setQueueModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Danh sách phát</Text>
              <TouchableOpacity onPress={() => setQueueModalVisible(false)} style={styles.closeButton}>
                <Ionicons name="close" size={28} color="white" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.queueList}>
              {queue.map((item, index) => {
                const isCurrentSong = index === currentIndex;
                const itemArtist = item.artist_ids?.map(a => a.name).join(", ") || "Unknown Artist";
                return (
                  <TouchableOpacity
                    key={item._id}
                    style={[styles.queueItem, isCurrentSong && styles.currentQueueItem]}
                    onPress={() => { setCurrentIndex(index); setQueueModalVisible(false); }}
                  >
                    <View style={styles.queueItemLeft}>
                      {item.cover_image ? (
                        <Image source={{ uri: item.cover_image }} style={styles.queueItemImage} />
                      ) : (
                        <View style={styles.queueItemImagePlaceholder}>
                          <Ionicons name="musical-notes" size={20} color="#ec4899" />
                        </View>
                      )}
                      <View style={styles.queueItemInfo}>
                        <Text style={[styles.queueItemTitle, isCurrentSong && styles.currentQueueItemText]} numberOfLines={1}>
                          {item.title}
                        </Text>
                        <Text style={styles.queueItemArtist} numberOfLines={1}>{itemArtist}</Text>
                      </View>
                    </View>
                    {isCurrentSong && <Ionicons name="volume-high" size={20} color="#ec4899" />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  headerButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255, 255, 255, 0.1)", justifyContent: "center", alignItems: "center" },
  albumArtContainer: { shadowColor: "#ec4899", shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.5, shadowRadius: 30, elevation: 20 },
  albumArt: { width: width * 0.85, height: width * 0.85, borderRadius: 20 },
  placeholderAlbumArt: { backgroundColor: "rgba(236, 72, 153, 0.15)", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(236, 72, 153, 0.3)" },
  likeButton: { width: 50, height: 50, borderRadius: 25, backgroundColor: "rgba(255, 255, 255, 0.1)", justifyContent: "center", alignItems: "center" },
  slider: { height: 4 },
  secondaryControl: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center", position: "relative" },
  skipButton: { width: 50, height: 50, borderRadius: 25, justifyContent: "center", alignItems: "center" },
  playButton: { width: 80, height: 80, borderRadius: 40, justifyContent: "center", alignItems: "center", shadowColor: "#ec4899", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.6, shadowRadius: 16, elevation: 12 },
  playButtonGradient: { width: 80, height: 80, borderRadius: 40, justifyContent: "center", alignItems: "center" },
  repeatOneBadge: { position: "absolute", top: -2, right: -2, width: 14, height: 14, borderRadius: 7, backgroundColor: "#ec4899", justifyContent: "center", alignItems: "center" },
  repeatOneText: { color: "white", fontSize: 9, fontWeight: "bold" },
  bottomAction: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255, 255, 255, 0.1)", justifyContent: "center", alignItems: "center" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.8)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#1a0a2e", borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: height * 0.7, paddingBottom: 20 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "rgba(255, 255, 255, 0.1)" },
  modalTitle: { color: "white", fontSize: 20, fontWeight: "bold" },
  closeButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255, 255, 255, 0.1)", justifyContent: "center", alignItems: "center" },
  queueList: { paddingHorizontal: 16 },
  queueItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12, paddingHorizontal: 12, borderRadius: 12, marginVertical: 4 },
  currentQueueItem: { backgroundColor: "rgba(236, 72, 153, 0.2)" },
  queueItemLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  queueItemImage: { width: 50, height: 50, borderRadius: 8 },
  queueItemImagePlaceholder: { width: 50, height: 50, borderRadius: 8, backgroundColor: "rgba(236, 72, 153, 0.15)", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(236, 72, 153, 0.3)" },
  queueItemInfo: { marginLeft: 12, flex: 1 },
  queueItemTitle: { color: "white", fontSize: 15, fontWeight: "600" },
  currentQueueItemText: { color: "#ec4899" },
  queueItemArtist: { color: "rgba(255, 255, 255, 0.6)", fontSize: 13, marginTop: 2 },
});
