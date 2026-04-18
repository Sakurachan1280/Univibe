import React, { memo, useRef, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Animated,
    PanResponder,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useMusic } from '../../context/MusicContext';
import { usePlaybackProgress } from '../../context/PlaybackProgressContext';
import { useAppNavigation } from '../../navigation/useAppNavigation';
import { LinearGradient } from 'expo-linear-gradient';
import { Song } from '../../API/musicAPI';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// ─── Ngưỡng swipe để dismiss ───────────────────────────────────────────────
const DISMISS_THRESHOLD_X = width * 0.35;  // vuốt ngang > 35% màn hình
const DISMISS_THRESHOLD_Y = 60;            // vuốt xuống > 60px

// ─── Progress bar tách riêng ────────────────────────────────────────────────
const MiniPlayerProgress = memo(() => {
    const { currentTime, duration } = usePlaybackProgress();
    const progress = duration > 0 ? currentTime / duration : 0;
    return (
        <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
        </View>
    );
});

// ─── Content (memo để không re-render theo progress) ────────────────────────
interface ContentProps {
    currentSong: Song;
    isPlaying: boolean;
    togglePlayPause: () => void;
    handleNext: () => void;
    handlePrevious: () => void;
    onPress: () => void;
    onDismiss: () => void;
    stopMusic: () => void;
    bottomOffset?: number;
}

const MiniPlayerContent = memo(({
    currentSong,
    isPlaying,
    togglePlayPause,
    handleNext,
    handlePrevious,
    onPress,
    onDismiss,
    stopMusic,
    bottomOffset,
}: ContentProps) => {
    const artistNames = currentSong.artist_ids?.map(a => a.name).join(', ') || 'Unknown Artist';

    // Animated value cho vị trí swipe
    const translateX = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(1)).current;

    const dismiss = (toX = 0, toY = 0) => {
        Animated.parallel([
            Animated.timing(translateX, { toValue: toX, duration: 200, useNativeDriver: true }),
            Animated.timing(translateY, { toValue: toY, duration: 200, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]).start(() => {
            translateX.setValue(0);
            translateY.setValue(0);
            opacity.setValue(1);
            onDismiss();
        });
    };

    const panResponder = useRef(PanResponder.create({
        onMoveShouldSetPanResponder: (_, gs) =>
            Math.abs(gs.dx) > 8 || gs.dy > 8,
        onPanResponderMove: (_, gs) => {
            translateX.setValue(gs.dx);
            // Chỉ cho phép kéo xuống, không kéo lên
            if (gs.dy > 0) translateY.setValue(gs.dy);
        },
        onPanResponderRelease: (_, gs) => {
            const absX = Math.abs(gs.dx);
            if (absX > DISMISS_THRESHOLD_X) {
                // Vuốt trái/phải
                stopMusic();
                dismiss(gs.dx > 0 ? width : -width, 0);
            } else if (gs.dy > DISMISS_THRESHOLD_Y) {
                // Vuốt xuống
                stopMusic();
                dismiss(0, 150);
            } else {
                // Snap về vị trí ban đầu
                Animated.parallel([
                    Animated.spring(translateX, { toValue: 0, useNativeDriver: true }),
                    Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
                ]).start();
            }
        },
    })).current;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [{ translateX }, { translateY }],
                    opacity,
                    // Dùng bottomOffset từ prop nếu có (cho phép tính SafeArea động)
                    ...(bottomOffset !== undefined ? { bottom: bottomOffset } : {}),
                },
            ]}
            {...panResponder.panHandlers}
        >
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={onPress}
                style={{ flex: 1 }}
            >
                <LinearGradient
                    colors={['#000000', '#500724', '#000000']}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={styles.gradient}
                >
                    <View style={styles.contentWrapper}>
                        <View style={styles.content}>
                            {/* Album art + info */}
                            <View style={styles.leftSection}>
                                {currentSong.cover_image ? (
                                    <Image
                                        source={currentSong.cover_image}
                                        style={styles.albumArt}
                                        cachePolicy="memory-disk"
                                    />
                                ) : (
                                    <View style={[styles.albumArt, styles.placeholderArt]}>
                                        <Ionicons name="musical-notes" size={20} color="#ec4899" />
                                    </View>
                                )}
                                <View style={styles.info}>
                                    <Text style={styles.title} numberOfLines={1}>{currentSong.title}</Text>
                                    <Text style={styles.artist} numberOfLines={1}>{artistNames}</Text>
                                </View>
                            </View>

                            {/* Controls */}
                            <View style={styles.controls}>
                                <TouchableOpacity onPress={handlePrevious} style={styles.controlButton}>
                                    <Ionicons name="play-back" size={22} color="white" />
                                </TouchableOpacity>

                                <TouchableOpacity onPress={togglePlayPause} style={styles.playButton}>
                                    <Ionicons name={isPlaying ? 'pause' : 'play'} size={26} color="white" />
                                </TouchableOpacity>

                                <TouchableOpacity onPress={handleNext} style={styles.controlButton}>
                                    <Ionicons name="play-forward" size={22} color="white" />
                                </TouchableOpacity>

                                {/* Nút X đóng MiniPlayer */}
                                <TouchableOpacity
                                    onPress={(e) => {
                                        e.stopPropagation();
                                        stopMusic(); // Dừng nhạc ngay khi user chủ động đóng
                                        dismiss(0, 150);
                                    }}
                                    style={styles.closeButton}
                                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                >
                                    <Ionicons name="close" size={18} color="rgba(255,255,255,0.7)" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Progress bar */}
                        <MiniPlayerProgress />
                    </View>
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
});

