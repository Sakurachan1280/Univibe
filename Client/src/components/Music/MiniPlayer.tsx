import React, { memo } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMusic } from '../../context/MusicContext';
import { usePlaybackProgress } from '../../context/PlaybackProgressContext';
import { useAppNavigation } from '../../navigation/useAppNavigation';
import { LinearGradient } from 'expo-linear-gradient';
import { Song } from '../../API/musicAPI';

const { width } = Dimensions.get('window');

// ─── Progress bar tách riêng: chỉ re-render khi currentTime/duration thay đổi ───
const MiniPlayerProgress = memo(() => {
    const { currentTime, duration } = usePlaybackProgress();
    const progress = duration > 0 ? currentTime / duration : 0;
    return (
        <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
        </View>
    );
});

// ─── Phần thông tin bài hát + controls: không subscribe currentTime ───
interface ContentProps {
    currentSong: Song;
    isPlaying: boolean;
    togglePlayPause: () => void;
    handleNext: () => void;
    handlePrevious: () => void;
    onPress: () => void;
}

const MiniPlayerContent = memo(({
    currentSong,
    isPlaying,
    togglePlayPause,
    handleNext,
    handlePrevious,
    onPress,
}: ContentProps) => {
    const artistNames = currentSong.artist_ids?.map(a => a.name).join(', ') || 'Unknown Artist';

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={onPress}
            style={styles.container}
        >
            <LinearGradient
                colors={['#000000', '#500724', '#000000']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.gradient}
            >
                <View style={styles.contentWrapper}>
                    <View style={styles.content}>
                        {/* Song info */}
                        <View style={styles.leftSection}>
                            {currentSong.cover_image ? (
                                <Image
                                    source={{ uri: currentSong.cover_image }}
                                    style={styles.albumArt}
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
                                <Ionicons name="play-back" size={24} color="white" />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={togglePlayPause} style={styles.playButton}>
                                <Ionicons name={isPlaying ? 'pause' : 'play'} size={28} color="white" />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={handleNext} style={styles.controlButton}>
                                <Ionicons name="play-forward" size={24} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Progress bar — tách riêng để không kéo content re-render */}
                    <MiniPlayerProgress />
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
});

// ─── Root component: chỉ kiểm tra visible, pass stable props xuống ───
const MiniPlayer = () => {
    const {
        currentSong,
        isPlaying,
        togglePlayPause,
        handleNext,
        handlePrevious,
        miniPlayerVisible,
    } = useMusic();
    const navigation = useAppNavigation();

    if (!currentSong || !miniPlayerVisible) return null;

    return (
        <MiniPlayerContent
            currentSong={currentSong}
            isPlaying={isPlaying}
            togglePlayPause={togglePlayPause}
            handleNext={handleNext}
            handlePrevious={handlePrevious}
            onPress={() => navigation.navigate('MusicPlayer' as any)}
        />
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
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
        width: 45,
        height: 45,
        borderRadius: 6,
    },
    placeholderArt: {
        backgroundColor: 'rgba(236,72,153,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    info: {
        marginLeft: 12,
        flex: 1,
    },
    title: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    artist: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    controlButton: {
        padding: 6,
    },
    playButton: {
        padding: 6,
        marginHorizontal: 4,
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

export default MiniPlayer;
