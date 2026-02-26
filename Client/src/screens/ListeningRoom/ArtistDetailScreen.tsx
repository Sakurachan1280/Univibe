import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Dimensions,
    StatusBar,
    StyleSheet,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useAppNavigation } from '../../navigation/useAppNavigation';
import { getArtistById, getSongsByArtist, Artist } from '../../API/artistAPI';
import { Song } from '../../API/musicAPI';
import { RootStackParamList } from '../../navigation/types';

const { width, height } = Dimensions.get('window');

type ArtistDetailRouteProp = RouteProp<RootStackParamList, 'ArtistDetail'>;

export default function ArtistDetailScreen() {
    const navigation = useAppNavigation();
    const route = useRoute<ArtistDetailRouteProp>();
    const { artistId, artistName } = route.params;

    const [artist, setArtist] = useState<Artist | null>(null);
    const [songs, setSongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState(true);
    const [songsLoading, setSongsLoading] = useState(true);

    useEffect(() => {
        loadArtistData();
    }, [artistId]);

    const loadArtistData = async () => {
        try {
            setLoading(true);
            setSongsLoading(true);

            const [artistData, songsData] = await Promise.all([
                getArtistById(artistId),
                getSongsByArtist(artistId),
            ]);

            setArtist(artistData);
            setSongs(songsData);
        } catch (error) {
            console.error('Error loading artist data:', error);
        } finally {
            setLoading(false);
            setSongsLoading(false);
        }
    };

    const handlePlaySong = (song: Song) => {
        navigation.navigate('MusicPlayer', { song });
    };

    const handlePlayAll = () => {
        if (songs.length > 0) {
            navigation.navigate('MusicPlayer', { song: songs[0] });
        }
    };

    // ─── Render: Loading ────────────────────────────────────────────────────────
    if (loading) {
        return (
            <LinearGradient colors={['#1a0520', '#0f0314', '#000000']} style={{ flex: 1 }}>
                <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color="#ec4899" />
                    <Text style={{ color: 'white', marginTop: 16, fontSize: 16 }}>
                        Đang tải thông tin ca sĩ...
                    </Text>
                </SafeAreaView>
            </LinearGradient>
        );
    }

    // ─── Render: Song Item ──────────────────────────────────────────────────────
    const renderSongItem = (item: Song, index: number) => {
        const artistNames = item.artist_ids?.map(a => a.name).join(', ') || 'Unknown Artist';
        return (
            <TouchableOpacity
                key={item._id}
                activeOpacity={0.7}
                style={styles.songItem}
                onPress={() => handlePlaySong(item)}
            >
                {/* Rank number */}
                <Text style={styles.songRank}>{index + 1}</Text>

                {/* Thumbnail */}
                {item.cover_image ? (
                    <Image
                        source={item.cover_image}
                        style={styles.songThumbnail}
                        contentFit="cover"
                        cachePolicy="memory-disk"
                    />
                ) : (
                    <View style={styles.songThumbnailPlaceholder}>
                        <Ionicons name="musical-notes" size={22} color="#ec4899" />
                    </View>
                )}

                {/* Info */}
                <View style={styles.songInfo}>
                    <Text style={styles.songTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.songArtist} numberOfLines={1}>{artistNames}</Text>
                </View>

                {/* Play button */}
                <TouchableOpacity style={styles.songMoreBtn} onPress={() => handlePlaySong(item)}>
                    <Ionicons name="play-circle-outline" size={28} color="rgba(255,255,255,0.6)" />
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    // ─── Render: Main ───────────────────────────────────────────────────────────
    return (
        <View style={{ flex: 1, backgroundColor: '#000' }}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* Back Button — fixed overlay */}
            <SafeAreaView style={styles.backButtonContainer} edges={['top']}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={26} color="white" />
                </TouchableOpacity>
            </SafeAreaView>

            <ScrollView showsVerticalScrollIndicator={false} bounces>
                {/* ── Hero Section ────────────────────────────────────────────────── */}
                <View style={styles.heroContainer}>
                    {artist?.avatar ? (
                        <Image
                            source={artist.avatar}
                            style={styles.heroImage}
                            contentFit="cover"
                            cachePolicy="memory-disk"
                        />
                    ) : (
                        <View style={[styles.heroImage, styles.heroImagePlaceholder]}>
                            <Ionicons name="person" size={80} color="#ec4899" />
                        </View>
                    )}

                    {/* Gradient overlay on hero */}
                    <LinearGradient
                        colors={['transparent', 'rgba(26,5,32,0.85)', '#1a0520']}
                        style={styles.heroGradient}
                    />

                    {/* Artist name + meta on top of gradient */}
                    <View style={styles.heroContent}>
                        <Text style={styles.artistName} numberOfLines={2}>
                            {artist?.name || artistName}
                        </Text>
                        <Text style={styles.artistMeta}>
                            {songs.length > 0 ? `${songs.length} bài hát` : 'Ca sĩ'}
                        </Text>
                    </View>
                </View>

                {/* ── Bio + Actions ────────────────────────────────────────────────── */}
                <LinearGradient
                    colors={['#1a0520', '#2d1b3d', '#000000']}
                    style={styles.bioSection}
                >
                    {/* Action buttons */}
                    <View style={styles.actionsRow}>
                        <TouchableOpacity style={styles.followButton}>
                            <Text style={styles.followButtonText}>Theo dõi</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.playAllButton} onPress={handlePlayAll}>
                            <LinearGradient
                                colors={['#ec4899', '#db2777']}
                                style={styles.playAllGradient}
                            >
                                <Ionicons name="play" size={28} color="white" style={{ marginLeft: 3 }} />
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    {/* Bio */}
                    {artist?.bio ? (
                        <View style={styles.bioContainer}>
                            <Text style={styles.bioLabel}>Giới thiệu</Text>
                            <Text style={styles.bioText}>{artist.bio}</Text>
                        </View>
                    ) : null}
                </LinearGradient>

                {/* ── Song List ────────────────────────────────────────────────────── */}
                <View style={styles.songListSection}>
                    <Text style={styles.songListTitle}>Bài hát phổ biến</Text>

                    {songsLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#ec4899" />
                            <Text style={styles.loadingText}>Đang tải bài hát...</Text>
                        </View>
                    ) : songs.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="musical-notes-outline" size={48} color="rgba(255,255,255,0.2)" />
                            <Text style={styles.emptyText}>Chưa có bài hát nào</Text>
                        </View>
                    ) : (
                        songs.map((song, index) => renderSongItem(song, index))
                    )}
                </View>

                {/* Bottom padding for mini player */}
                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    // Back button
    backButtonContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 50,
        paddingHorizontal: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
    },

    // Hero
    heroContainer: {
        width: '100%',
        height: height * 0.45,
        position: 'relative',
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    heroImagePlaceholder: {
        backgroundColor: 'rgba(236,72,153,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(236,72,153,0.2)',
    },
    heroGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60%',
    },
    heroContent: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
    },
    artistName: {
        color: 'white',
        fontSize: 34,
        fontWeight: 'bold',
        letterSpacing: 0.5,
        textShadowColor: 'rgba(0,0,0,0.8)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 8,
    },
    artistMeta: {
        color: 'rgba(255,255,255,0.65)',
        fontSize: 15,
        marginTop: 6,
        fontWeight: '500',
    },

    // Bio + Actions
    bioSection: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 24,
    },
    actionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    followButton: {
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 24,
        borderWidth: 1.5,
        borderColor: 'rgba(236,72,153,0.7)',
    },
    followButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 15,
    },
    playAllButton: {
        shadowColor: '#ec4899',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
        elevation: 10,
    },
    playAllGradient: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bioContainer: {
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    bioLabel: {
        color: '#ec4899',
        fontSize: 13,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
    },
    bioText: {
        color: 'rgba(255,255,255,0.75)',
        fontSize: 14,
        lineHeight: 22,
    },

    // Song list
    songListSection: {
        backgroundColor: '#000',
        paddingHorizontal: 16,
        paddingTop: 24,
    },
    songListTitle: {
        color: 'white',
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    songItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 4,
        borderRadius: 12,
        marginBottom: 4,
    },
    songRank: {
        color: 'rgba(255,255,255,0.35)',
        fontSize: 14,
        fontWeight: '600',
        width: 28,
        textAlign: 'center',
    },
    songThumbnail: {
        width: 52,
        height: 52,
        borderRadius: 8,
        marginRight: 14,
    },
    songThumbnailPlaceholder: {
        width: 52,
        height: 52,
        borderRadius: 8,
        marginRight: 14,
        backgroundColor: 'rgba(236,72,153,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(236,72,153,0.25)',
    },
    songInfo: {
        flex: 1,
        marginRight: 8,
    },
    songTitle: {
        color: 'white',
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 4,
    },
    songArtist: {
        color: 'rgba(255,255,255,0.55)',
        fontSize: 13,
    },
    songMoreBtn: {
        padding: 6,
    },

    // States
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    loadingText: {
        color: 'rgba(255,255,255,0.5)',
        marginTop: 12,
        fontSize: 14,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        color: 'rgba(255,255,255,0.4)',
        marginTop: 12,
        fontSize: 15,
    },
});
