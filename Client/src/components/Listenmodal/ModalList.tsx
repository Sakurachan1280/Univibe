import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    Image,
    ScrollView,
    Pressable,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AddSongModal from './AddSongModel';
import { useMusic } from '../../context/MusicContext';
import { Song } from '../../API/musicAPI';
import { usePlaybackProgress } from '../../context/PlaybackProgressContext';
import { useSocket } from '../../context/SocketContext';

interface ListenModalProps {
    isVisible: boolean;
    onClose: () => void;
    /** Called when host taps "Kết thúc" – stops music and closes modal */
    onEndJam?: () => void;
    onPressAdd?: () => void;
    /** Room name displayed at the top */
    jamName?: string;
    /** Avatar URLs of current participants (null = no avatar) */
    participantAvatars?: (string | null)[];
    /** Socket room ID để truyền xuống AddSongModal */
    roomId?: string;
    /** Danh sách bài nhạc của Jam (chỉ có bài được thêm trong phòng, bắt đầu rỗng) */
    jamQueue?: Song[];
    /** Bài đang phát của Jam (null = chưa có bài nào) */
    jamCurrentSong?: Song | null;
    /** Gọi khi user tự thêm bài (local) để cập nhật jamQueue ở cha */
    onAddToJamQueue?: (song: Song) => void;
    /** Gọi khi jam song thay đổi (host skip) để cập nhật jamCurrentSong ở cha */
    onJamSongChange?: (song: Song) => void;
    /** true nếu user hiện tại là host, false nếu là khách được mời */
    isHost?: boolean;
}

const SLEEP_OPTIONS = [5, 10, 15, 20, 30, 45, 60];

