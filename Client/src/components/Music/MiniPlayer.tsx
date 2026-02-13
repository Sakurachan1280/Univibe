import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMusic } from '../../context/MusicContext';
import { useAppNavigation } from '../../navigation/useAppNavigation';

const { width } = Dimensions.get('window');

const MiniPlayer = () => {
    const {
        currentSong,
        isPlaying,
        togglePlayPause,
        handleNext,
        handlePrevious,
        currentTime,
        duration,
        miniPlayerVisible
    } = useMusic();
    const navigation = useAppNavigation();

    if (!currentSong || !miniPlayerVisible) return null;

    const artistNames = currentSong.artist_ids?.map(a => a.name).join(", ") || "Unknown Artist";
    const progress = duration > 0 ? (currentTime / duration) : 0;

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation.navigate("MusicPlayer" as any)}
            style={styles.container}
        >
            <View style={styles.contentWrapper}>
                <View style={styles.content}>
                    <View style={styles.leftSection}>
                        {currentSong.cover_image ? (
                            <Image source={{ uri: currentSong.cover_image }} style={styles.albumArt} />
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

                    <View style={styles.controls}>
                        <TouchableOpacity onPress={handlePrevious} style={styles.controlButton}>
                            <Ionicons name="play-back" size={24} color="white" />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={togglePlayPause} style={styles.playButton}>
                            <Ionicons name={isPlaying ? "pause" : "play"} size={28} color="white" />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleNext} style={styles.controlButton}>
                            <Ionicons name="play-forward" size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Progress Bar at the bottom */}
                <View style={styles.progressContainer}>
                    <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 90, // Above the tab bar
        left: 10,
        right: 10,
        height: 65,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#1a0a2e',
        zIndex: 1000,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
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
