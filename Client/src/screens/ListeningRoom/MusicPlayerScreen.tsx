import { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Dimensions, Image, ActivityIndicator, Alert, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppNavigation } from "../../navigation/useAppNavigation";
import Slider from "@react-native-community/slider";
import { SafeAreaView } from "react-native-safe-area-context";
import { Audio } from "expo-av";
import musicAPI, { Song } from "../../API/musicAPI";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

export default function MusicPlayerScreen() {
  const navigation = useAppNavigation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const [queue, setQueue] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  
  const soundRef = useRef<Audio.Sound | null>(null);
  const isSeekingRef = useRef(false);

  // Load random songs on mount
  useEffect(() => {
    loadQueue();
    
    return () => {
      // Cleanup audio when component unmounts
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  // Load current song when queue or index changes
  useEffect(() => {
    if (queue.length > 0) {
      loadSong(queue[currentIndex]);
    }
  }, [currentIndex, queue]);

  const loadQueue = async () => {
    try {
      setLoading(true);
      const songs = await musicAPI.getRandomSongs(20);
      if (songs.length > 0) {
        setQueue(songs);
        setCurrentIndex(0);
      } else {
        Alert.alert("Lỗi", "Không có bài hát nào");
      }
    } catch (error) {
      console.error("Error loading queue:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách bài hát");
    } finally {
      setLoading(false);
    }
  };

  const loadSong = async (songData: Song) => {
    try {
      setLoading(true);
      setSong(songData);

      // Unload previous sound
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      // Load new sound
      const { sound } = await Audio.Sound.createAsync(
        { uri: songData.file_url },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );

      soundRef.current = sound;
      setLoading(false);

      // Log play action
      await musicAPI.logAction({
        song_id: songData._id,
        action_type: "play",
      });
    } catch (error) {
      console.error("Error loading song:", error);
      Alert.alert("Lỗi", "Không thể phát bài hát này");
      setLoading(false);
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setDuration(status.durationMillis / 1000);
      
      if (!isSeekingRef.current) {
        setCurrentTime(status.positionMillis / 1000);
      }

      setIsPlaying(status.isPlaying);

      // Auto play next song when current song finishes
      if (status.didJustFinish) {
        handleNext();
      }
    }
  };

  const togglePlayPause = async () => {
    if (!soundRef.current) return;

    try {
      if (isPlaying) {
        await soundRef.current.pauseAsync();
        if (song) {
          await musicAPI.logAction({
            song_id: song._id,
            action_type: "pause",
            duration_listened: currentTime,
          });
        }
      } else {
        await soundRef.current.playAsync();
        if (song) {
          await musicAPI.logAction({
            song_id: song._id,
            action_type: "play",
          });
        }
      }
    } catch (error) {
      console.error("Error toggling play/pause:", error);
    }
  };

  const handleSeek = async (value: number) => {
    if (!soundRef.current) return;

    try {
      isSeekingRef.current = true;
      setCurrentTime(value);
      await soundRef.current.setPositionAsync(value * 1000);
      
      if (song) {
        await musicAPI.logAction({
          song_id: song._id,
          action_type: "seek",
          duration_listened: value,
        });
      }
    } catch (error) {
      console.error("Error seeking:", error);
    } finally {
      isSeekingRef.current = false;
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      if (song) {
        musicAPI.logAction({
          song_id: song._id,
          action_type: "skip",
        });
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < queue.length - 1) {
      setCurrentIndex(currentIndex + 1);
      if (song) {
        musicAPI.logAction({
          song_id: song._id,
          action_type: "skip",
        });
      }
    }
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
    // TODO: Implement API call to like/unlike song
  };

  const toggleShuffle = () => {
    setIsShuffle(!isShuffle);
    // TODO: Implement shuffle logic
  };

  const toggleRepeat = () => {
    const modes: Array<'off' | 'all' | 'one'> = ['off', 'all', 'one'];
    const currentModeIndex = modes.indexOf(repeatMode);
    const nextMode = modes[(currentModeIndex + 1) % modes.length];
    setRepeatMode(nextMode);
    // TODO: Implement repeat logic
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading && !song) {
    return (
      <LinearGradient
        colors={['#1a0a2e', '#0f0519', '#000000']}
        style={{ flex: 1 }}
      >
        <SafeAreaView className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#a855f7" />
          <Text className="text-white mt-4 text-lg">Đang tải bài hát...</Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const artistNames = song?.artist_ids?.map(a => a.name).join(", ") || "Unknown Artist";

  return (
    <LinearGradient
      colors={['#1a0a2e', '#16213e', '#0f3460', '#000000']}
      style={{ flex: 1 }}
    >
      <SafeAreaView className="flex-1">
        <View className="flex-1 justify-between">
          {/* HEADER */}
          <View className="px-6 pt-2 pb-4 flex-row justify-between items-center">
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={styles.headerButton}
            >
              <Ionicons name="chevron-down" size={28} color="white" />
            </TouchableOpacity>

            <View className="flex-1 mx-4">
              <Text className="text-white/60 text-xs text-center uppercase tracking-widest">
                Đang phát từ
              </Text>
              <Text className="text-white text-sm font-semibold text-center mt-1" numberOfLines={1}>
                {artistNames}
              </Text>
            </View>

            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="ellipsis-horizontal" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* ALBUM ART WITH ENHANCED STYLING */}
          <View className="items-center mt-8">
            <View style={styles.albumArtContainer}>
              {song?.cover_image ? (
                <Image
                  source={{ uri: song.cover_image }}
                  style={styles.albumArt}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.albumArt, styles.placeholderAlbumArt]}>
                  <Ionicons name="musical-notes" size={100} color="#a855f7" />
                </View>
              )}
            </View>
          </View>

          {/* SONG INFO */}
          <View className="px-8 mt-10">
            <View className="flex-row justify-between items-start">
              <View className="flex-1 mr-4">
                <Text className="text-white text-3xl font-bold" numberOfLines={2}>
                  {song?.title || "Loading..."}
                </Text>
                <Text className="text-white/70 text-lg mt-2" numberOfLines={1}>
                  {artistNames}
                </Text>
              </View>
              <TouchableOpacity 
                onPress={toggleLike}
                style={styles.likeButton}
              >
                <Ionicons 
                  name={isLiked ? "heart" : "heart-outline"} 
                  size={32} 
                  color={isLiked ? "#ef4444" : "white"} 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* PROGRESS BAR */}
          <View className="px-8 mt-8">
            <Slider
              minimumValue={0}
              maximumValue={duration || 1}
              value={currentTime}
              onValueChange={setCurrentTime}
              onSlidingComplete={handleSeek}
              minimumTrackTintColor="#a855f7"
              maximumTrackTintColor="rgba(255,255,255,0.2)"
              thumbTintColor="#ffffff"
              style={styles.slider}
              disabled={!song}
            />
            <View className="flex-row justify-between mt-2">
              <Text className="text-white/60 text-sm font-medium">
                {formatTime(currentTime)}
              </Text>
              <Text className="text-white/60 text-sm font-medium">
                {formatTime(duration)}
              </Text>
            </View>
          </View>

          {/* PLAYBACK CONTROLS */}
          <View className="px-8 mt-6">
            <View className="flex-row justify-between items-center mb-8">
              <TouchableOpacity 
                onPress={toggleShuffle}
                style={styles.secondaryControl}
              >
                <Ionicons 
                  name="shuffle" 
                  size={24} 
                  color={isShuffle ? "#a855f7" : "rgba(255,255,255,0.6)"} 
                />
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={handlePrevious}
                disabled={currentIndex === 0}
                style={styles.skipButton}
              >
                <Ionicons 
                  name="play-skip-back" 
                  size={36} 
                  color={currentIndex === 0 ? "rgba(255,255,255,0.3)" : "white"} 
                />
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={togglePlayPause} 
                disabled={!song}
                style={styles.playButton}
              >
                {loading ? (
                  <ActivityIndicator size="large" color="white" />
                ) : (
                  <LinearGradient
                    colors={['#a855f7', '#7c3aed']}
                    style={styles.playButtonGradient}
                  >
                    <Ionicons 
                      name={isPlaying ? "pause" : "play"} 
                      size={40} 
                      color="white"
                      style={{ marginLeft: isPlaying ? 0 : 4 }}
                    />
                  </LinearGradient>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={handleNext}
                disabled={currentIndex === queue.length - 1}
                style={styles.skipButton}
              >
                <Ionicons 
                  name="play-skip-forward" 
                  size={36} 
                  color={currentIndex === queue.length - 1 ? "rgba(255,255,255,0.3)" : "white"} 
                />
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={toggleRepeat}
                style={styles.secondaryControl}
              >
                <Ionicons 
                  name={repeatMode === 'one' ? "repeat-outline" : "repeat"} 
                  size={24} 
                  color={repeatMode !== 'off' ? "#a855f7" : "rgba(255,255,255,0.6)"} 
                />
                {repeatMode === 'one' && (
                  <View style={styles.repeatOneBadge}>
                    <Text style={styles.repeatOneText}>1</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* BOTTOM ACTIONS */}
          <View className="flex-row justify-between items-center px-8 pb-6">
            <TouchableOpacity 
              activeOpacity={0.7} 
              onPress={() => navigation.navigate("CreateRoom")}
              style={styles.bottomAction}
            >
              <Ionicons name="tv-outline" size={26} color="white" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.bottomAction}>
              <Ionicons name="share-outline" size={26} color="white" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.bottomAction}>
              <Ionicons name="list" size={26} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  albumArtContainer: {
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 20,
  },
  albumArt: {
    width: width * 0.85,
    height: width * 0.85,
    borderRadius: 20,
  },
  placeholderAlbumArt: {
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
  },
  likeButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  slider: {
    height: 40,
  },
  secondaryControl: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  skipButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 12,
  },
  playButtonGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  repeatOneBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#a855f7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  repeatOneText: {
    color: 'white',
    fontSize: 9,
    fontWeight: 'bold',
  },
  bottomAction: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});