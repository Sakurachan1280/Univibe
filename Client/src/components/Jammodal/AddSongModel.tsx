import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  View,
  Text,
  TouchableWithoutFeedback,
  FlatList,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Image,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { searchSongs, getRandomSongs, Song as SongAPIType } from "../../API/songAPI";
import { getLikedSongs } from "../../API/libraryAPI";
import { getAdminAlbums, getPlaylistDetail, Playlist } from "../../API/playlistAPI";
import { Song } from "../../API/musicAPI";
import { useMusic } from "../../context/MusicContext";
import { useSocket } from "../../context/SocketContext";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

interface AddSongModalProps {
  visible: boolean;
  onClose: () => void;
  roomId?: string;
  jamQueue?: Song[];
  onSongAdded?: (song: Song) => void;
}

function toMusicSong(s: SongAPIType): Song {
  return {
    _id: s._id,
    title: s.title,
    file_url: s.file_url ?? s.audioUrl ?? '',
    cover_image: s.cover_image ?? s.coverUrl,
    duration: typeof s.duration === 'number' ? s.duration : undefined,
    artist_ids: s.artist_ids
      ? s.artist_ids.map(a => ({ _id: a._id, name: a.name, avatar: a.avatar }))
      : s.artist
      ? [{ _id: 'unknown', name: s.artist }]
      : [],
  };
}

type TabKey = 'suggested' | 'liked' | 'album';