// ─── Root wrapper ─────────────────────────────────────────────────────────
const MiniPlayer = () => {
    const {
        currentSong,
        isPlaying,
        togglePlayPause,
        handleNext,
        handlePrevious,
        miniPlayerVisible,
        setMiniPlayerVisible,
        stopMusic,
    } = useMusic();
    const navigation = useAppNavigation();
    const [dismissed, setDismissed] = useState(false);
    // SafeArea để tính bottom chính xác trên iPhone (có home indicator)
    const insets = useSafeAreaInsets();
    // Tab bar height = 80, thêm safe area bottom để không bị chồng lên
    const miniPlayerBottom = 80 + Math.max(insets.bottom, 0) + 8;

    // Reset dismissed khi bài hát đổi
    React.useEffect(() => {
        setDismissed(false);
        if (currentSong) setMiniPlayerVisible(true);
    }, [currentSong?._id]);

    if (!currentSong || !miniPlayerVisible || dismissed) return null;

    return (
        <MiniPlayerContent
            currentSong={currentSong}
            isPlaying={isPlaying}
            togglePlayPause={togglePlayPause}
            handleNext={handleNext}
            handlePrevious={handlePrevious}
            onPress={() => navigation.navigate('MusicPlayer' as any)}
            onDismiss={() => {
                setDismissed(true);
                setMiniPlayerVisible(false);
            }}
            stopMusic={stopMusic}
            bottomOffset={miniPlayerBottom}
        />
    );
};

export default MiniPlayer;

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        // Fallback bottom (overridden by bottomOffset prop khi có SafeArea)
        bottom: 90,
        left: 10,
        right: 10,
        height: 65,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#1a1a1a',
        zIndex: 1000,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    gradient: {
        flex: 1,
    },
    contentWrapper: {
        flex: 1,
        paddingHorizontal: 12,
        justifyContent: 'center',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flex: 1,
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    albumArt: {
        width: 43,
        height: 43,
        borderRadius: 6,
    },
    placeholderArt: {
        backgroundColor: 'rgba(236,72,153,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    info: {
        marginLeft: 10,
        flex: 1,
    },
    title: {
        color: 'white',
        fontSize: 13,
        fontWeight: 'bold',
    },
    artist: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 11,
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    controlButton: {
        padding: 5,
    },
    playButton: {
        padding: 5,
        marginHorizontal: 2,
    },
    closeButton: {
        marginLeft: 6,
        padding: 4,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    progressContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#ec4899',
    },
});
