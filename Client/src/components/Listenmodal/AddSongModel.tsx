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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { searchSongs, getRandomSongs, Song as SongAPIType } from "../../API/songAPI";
import { getLikedSongs } from "../../API/libraryAPI";
import { Song } from "../../API/musicAPI";
import { useMusic } from "../../context/MusicContext";
import { useSocket } from "../../context/SocketContext";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface AddSongModalProps {
  visible: boolean;
  onClose: () => void;
  roomId?: string;
  /** Danh sách bài hiện có trong Jam (dùng để check isAdded) */
  jamQueue?: Song[];
  /** Callback khi user thêm một bài thành công (local) */
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

type TabKey = 'suggested' | 'liked';

export default function AddSongModal({ visible, onClose, roomId, jamQueue = [], onSongAdded }: AddSongModalProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('suggested');
  const { appendToQueue } = useMusic();
  const { socket, currentUserId } = useSocket();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [suggested, setSuggested] = useState<Song[]>([]);
  const [liked, setLiked] = useState<Song[]>([]);
  const [loadingSuggested, setLoadingSuggested] = useState(false);
  const [loadingLiked, setLoadingLiked] = useState(false);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!visible) return;
    let mounted = true;
    setSearchQuery('');
    setSearchResults([]);
    setAddedIds(new Set());
    setActiveTab('suggested');

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

    loadSuggested();
    loadLiked();
    return () => { mounted = false; };
  }, [visible]);

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

  const handleAddSong = useCallback((song: Song) => {
    // Nếu có roomId (trong Jam): chỉ emit socket, không appendToQueue local
    // (MusicContext queue sẽ được quản lý bởi MainTabs qua playSong/appendToQueue)
    if (socket && roomId && currentUserId) {
      socket.emit('music_action', {
        roomId, action: 'add_to_queue',
        songInfo: { _id: song._id, title: song.title, cover_image: song.cover_image, file_url: song.file_url, artist_ids: song.artist_ids },
      });
    } else {
      // Outside Jam — add to MusicContext directly
      appendToQueue(song);
    }
    onSongAdded?.(song);
    setAddedIds(prev => new Set(prev).add(song._id));
  }, [appendToQueue, socket, roomId, currentUserId, onSongAdded]);

  const renderItem = useCallback(({ item }: { item: Song }) => {
    const artistName = item.artist_ids?.map(a => a.name).join(', ') ?? '';
    // Kiểm tra dựa vào jamQueue (thực tế) nếu đang trong Jam, không dùng MusicContext.queue
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

  const keyExtractor = useCallback((item: Song) => item._id, []);
  const isSearching = searchQuery.trim().length > 0;
  const activeData = isSearching ? searchResults : activeTab === 'suggested' ? suggested : liked;
  const isLoading = isSearching ? searchLoading : activeTab === 'suggested' ? loadingSuggested : loadingLiked;

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose} statusBarTranslucent>
      {/*
       * Pattern đúng cho "tap outside to close":
       * Lớp ngoài: TouchableWithoutFeedback → onPress={onClose}
       * Lớp trong: TouchableWithoutFeedback (không onPress) bọc content View
       *
       * TouchableWithoutFeedback KHÔNG chặn gesture của FlatList con.
       * Pressable với onPress={() => {}} thì CÓ chặn → đó là bug cũ.
       */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.65)' }}>

          <TouchableWithoutFeedback>
            {/* View thuần túy — không Pressable, không onPress — FlatList scroll tự do */}
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

              {/* Title */}
              <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 14 }}>
                Thêm bài hát
              </Text>

              {/* Search bar */}
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

              {/* Tab bar */}
              {!isSearching && (
                <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#2a2a2a', marginBottom: 4 }}>
                  {([
                    { key: 'suggested' as TabKey, label: '✧ Đề xuất' },
                    { key: 'liked'     as TabKey, label: '♥ Đã thích' },
                  ]).map(tab => (
                    <TouchableOpacity
                      key={tab.key}
                      onPress={() => setActiveTab(tab.key)}
                      style={{ flex: 1, alignItems: 'center', paddingVertical: 12, borderBottomWidth: activeTab === tab.key ? 2 : 0, borderBottomColor: '#EC4899' }}
                    >
                      <Text style={{ color: activeTab === tab.key ? 'white' : '#666', fontWeight: activeTab === tab.key ? '700' : '400', fontSize: 14 }}>
                        {tab.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Subtitle */}
              {!isSearching && (
                <Text style={{ color: '#888', fontSize: 12, paddingHorizontal: 16, paddingTop: 6, marginBottom: 2 }}>
                  {activeTab === 'suggested' ? 'Dựa trên gu nghe nhạc của bạn' : 'Những bài bạn đã thích'}
                </Text>
              )}

              {/* FlatList — scroll hoàn toàn tự do */}
              {isLoading ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                  <ActivityIndicator color="#EC4899" size="large" />
                </View>
              ) : (
                <FlatList
                  data={activeData}
                  keyExtractor={keyExtractor}
                  renderItem={renderItem}
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
              )}

            </View>
          </TouchableWithoutFeedback>

        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
