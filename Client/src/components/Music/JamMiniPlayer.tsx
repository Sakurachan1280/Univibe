/**
 * JamMiniPlayer
 * Thanh mini hiển thị khi Jam đang active nhưng modal đã đóng.
 * Gồm: ảnh bìa bài đang phát | tên bài | avatar stack | nút + mời | nút play/pause | nút mở lại modal
 */
import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Song } from '../../API/musicAPI';

const { width } = Dimensions.get('window');
const DISMISS_THRESHOLD_Y = 70;

interface JamMiniPlayerProps {
  /** Bài hát Jam hiện tại (null = chưa có) */
  jamCurrentSong: Song | null;
  /** Tên phòng Jam */
  jamName: string;
  /** Avatar URLs của participants (null = không có avatar) */
  participantAvatars: (string | null)[];
  /** Đang phát hay không */
  isPlaying: boolean;
  /** Toggle play/pause (chỉ host hoặc khách có quyền) */
  onPlayPause: () => void;
  /** Mở lại full Jam modal */
  onOpen: () => void;
  /** Mở modal mời bạn bè */
  onInvite: () => void;
  /** Vị trí bottom (tính theo safe area + tab bar) */
  bottomOffset: number;
}

// Avatars stack nhỏ
const AvatarStack = ({ avatars }: { avatars: (string | null)[] }) => {
  const shown = avatars.slice(0, 3);
  const extra = avatars.length - 3;

  if (shown.length === 0) {
    // Chưa có ai — hiện placeholder đen
    return (
      <View style={avatarStyles.placeholder}>
        <Ionicons name="person" size={14} color="#555" />
      </View>
    );
  }

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {shown.map((uri, i) => (
        <View
          key={i}
          style={[
            avatarStyles.ring,
            { marginLeft: i === 0 ? 0 : -8, zIndex: 10 - i },
          ]}
        >
          {uri ? (
            <Image source={{ uri }} style={avatarStyles.img} />
          ) : (
            <View style={[avatarStyles.img, avatarStyles.noAvatar]}>
              <Ionicons name="person" size={11} color="#888" />
            </View>
          )}
        </View>
      ))}
      {extra > 0 && (
        <View
          style={[
            avatarStyles.ring,
            avatarStyles.extraBadge,
            { marginLeft: -8, zIndex: 0 },
          ]}
        >
          <Text style={avatarStyles.extraText}>+{extra}</Text>
        </View>
      )}
    </View>
  );
};

const avatarStyles = StyleSheet.create({
  ring: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#000',
    overflow: 'hidden',
  },
  img: {
    width: '100%',
    height: '100%',
  },
  noAvatar: {
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  extraBadge: {
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  extraText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },
});

// ─── Main component ─────────────────────────────────────────────────────────
export default function JamMiniPlayer({
  jamCurrentSong,
  jamName,
  participantAvatars,
  isPlaying,
  onPlayPause,
  onOpen,
  onInvite,
  bottomOffset,
}: JamMiniPlayerProps) {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  // Swipe xuống → ẩn bar (không thoát Jam, chỉ dismiss thanh)
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) => gs.dy > 6,
      onPanResponderMove: (_, gs) => {
        if (gs.dy > 0) translateY.setValue(gs.dy);
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dy > DISMISS_THRESHOLD_Y) {
          Animated.parallel([
            Animated.timing(translateY, { toValue: 150, duration: 200, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
          ]).start();
        } else {
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  const coverUri = jamCurrentSong?.cover_image;
  const songTitle = jamCurrentSong?.title ?? null;
  const artistName = jamCurrentSong?.artist_ids?.map((a: any) => a.name).join(', ') ?? null;

  return (
    <Animated.View
      style={[
        styles.wrapper,
        { bottom: bottomOffset, transform: [{ translateY }], opacity },
      ]}
      {...panResponder.panHandlers}
    >
      <LinearGradient
        colors={['#0d0d0d', '#1a0a12', '#0d0d0d']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.gradient}
      >
        {/* Borde glow hồng trên cùng */}
        <View style={styles.topGlow} />

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onOpen}
          style={styles.mainRow}
        >
          {/* ── Ảnh bìa ── */}
          <View style={styles.coverBox}>
            {coverUri ? (
              <Image source={{ uri: coverUri }} style={styles.coverImg} />
            ) : (
              // Nền đen mặc định khi chưa có bài
              <View style={styles.coverBlack}>
                <Ionicons name="musical-notes" size={20} color="#EC4899" />
              </View>
            )}
            {/* Chỉ thị Jam đang live */}
            <View style={styles.liveDot} />
          </View>

          {/* ── Song info ── */}
          <View style={styles.infoBox}>
            <Text style={styles.jamLabel} numberOfLines={1}>
              🎵 {jamName}
            </Text>
            {songTitle ? (
              <>
                <Text style={styles.songTitle} numberOfLines={1}>{songTitle}</Text>
                <Text style={styles.artistName} numberOfLines={1}>{artistName}</Text>
              </>
            ) : (
              <Text style={styles.noSongText}>Chưa có bài hát</Text>
            )}
          </View>

          {/* ── Avatar stack ── */}
          <View style={styles.avatarBox}>
            <AvatarStack avatars={participantAvatars} />
          </View>
        </TouchableOpacity>

        {/* ── Nút + mời + play/pause ── */}
        <View style={styles.actions}>
          {/* Nút + mời bạn bè */}
          <TouchableOpacity
            style={styles.inviteBtn}
            onPress={onInvite}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <View style={styles.inviteBtnInner}>
              <Ionicons name="person-add" size={15} color="#EC4899" />
            </View>
          </TouchableOpacity>

          {/* Play / Pause */}
          {jamCurrentSong && (
            <TouchableOpacity
              style={styles.playBtn}
              onPress={(e) => {
                e.stopPropagation();
                onPlayPause();
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={isPlaying ? 'pause-circle' : 'play-circle'}
                size={34}
                color="white"
              />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* Progress bar dưới cùng */}
      <View style={styles.progressTrack} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 10,
    right: 10,
    height: 68,
    borderRadius: 16,
    overflow: 'hidden',
    zIndex: 1000,
    elevation: 10,
    shadowColor: '#EC4899',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    borderWidth: 1,
    borderColor: 'rgba(236,72,153,0.4)',
  },
  gradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  topGlow: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: 'rgba(236,72,153,0.6)',
  },
  mainRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  // ── Cover ──
  coverBox: {
    width: 46,
    height: 46,
    borderRadius: 8,
    overflow: 'visible',
    marginRight: 10,
  },
  coverImg: {
    width: 46,
    height: 46,
    borderRadius: 8,
  },
  coverBlack: {
    width: 46,
    height: 46,
    borderRadius: 8,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(236,72,153,0.3)',
  },
  liveDot: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#EC4899',
    borderWidth: 1.5,
    borderColor: '#000',
  },
  // ── Info ──
  infoBox: {
    flex: 1,
    justifyContent: 'center',
  },
  jamLabel: {
    color: '#EC4899',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 1,
    textTransform: 'uppercase',
  },
  songTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 15,
  },
  artistName: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    lineHeight: 13,
  },
  noSongText: {
    color: '#555',
    fontSize: 11,
    fontStyle: 'italic',
  },
  // ── Avatars ──
  avatarBox: {
    marginHorizontal: 8,
  },
  // ── Actions ──
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  inviteBtn: {
    padding: 4,
  },
  inviteBtnInner: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: '#EC4899',
    backgroundColor: 'rgba(236,72,153,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtn: {
    padding: 2,
  },
  progressTrack: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(236,72,153,0.25)',
  },
});