export default function AddSongModal({ visible, onClose, roomId, jamQueue = [], onSongAdded }: AddSongModalProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('suggested');
  const { appendToQueue } = useMusic();
  const { socket, currentUserId } = useSocket();

  // ── Search ────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // ── Tab data ──────────────────────────────────────────────
  const [suggested, setSuggested] = useState<Song[]>([]);
  const [liked, setLiked] = useState<Song[]>([]);
  const [loadingSuggested, setLoadingSuggested] = useState(false);
  const [loadingLiked, setLoadingLiked] = useState(false);

  // ── Album tab ─────────────────────────────────────────────
  const [albums, setAlbums] = useState<Playlist[]>([]);
  const [loadingAlbums, setLoadingAlbums] = useState(false);
  /** Album đang được chọn để xem bài hát */
  const [selectedAlbum, setSelectedAlbum] = useState<Playlist | null>(null);
  const [albumSongs, setAlbumSongs] = useState<Song[]>([]);
  const [loadingAlbumSongs, setLoadingAlbumSongs] = useState(false);

  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  // ── Load on open ──────────────────────────────────────────
  useEffect(() => {
    if (!visible) return;
    let mounted = true;
    setSearchQuery('');
    setSearchResults([]);
    setAddedIds(new Set());
    setActiveTab('suggested');
    setSelectedAlbum(null);
    setAlbumSongs([]);

    const loadSuggested = async () => {
      setLoadingSuggested(true);
      try {
        const raw = await getRandomSongs(15);
        if (mounted) setSuggested(raw.map(toMusicSong));
      } catch (err) {
        console.error('[AddSong] suggested error:', err);
      } finally {
        if (mounted) setLoadingSuggested(false);
      }
    };

    const loadLiked = async () => {
      setLoadingLiked(true);
      try {
        const data = await getLikedSongs();
        if (mounted) setLiked(data as Song[]);
      } catch (err) {
        console.error('[AddSong] liked error:', err);
      } finally {
        if (mounted) setLoadingLiked(false);
      }
    };

    const loadAlbums = async () => {
      setLoadingAlbums(true);
      try {
        const data = await getAdminAlbums();
        if (mounted) setAlbums(data);
      } catch (err) {
        console.error('[AddSong] albums error:', err);
      } finally {
        if (mounted) setLoadingAlbums(false);
      }
    };

    loadSuggested();
    loadLiked();
    loadAlbums();
    return () => { mounted = false; };
  }, [visible]);

  // ── Search debounce ───────────────────────────────────────
  useEffect(() => {
    if (searchQuery.trim().length === 0) { setSearchResults([]); return; }
    const t = setTimeout(async () => {
      if (searchQuery.trim().length < 2) return;
      setSearchLoading(true);
      try {
        const raw = await searchSongs(searchQuery.trim());
        setSearchResults(raw.map(toMusicSong));
      } catch { } finally {
        setSearchLoading(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // ── Chọn album → load bài ─────────────────────────────────
  const handleSelectAlbum = useCallback(async (album: Playlist) => {
    setSelectedAlbum(album);
    setLoadingAlbumSongs(true);
    try {
      const detail = await getPlaylistDetail(album._id);
      const songs: Song[] = (detail.tracks ?? [])
        .map((t: any) => {
          const s = t.song_id ?? t;
          if (!s._id) return null;
          return {
            _id: s._id,
            title: s.title ?? '',
            file_url: s.file_url ?? '',
            cover_image: s.cover_image,
            duration: s.duration,
            artist_ids: s.artist_ids ?? [],
          } as Song;
        })
        .filter(Boolean) as Song[];
      setAlbumSongs(songs);
    } catch (err) {
      console.error('[AddSong] album detail error:', err);
    } finally {
      setLoadingAlbumSongs(false);
    }
  }, []);

  // ── Add song to Jam ───────────────────────────────────────
  const handleAddSong = useCallback((song: Song) => {
    if (socket && roomId && currentUserId) {
      socket.emit('music_action', {
        roomId, action: 'add_to_queue',
        songInfo: { _id: song._id, title: song.title, cover_image: song.cover_image, file_url: song.file_url, artist_ids: song.artist_ids },
      });
    } else {
      appendToQueue(song);
    }
    onSongAdded?.(song);
    setAddedIds(prev => new Set(prev).add(song._id));
  }, [appendToQueue, socket, roomId, currentUserId, onSongAdded]);

  // ── Render: song row ──────────────────────────────────────
  const renderSongRow = useCallback(({ item }: { item: Song }) => {
    const artistName = item.artist_ids?.map(a => a.name).join(', ') ?? '';
    const isAdded = addedIds.has(item._id) || jamQueue.some(q => q._id === item._id);
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16 }}>
        <View style={{ width: 50, height: 50, borderRadius: 6, overflow: 'hidden', backgroundColor: '#333', marginRight: 12 }}>
          {item.cover_image
            ? <Image source={{ uri: item.cover_image }} style={{ width: 50, height: 50 }} resizeMode="cover" />
            : <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="musical-note" size={22} color="#666" /></View>
          }
        </View>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={{ color: 'white', fontWeight: '600', fontSize: 15 }} numberOfLines={1}>{item.title}</Text>
          <Text style={{ color: '#888', fontSize: 13, marginTop: 2 }} numberOfLines={1}>{artistName}</Text>
        </View>
        <TouchableOpacity onPress={() => handleAddSong(item)} disabled={isAdded} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name={isAdded ? "checkmark-circle" : "add-circle-outline"} size={30} color={isAdded ? "#30D158" : "white"} />
        </TouchableOpacity>
      </View>
    );
  }, [addedIds, jamQueue, handleAddSong]);

  // ── Render: album card (lưới 2 cột) ──────────────────────
  const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;
  const renderAlbumCard = useCallback(({ item }: { item: Playlist }) => {
    return (
      <TouchableOpacity
        onPress={() => handleSelectAlbum(item)}
        style={{
          width: CARD_WIDTH,
          marginBottom: 16,
          marginHorizontal: 4,
        }}
      >
        {/* Cover */}
        <View style={{
          width: CARD_WIDTH, height: CARD_WIDTH,
          borderRadius: 10, overflow: 'hidden',
          backgroundColor: '#1e1e1e',
          marginBottom: 8,
        }}>
          {item.cover_image ? (
            <Image source={{ uri: item.cover_image }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="disc" size={40} color="#444" />
            </View>
          )}
        </View>
        <Text style={{ color: 'white', fontSize: 13, fontWeight: '700' }} numberOfLines={1}>{item.name}</Text>
        <Text style={{ color: '#888', fontSize: 11, marginTop: 2 }} numberOfLines={1}>
          {item.tracks?.length ?? 0} bài hát
        </Text>
      </TouchableOpacity>
    );
  }, [CARD_WIDTH, handleSelectAlbum]);

  const keyExtractor = useCallback((item: Song) => item._id, []);
  const albumKeyExtractor = useCallback((item: Playlist) => item._id, []);
  const isSearching = searchQuery.trim().length > 0;

  // ── Active list data ──────────────────────────────────────
  const activeData = isSearching ? searchResults : activeTab === 'suggested' ? suggested : liked;
  const isLoading = isSearching ? searchLoading : activeTab === 'suggested' ? loadingSuggested : loadingLiked;

  // ── Tab bar items ─────────────────────────────────────────
  const TABS: { key: TabKey; label: string; icon: string }[] = [
    { key: 'suggested', label: 'Đề xuất', icon: 'sparkles' },
    { key: 'liked',     label: 'Đã thích', icon: 'heart' },
    { key: 'album',     label: 'Album',    icon: 'disc' },
  ];

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose} statusBarTranslucent>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.65)' }}>
          <TouchableWithoutFeedback>
            <View style={{
              backgroundColor: '#121212',
              height: SCREEN_HEIGHT * 0.88,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
            }}>
              {/* Handle bar */}
              <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 6 }}>
                <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#555' }} />
              </View>

              {/* Header: back hoặc title */}
              {selectedAlbum && activeTab === 'album' ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 10 }}>
                  <TouchableOpacity
                    onPress={() => { setSelectedAlbum(null); setAlbumSongs([]); }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={{ marginRight: 10 }}
                  >
                    <Ionicons name="chevron-back" size={24} color="white" />
                  </TouchableOpacity>
                  {selectedAlbum.cover_image && (
                    <Image
                      source={{ uri: selectedAlbum.cover_image }}
                      style={{ width: 36, height: 36, borderRadius: 6, marginRight: 10 }}
                    />
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }} numberOfLines={1}>
                      {selectedAlbum.name}
                    </Text>
                    <Text style={{ color: '#888', fontSize: 12 }}>{albumSongs.length} bài hát</Text>
                  </View>
                </View>
              ) : (
                <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 14 }}>
                  Thêm bài hát
                </Text>
              )}

              {/* Search bar — ẩn khi đang xem bài trong album */}
              {!(selectedAlbum && activeTab === 'album') && (
                <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E1E1E', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 }}>
                    <Ionicons name="search" size={20} color="#AAA" />
                    <TextInput
                      placeholder="Tìm kiếm bài hát, nghệ sĩ..."
                      placeholderTextColor="#666"
                      style={{ color: 'white', marginLeft: 8, flex: 1, fontSize: 15 }}
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      returnKeyType="search"
                    />
                    {searchQuery.length > 0 && (
                      <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={18} color="#888" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}

              {/* Tab bar — ẩn khi đang search hoặc xem bài trong album */}
              {!isSearching && !(selectedAlbum && activeTab === 'album') && (
                <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#2a2a2a', marginBottom: 4 }}>
                  {TABS.map(tab => (
                    <TouchableOpacity
                      key={tab.key}
                      onPress={() => {
                        setActiveTab(tab.key);
                        setSelectedAlbum(null);
                        setAlbumSongs([]);
                      }}
                      style={{
                        flex: 1,
                        alignItems: 'center',
                        paddingVertical: 12,
                        borderBottomWidth: activeTab === tab.key ? 2 : 0,
                        borderBottomColor: '#EC4899',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        gap: 4,
                      }}
                    >
                      <Ionicons
                        name={tab.icon as any}
                        size={13}
                        color={activeTab === tab.key ? '#EC4899' : '#666'}
                      />
                      <Text style={{
                        color: activeTab === tab.key ? 'white' : '#666',
                        fontWeight: activeTab === tab.key ? '700' : '400',
                        fontSize: 13,
                      }}>
                        {tab.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Subtitle */}
              {!isSearching && !(selectedAlbum && activeTab === 'album') && (
                <Text style={{ color: '#888', fontSize: 12, paddingHorizontal: 16, paddingTop: 6, marginBottom: 2 }}>
                  {activeTab === 'suggested' ? 'Dựa trên gu nghe nhạc của bạn'
                    : activeTab === 'liked' ? 'Những bài bạn đã thích'
                    : 'Album do admin tạo'}
                </Text>
              )}

              {/* ── ALBUM TAB: lưới album ── */}
              {activeTab === 'album' && !selectedAlbum && (
                loadingAlbums ? (
                  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator color="#EC4899" size="large" />
                  </View>
                ) : (
                  <FlatList
                    data={albums}
                    keyExtractor={albumKeyExtractor}
                    renderItem={renderAlbumCard}
                    numColumns={2}
                    style={{ flex: 1 }}
                    contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 8, paddingBottom: 40 }}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                      <View style={{ alignItems: 'center', paddingTop: 80, gap: 12 }}>
                        <Ionicons name="disc-outline" size={44} color="#444" />
                        <Text style={{ color: '#555', fontSize: 14 }}>Chưa có album nào</Text>
                      </View>
                    }
                  />
                )
              )}

              {/* ── ALBUM TAB: bài hát trong album ── */}
              {activeTab === 'album' && selectedAlbum && (
                loadingAlbumSongs ? (
                  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator color="#EC4899" size="large" />
                  </View>
                ) : (
                  <FlatList
                    data={albumSongs}
                    keyExtractor={keyExtractor}
                    renderItem={renderSongRow}
                    style={{ flex: 1 }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ paddingBottom: 40 }}
                    ListEmptyComponent={
                      <View style={{ alignItems: 'center', paddingTop: 80, gap: 12 }}>
                        <Ionicons name="musical-notes-outline" size={44} color="#444" />
                        <Text style={{ color: '#555', fontSize: 14 }}>Album chưa có bài hát</Text>
                      </View>
                    }
                  />
                )
              )}

              {/* ── SUGGESTED / LIKED / SEARCH tabs ── */}
              {activeTab !== 'album' && (
                isLoading ? (
                  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator color="#EC4899" size="large" />
                  </View>
                ) : (
                  <FlatList
                    data={activeData}
                    keyExtractor={keyExtractor}
                    renderItem={renderSongRow}
                    style={{ flex: 1 }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ paddingBottom: 40 }}
                    ListEmptyComponent={
                      <View style={{ alignItems: 'center', paddingTop: 80, gap: 12 }}>
                        <Ionicons
                          name={isSearching ? "search-outline" : activeTab === 'liked' ? "heart-outline" : "musical-notes-outline"}
                          size={44} color="#444"
                        />
                        <Text style={{ color: '#555', fontSize: 14 }}>
                          {isSearching ? 'Không tìm thấy bài hát nào' : activeTab === 'liked' ? 'Bạn chưa thích bài hát nào' : 'Không có bài hát đề xuất'}
                        </Text>
                      </View>
                    }
                  />
                )
              )}

            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