export default function ListenModal({
    isVisible,
    onClose,
    onEndJam,
    onPressAdd,
    jamName = 'Jam của bạn',
    participantAvatars = [],
    roomId,
    jamQueue = [],
    jamCurrentSong = null,
    onAddToJamQueue,
    onJamSongChange,
    isHost = true,
}: ListenModalProps) {
    const [showAddSong, setShowAddSong] = useState(false);
    const [showSleepPicker, setShowSleepPicker] = useState(false);

    const {
        currentSong,
        currentIndex,
        isShuffle,
        repeatMode,
        sleepTimer,
        isPlaying,
        toggleShuffle,
        toggleRepeat,
        playSong,
        togglePlayPause,
        handleNext,
        startSleepTimer,
        cancelSleepTimer,
        stopMusic,
    } = useMusic();

    const { currentTime, duration } = usePlaybackProgress();
    const { socket } = useSocket();

    // Lắng nghe quyền điều khiển nhạc của khách (default: tắt)
    const [guestCanControl, setGuestCanControl] = useState(false);

    React.useEffect(() => {
        if (!socket) return;
        const onSync = (data: any) => {
            if (data.settings && typeof data.settings.guest_can_control === 'boolean') {
                setGuestCanControl(data.settings.guest_can_control);
            }
        };
        const onSettingsUpdated = (data: any) => {
            if (data.settings && typeof data.settings.guestCanControl === 'boolean') {
                setGuestCanControl(data.settings.guestCanControl);
            }
        };
        socket.on('sync_current_state', onSync);
        socket.on('room_settings_updated', onSettingsUpdated);
        return () => {
             socket.off('sync_current_state', onSync);
             socket.off('room_settings_updated', onSettingsUpdated);
        };
    }, [socket]);

    // ── Jam player control wrappers (emit socket events khi host dùng) ───────
    const handleJamPlayPause = async () => {
        if (!jamCurrentSong) return;

        if (currentSong?._id !== jamCurrentSong._id) {
            // Bài Jam ch\u01b0a \u0111\u01b0\u1ee3c load vào audio \u2014 load v\u00e0 ph\u1ea5t ngay
            await playSong(jamCurrentSong, jamQueue, true); // isJamPlay
            // Emit 'play' k\u00e8m songInfo \u0111\u1ec3 guest c\u0169ng load + ph\u00e1t b\u00e0i n\u00e0y
            if (socket && roomId) {
                socket.emit('music_action', {
                    roomId,
                    action: 'play',
                    currentTime: 0,
                    songInfo: jamCurrentSong,
                });
            }
        } else {
            // Bài \u0111\u00fang r\u1ed3i \u2014 toggle play/pause
            const nextAction = isPlaying ? 'pause' : 'play';
            await togglePlayPause();
            if (socket && roomId) {
                socket.emit('music_action', {
                    roomId,
                    action: nextAction,
                    currentTime,
                });
            }
        }
    };

    const handleJamNext = async () => {
        if (!jamCurrentSong || jamQueue.length === 0) return;
        const idx = jamQueue.findIndex(s => s._id === jamCurrentSong._id);
        const next = idx >= 0 && idx < jamQueue.length - 1 ? jamQueue[idx + 1] : null;
        if (!next) return;
        // playSong thay \u0111\u1ed5i MusicContext.currentSong → MainTabs useEffect s\u1ebd detect
        // v\u00e0 t\u1ef1 \u0111\u1ed9ng: x\u00f3a b\u00e0i c\u0169 kh\u1ecfi jamQueue, c\u1eadp nh\u1eadt jamCurrentSong, emit cho guest
        await playSong(next, jamQueue, true); // isJamPlay
    };

    // ── Helpers ────────────────────────────────────────────────────────────
    const repeatIcon =
        repeatMode === 'one' ? 'repeat' : 'repeat';

    const repeatColor =
        repeatMode !== 'off' ? '#EC4899' : 'white';

    const handleEndJam = async () => {
        await stopMusic();
        onEndJam ? onEndJam() : onClose();
    };

    const handleSleepOption = (minutes: number) => {
        startSleepTimer(minutes);
        setShowSleepPicker(false);
    };

    const handleCancelSleep = () => {
        cancelSleepTimer();
        setShowSleepPicker(false);
    };

    // ── Render ─────────────────────────────────────────────────────────────
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            {/* Overlay — bấm ngoài đóng modal nhưng KHÔNG thoát Jam */}
            <Pressable
                className="flex-1 justify-end bg-black/50"
                onPress={onClose}
            >
                {/* Content – stops propagation */}
                <Pressable
                    className="bg-[#121212] h-[85%] rounded-t-3xl overflow-hidden w-full"
                    onPress={() => { }}
                >
                    {/* Handle Bar */}
                    <View className="items-center pt-3 pb-2">
                        <View className="w-10 h-1 bg-gray-600 rounded-full" />
                    </View>

                    <View className="flex-1 px-4 pt-2">
                        {/* ── Header ── */}
                        <View className="flex-row items-center justify-between mb-4">
                            <View>
                                <Text className="text-white text-xl font-bold">
                                    {jamName}
                                </Text>

                                {/* Participants avatars */}
                                <View className="flex-row items-center mt-3">
                                    <TouchableOpacity
                                        className="w-10 h-10 rounded-full bg-neutral-800 items-center justify-center border border-neutral-700 z-10"
                                        style={{ marginRight: 8 }}
                                        onPress={onPressAdd}
                                    >
                                        <Ionicons name="add" size={24} color="white" />
                                    </TouchableOpacity>

                                    <View className="flex-row items-center">
                                        {participantAvatars.slice(0, 3).map((uri, idx) => (
                                            <React.Fragment key={idx}>
                                                {uri ? (
                                                    <Image
                                                        source={{ uri }}
                                                        className="w-10 h-10 rounded-full border-2 border-black"
                                                        style={{ marginLeft: idx === 0 ? 0 : -12, zIndex: 3 - idx }}
                                                    />
                                                ) : (
                                                    <Image
                                                        source={require('../../../assets/Icon/ava.jpg')}
                                                        className="w-10 h-10 rounded-full border-2 border-black"
                                                        style={{ marginLeft: idx === 0 ? 0 : -12, zIndex: 3 - idx }}
                                                    />
                                                )}
                                            </React.Fragment>
                                        ))}
                                        {participantAvatars.length > 3 && (
                                            <View 
                                                className="w-10 h-10 rounded-full border-2 border-black bg-neutral-700 items-center justify-center"
                                                style={{ marginLeft: -12, zIndex: 0 }}
                                            >
                                                <Text className="text-white text-xs font-bold">+{participantAvatars.length - 3}</Text>
                                            </View>
                                        )}
                                        {participantAvatars.length === 0 && (
                                            <Image
                                                source={require('../../../assets/Icon/ava.jpg')}
                                                className="w-10 h-10 rounded-full border-2 border-black"
                                            />
                                        )}
                                    </View>
                                </View>
                            </View>

                            <View className="items-end gap-3">
                                {/* Thêm bài hát — chỉ hiện cho host hoặc khách được cấp quyền */}
                                {(isHost || guestCanControl) && (
                                    <TouchableOpacity
                                        className="flex-row items-center gap-1"
                                        onPress={() => setShowAddSong(true)}
                                    >
                                        <Ionicons name="sparkles" size={16} color="white" />
                                        <Text className="text-white font-medium text-sm">
                                            Thêm bài hát
                                        </Text>
                                    </TouchableOpacity>
                                )}

                                {/* Kết thúc / Rời Jam */}
                                <TouchableOpacity
                                    onPress={handleEndJam}
                                    className="bg-transparent border border-gray-600 px-4 py-1.5 rounded-full"
                                >
                                    <Text className="text-white font-medium text-sm">
                                        {isHost ? 'Kết thúc' : 'Rời Jam'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* ── Jam Music Player ── */}
                        {jamCurrentSong && (
                            <View className="bg-neutral-800 rounded-xl p-4 mt-4">
                                <View className="flex-row items-center">
                                    <View className="w-14 h-14 rounded-md mr-3 overflow-hidden">
                                        {jamCurrentSong.cover_image ? (
                                            <Image source={{ uri: jamCurrentSong.cover_image }} className="w-full h-full" />
                                        ) : (
                                            <View className="w-full h-full bg-neutral-700 items-center justify-center">
                                                <Ionicons name="musical-note" size={20} color="#888" />
                                            </View>
                                        )}
                                    </View>
                                    
                                    <View className="flex-1 mr-2">
                                        <Text className="text-white font-bold text-base mb-1" numberOfLines={1}>{jamCurrentSong.title}</Text>
                                        <Text className="text-gray-400 text-sm" numberOfLines={1}>{jamCurrentSong.artist_ids?.map((a: any) => a.name).join(', ')}</Text>
                                    </View>
                                    
                                    {/* Controls: hiện cho host hoặc khách được cấp quyền */}
                                    {(isHost || guestCanControl) && (
                                        <View className="flex-row items-center gap-3">
                                            <TouchableOpacity onPress={handleJamPlayPause}>
                                                <Ionicons name={isPlaying ? "pause" : "play"} size={32} color="white" />
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={handleJamNext}>
                                                <Ionicons name="play-skip-forward" size={28} color="white" />
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>
                                
                                {/* Progress Bar (read-only) */}
                                <View className="mt-3">
                                    <View className="h-1 bg-gray-600 rounded-full w-full overflow-hidden">
                                        <View 
                                            className="h-full bg-[#EC4899]" 
                                            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }} 
                                        />
                                    </View>
                                </View>
                            </View>
                        )}

                        {/* ── Queue Title ── */}
                        <View className="mt-5 mb-2">
                            <Text className="text-white text-lg font-bold">
                                Danh sách chờ
                            </Text>
                            <Text className="text-gray-400 text-sm">
                                {jamQueue.length > 0
                                    ? `${jamQueue.length} bài`
                                    : 'Chưa có bài nào'}
                            </Text>
                        </View>

                        {/* ── Song List ── */}
                        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                            <View>
                            {jamQueue.map((song) => {
                                const isCurrentSong = jamCurrentSong?._id === song._id;
                                const artistName =
                                    song.artist_ids?.map((a: any) => a.name).join(', ') ?? '';

                                return (
                                    <TouchableOpacity
                                        key={song._id}
                                        onPress={() => playSong(song, jamQueue, true)}
                                        className={`flex-row items-center py-3 px-2 rounded-lg mb-1 ${isCurrentSong ? 'bg-white/5' : ''}`}
                                    >
                                        {/* Cover Art */}
                                        <View className="w-12 h-12 bg-neutral-700 rounded mr-3 overflow-hidden">
                                            {song.cover_image ? (
                                                <Image
                                                    source={{ uri: song.cover_image }}
                                                    className="w-full h-full"
                                                    resizeMode="cover"
                                                />
                                            ) : (
                                                <View className="w-full h-full bg-neutral-600 items-center justify-center">
                                                    <Ionicons name="musical-note" size={20} color="#888" />
                                                </View>
                                            )}
                                        </View>

                                        {/* Info */}
                                        <View className="flex-1">
                                            <Text
                                                className={`font-medium text-base mb-0.5 ${isCurrentSong ? 'text-[#EC4899]' : 'text-white'}`}
                                                numberOfLines={1}
                                            >
                                                {song.title}
                                            </Text>
                                            <Text
                                                className="text-gray-400 text-sm"
                                                numberOfLines={1}
                                            >
                                                {artistName}
                                            </Text>
                                        </View>

                                        {/* Action icon */}
                                        {isCurrentSong ? (
                                            <Ionicons name="play-circle" size={32} color="white" />
                                        ) : (
                                            <Ionicons name="menu" size={24} color="#b3b3b3" />
                                        )}
                                    </TouchableOpacity>
                                );
                            })}

                            {/* Empty state */}
                            {jamQueue.length === 0 && (
                                <View className="items-center py-12 gap-3">
                                    <Ionicons name="musical-notes-outline" size={48} color="#555" />
                                    <Text className="text-gray-500 text-sm">
                                        Hàng đợi trống – thêm bài hát để bắt đầu
                                    </Text>
                                </View>
                            )}
                            </View>
                        </ScrollView>
                    </View>

                    {/* ── Sleep Timer Picker ── */}
                    {showSleepPicker && (
                        <View className="absolute bottom-28 left-4 right-4 bg-[#1e1e1e] rounded-2xl p-4 z-50">
                            <Text className="text-white font-bold text-base mb-3">
                                Hẹn giờ tắt nhạc
                            </Text>
                            <View className="flex-row flex-wrap gap-2">
                                {SLEEP_OPTIONS.map(min => (
                                    <TouchableOpacity
                                        key={min}
                                        onPress={() => handleSleepOption(min)}
                                        className={`px-4 py-2 rounded-full border ${sleepTimer === min
                                            ? 'bg-[#EC4899] border-[#EC4899]'
                                            : 'border-gray-600'
                                            }`}
                                    >
                                        <Text className="text-white text-sm font-medium">
                                            {min} phút
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            {sleepTimer !== null && (
                                <TouchableOpacity
                                    onPress={handleCancelSleep}
                                    className="mt-3 items-center"
                                >
                                    <Text className="text-red-400 text-sm font-medium">
                                        Huỷ hẹn giờ
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}

                    {/* ── Bottom Controls ── */}
                    <View className="flex-row px-4 pb-8 pt-4 justify-between gap-3 bg-[#121212]">
                        {/* Shuffle */}
                        <TouchableOpacity
                            onPress={toggleShuffle}
                            className="flex-1 bg-[#2a2a2a] rounded-xl py-3 items-center justify-center gap-1"
                        >
                            <Ionicons
                                name="shuffle"
                                size={24}
                                color={isShuffle ? '#EC4899' : 'white'}
                            />
                            <Text
                                className={`text-xs font-medium ${isShuffle ? 'text-[#EC4899]' : 'text-white'}`}
                            >
                                Phát ngẫu nhiên
                            </Text>
                        </TouchableOpacity>

                        {/* Repeat */}
                        <TouchableOpacity
                            onPress={toggleRepeat}
                            className="flex-1 bg-[#2a2a2a] rounded-xl py-3 items-center justify-center gap-1"
                        >
                            <View>
                                <Ionicons name={repeatIcon} size={24} color={repeatColor} />
                                {repeatMode === 'one' && (
                                    <View className="absolute -top-1 -right-1 bg-[#EC4899] rounded-full w-3 h-3 items-center justify-center">
                                        <Text style={{ fontSize: 8, color: 'white', fontWeight: 'bold' }}>1</Text>
                                    </View>
                                )}
                            </View>
                            <Text
                                className={`text-xs font-medium ${repeatMode !== 'off' ? 'text-[#EC4899]' : 'text-white'}`}
                            >
                                {repeatMode === 'one' ? 'Lặp 1 bài' : 'Lặp lại'}
                            </Text>
                        </TouchableOpacity>

                        {/* Sleep Timer */}
                        <TouchableOpacity
                            onPress={() => setShowSleepPicker(v => !v)}
                            className="flex-1 bg-[#2a2a2a] rounded-xl py-3 items-center justify-center gap-1"
                        >
                            <Ionicons
                                name="timer-outline"
                                size={24}
                                color={sleepTimer !== null ? '#EC4899' : 'white'}
                            />
                            <Text
                                className={`text-xs font-medium ${sleepTimer !== null ? 'text-[#EC4899]' : 'text-white'}`}
                            >
                                {sleepTimer !== null ? `${sleepTimer} phút` : 'Hẹn giờ'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Pressable>

            {/* Add Song Modal */}
            <AddSongModal
                visible={showAddSong}
                onClose={() => setShowAddSong(false)}
                roomId={roomId}
                jamQueue={jamQueue}
                onSongAdded={onAddToJamQueue}
            />
        </Modal>
    );
}