
import React, { createContext, useContext, useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Audio, AVPlaybackStatus, AVPlaybackStatusSuccess } from "expo-av";
import musicAPI, { Song } from "../API/musicAPI";
import { Alert } from "react-native";
import { usePlaybackProgress } from "./PlaybackProgressContext";

interface MusicContextType {
    isPlaying: boolean;
    currentSong: Song | null;
    queue: Song[];
    currentIndex: number;
    loading: boolean;
    isShuffle: boolean;
    repeatMode: 'off' | 'all' | 'one';
    miniPlayerVisible: boolean;
    sleepTimer: number | null; // minutes
    startSleepTimer: (minutes: number) => void;
    cancelSleepTimer: () => void;
    playSong: (song: Song, newQueue?: Song[]) => Promise<void>;
    togglePlayPause: () => Promise<void>;
    handleNext: () => Promise<void>;
    handlePrevious: () => Promise<void>;
    handleSeek: (value: number) => Promise<void>;
    toggleShuffle: () => void;
    toggleRepeat: () => void;
    setMiniPlayerVisible: (visible: boolean) => void;
    setCurrentIndex: (index: number) => void;
    loadLastPlayed: () => Promise<void>;
    stopMusic: () => Promise<void>;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentSong, setCurrentSong] = useState<Song | null>(null);
    const { currentTime, setCurrentTime, duration, setDuration } = usePlaybackProgress();
    const [queue, setQueue] = useState<Song[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [isShuffle, setIsShuffle] = useState(false);
    const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
    const [miniPlayerVisible, setMiniPlayerVisible] = useState(false);

    // Sleep Timer State
    const [sleepTimer, setSleepTimer] = useState<number | null>(null); // Time in minutes
    const sleepTimerRef = useRef<NodeJS.Timeout | null>(null);

    const soundRef = useRef<Audio.Sound | null>(null);
    const isSeekingRef = useRef(false);
    const repeatModeRef = useRef<'off' | 'all' | 'one'>('off');

    // ── 30-second listen threshold tracking ──────────────────────────────
    /** Accumulated playback milliseconds for the current song (excludes paused time) */
    const accumulatedListenMsRef = useRef(0);
    /** Last known positionMillis from status update, used to compute deltas */
    const lastPositionMillisRef = useRef<number | null>(null);
    /** Whether we've already fired logAction("play") for the current song */
    const hasLoggedPlayRef = useRef(false);
    /** Ref copy of currentSong so onPlaybackStatusUpdate can read it without deps */
    const currentSongRef = useRef<Song | null>(null);

    const MIN_LISTEN_MS = 30_000; // 30 seconds

    useEffect(() => {
        repeatModeRef.current = repeatMode;
    }, [repeatMode]);

    useEffect(() => {
        return () => {
            if (soundRef.current) {
                soundRef.current.unloadAsync();
            }
            if (sleepTimerRef.current) {
                clearTimeout(sleepTimerRef.current);
            }
        };
    }, []);

    const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
        if (status.isLoaded) {
            const s = status as AVPlaybackStatusSuccess;
            setDuration(s.durationMillis ? s.durationMillis / 1000 : 0);

            if (!isSeekingRef.current) {
                setCurrentTime(s.positionMillis / 1000);
            }

            // ── Accumulate listen time (only while actually playing, not seeking) ──
            if (s.isPlaying && !isSeekingRef.current) {
                const last = lastPositionMillisRef.current;
                if (last !== null) {
                    const delta = s.positionMillis - last;
                    // Only count forward progress within a sensible range (0 – 2s per tick)
                    if (delta > 0 && delta <= 2000) {
                        accumulatedListenMsRef.current += delta;
                    }
                }
                lastPositionMillisRef.current = s.positionMillis;

                // Log to history the first time we cross the 30-second threshold
                if (!hasLoggedPlayRef.current && accumulatedListenMsRef.current >= MIN_LISTEN_MS) {
                    hasLoggedPlayRef.current = true;
                    const song = currentSongRef.current;
                    if (song) {
                        musicAPI.logAction({
                            song_id: song._id,
                            action_type: "play",
                            duration_listened: accumulatedListenMsRef.current / 1000,
                        }).catch(console.error);
                    }
                }
            } else if (!s.isPlaying) {
                // Reset lastPosition when paused so next resume doesn't produce a huge delta
                lastPositionMillisRef.current = null;
            }

            setIsPlaying(s.isPlaying);

            if (s.didJustFinish) {
                handleSongFinish();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);



    const loadSong = useCallback(async (songData: Song, shouldPlay: boolean = true) => {
        try {
            setLoading(true);
            setCurrentSong(songData);
            currentSongRef.current = songData;

            // Reset 30-second threshold tracking for the new song
            accumulatedListenMsRef.current = 0;
            lastPositionMillisRef.current = null;
            hasLoggedPlayRef.current = false;

            if (soundRef.current) {
                await soundRef.current.unloadAsync();
                soundRef.current = null;
            }

            const { sound } = await Audio.Sound.createAsync(
                { uri: songData.file_url },
                { shouldPlay: shouldPlay },
                onPlaybackStatusUpdate
            );

            soundRef.current = sound;
            setLoading(false);
            setMiniPlayerVisible(true); // Always show mini player when a song is loaded

            // NOTE: We no longer log "play" immediately here.
            // The history entry is only created after 30 seconds of actual playback
            // (handled in onPlaybackStatusUpdate via the threshold check).
        } catch (error) {
            console.error("Error loading song:", error);
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onPlaybackStatusUpdate]);

    const playSong = useCallback(async (song: Song, newQueue?: Song[]) => {
        if (newQueue) {
            setQueue(newQueue);
            const index = newQueue.findIndex(s => s._id === song._id);
            setCurrentIndex(index !== -1 ? index : 0);
        } else {
            // If no new queue, check if song is in current queue
            const index = queue.findIndex(s => s._id === song._id);
            if (index !== -1) {
                setCurrentIndex(index);
            } else {
                setQueue([song]);
                setCurrentIndex(0);
            }
        }
        await loadSong(song);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loadSong]);

    useEffect(() => {
        if (queue.length > 0 && queue[currentIndex] && queue[currentIndex]._id !== currentSong?._id) {
            loadSong(queue[currentIndex]);
        }
    }, [currentIndex]);

    const togglePlayPause = async () => {
        if (!soundRef.current) return;

        try {
            if (isPlaying) {
                await soundRef.current.pauseAsync();
                // Log pause for analytics (not for history creation)
                if (currentSong) {
                    await musicAPI.logAction({
                        song_id: currentSong._id,
                        action_type: "pause",
                        duration_listened: accumulatedListenMsRef.current / 1000,
                    });
                }
            } else {
                await soundRef.current.playAsync();
                // Reset lastPosition so the next delta starts clean from resume point
                lastPositionMillisRef.current = null;
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

            if (currentSong) {
                await musicAPI.logAction({
                    song_id: currentSong._id,
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

    /**
     * Commit listen session for the current song before changing tracks.
     * If < 30s listened → log "skip" (no history entry created).
     * If ≥ 30s but not yet logged → log "play" now (threshold just reached on skip).
     */
    const commitCurrentListenSession = useCallback(async () => {
        const song = currentSongRef.current;
        if (!song) return;

        const listenedMs = accumulatedListenMsRef.current;

        if (!hasLoggedPlayRef.current) {
            // Didn't reach 30s → this is a skip, do NOT create history entry
            if (listenedMs < MIN_LISTEN_MS) {
                await musicAPI.logAction({
                    song_id: song._id,
                    action_type: "skip",
                    duration_listened: listenedMs / 1000,
                }).catch(console.error);
            } else {
                // Edge case: reached 30s right at the moment of skip before callback fired
                hasLoggedPlayRef.current = true;
                await musicAPI.logAction({
                    song_id: song._id,
                    action_type: "play",
                    duration_listened: listenedMs / 1000,
                }).catch(console.error);
            }
        }
        // If hasLoggedPlayRef is true, the play was already logged; nothing more to do.
    }, []);

    const handleNext = async () => {
        if (repeatMode === 'one') {
            if (soundRef.current) {
                await soundRef.current.setPositionAsync(0);
                await soundRef.current.playAsync();
            }
            return;
        }

        await commitCurrentListenSession();

        if (currentIndex < queue.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else if (repeatMode === 'all') {
            setCurrentIndex(0);
        }
    };

    const handlePrevious = async () => {
        if (repeatMode === 'one') {
            if (soundRef.current) {
                await soundRef.current.setPositionAsync(0);
                await soundRef.current.playAsync();
            }
            return;
        }

        await commitCurrentListenSession();

        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        } else if (repeatMode === 'all') {
            setCurrentIndex(queue.length - 1);
        }
    };

    const handleSongFinish = async () => {
        const currentRepeatMode = repeatModeRef.current;

        if (currentRepeatMode === 'one') {
            if (soundRef.current) {
                await soundRef.current.setPositionAsync(0);
                await soundRef.current.playAsync();
            }
        } else if (currentRepeatMode === 'all') {
            if (currentIndex < queue.length - 1) {
                setCurrentIndex(currentIndex + 1);
            } else {
                setCurrentIndex(0);
            }
        } else {
            if (currentIndex < queue.length - 1) {
                setCurrentIndex(currentIndex + 1);
            } else {
                setIsPlaying(false);
            }
        }

        if (currentSong) {
            await musicAPI.logAction({
                song_id: currentSong._id,
                action_type: "complete",
                duration_listened: duration,
            });
        }
    };

    const toggleShuffle = () => {
        setIsShuffle(!isShuffle);
        // Shuffle logic could be more complex, but for now just toggle
    };

    const toggleRepeat = () => {
        const modes: Array<'off' | 'all' | 'one'> = ['off', 'all', 'one'];
        const currentModeIndex = modes.indexOf(repeatMode);
        const nextMode = modes[(currentModeIndex + 1) % modes.length];
        setRepeatMode(nextMode);

    };

    const loadLastPlayed = async () => {
        try {
            // Import dynamically to avoid circular dependency if any
            const { getListeningHistory } = require("../API/libraryAPI");
            const history = await getListeningHistory();
            // history có thể là null nếu guest (401 → interceptor trả null)
            if (!history || !Array.isArray(history) || history.length === 0) return;
            const firstItem = history[0];
            if (!firstItem?.song_id) return;
            const lastSong = firstItem.song_id;
            console.log("Loading last played:", lastSong.title);
            // Create a generic queue based on history or just random songs?
            // For now, let's just make a queue of 1 song to keep it simple, or maybe fetch random
            // Fetch random songs for queue context
            const randomSongs = await musicAPI.getRandomSongs(19);
            const newQueue = [lastSong, ...randomSongs.filter(s => s._id !== lastSong._id)];

            setQueue(newQueue);
            setCurrentIndex(0);
            await loadSong(lastSong, false); // shouldPlay = false
        } catch (error) {
            console.log("Error loading last played:", error);
        }
    };

    const startSleepTimer = (minutes: number) => {
        if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);

        setSleepTimer(minutes);

        sleepTimerRef.current = setTimeout(() => {
            if (soundRef.current) {
                soundRef.current.pauseAsync();
                setIsPlaying(false);
                setSleepTimer(null);
            }
        }, minutes * 60 * 1000);
    };

    const cancelSleepTimer = () => {
        if (sleepTimerRef.current) {
            clearTimeout(sleepTimerRef.current);
            sleepTimerRef.current = null;
        }
        setSleepTimer(null);
    };

    const stopMusic = async () => {
        try {
            if (soundRef.current) {
                await soundRef.current.stopAsync();
                await soundRef.current.unloadAsync();
                soundRef.current = null;
            }
            setIsPlaying(false);
            setCurrentSong(null);
            setMiniPlayerVisible(false);
            setCurrentTime(0);
        } catch (error) {
            console.error("Error stopping music:", error);
        }
    };

    const contextValue = useMemo(() => ({
        isPlaying,
        currentSong,
        queue,
        currentIndex,
        loading,
        isShuffle,
        repeatMode,
        miniPlayerVisible,
        sleepTimer,
        playSong,
        togglePlayPause,
        handleNext,
        handlePrevious,
        handleSeek,
        toggleShuffle,
        toggleRepeat,
        setMiniPlayerVisible,
        setCurrentIndex,
        loadLastPlayed,
        startSleepTimer,
        cancelSleepTimer,
        stopMusic,
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }), [
        isPlaying, currentSong, queue, currentIndex,
        loading, isShuffle, repeatMode, miniPlayerVisible, sleepTimer,
        playSong, togglePlayPause, handleNext, handlePrevious, handleSeek,
        toggleShuffle, toggleRepeat, loadLastPlayed, startSleepTimer, cancelSleepTimer,
        stopMusic,
    ]);

    return (
        <MusicContext.Provider value={contextValue}>
            {children}
        </MusicContext.Provider>
    );
};

export const useMusic = () => {
    const context = useContext(MusicContext);
    if (context === undefined) {
        throw new Error("useMusic must be used within a MusicProvider");
    }
    return context;
};
