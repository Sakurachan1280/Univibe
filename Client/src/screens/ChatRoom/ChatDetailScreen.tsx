import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Modal,
  TouchableWithoutFeedback,
  Image,
  ActivityIndicator,
  StyleSheet,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { BASE_URL } from '../../API/axiosClient';
import { getUserProfileAPI } from '../../API/socialAPI';
import { startChatAPI } from '../../API/socialAPI';
import {
  ChatMessage,
  getMessagesAPI,
  sendMessageAPI,
  sendImageAPI,
  markReadAPI,
  editMessageAPI,
  deleteMessageAPI,
} from '../../API/chatAPI';
import { useSocket } from '../../context/SocketContext';
import { getRandomSongs, searchSongs, Song } from '../../API/songAPI';
import * as ImagePicker from 'expo-image-picker';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'ChatDetail'>;

export default function ChatDetailScreen({ route, navigation }: Props) {
  const { userId, conversationId: initialConvId } = route.params;
  const { socket, currentUserId } = useSocket();

  // Trạng thái online của người kia — seed từ DB, cập nhật realtime qua socket
  const [isOtherOnline, setIsOtherOnline] = useState(false);

  // ===== State =====
  const [otherUser, setOtherUser] = useState<{
    username: string;
    display_name?: string;
    avatar_url?: string;
  } | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [conversationId, setConversationId] = useState<string | null>(initialConvId || null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);

  // Music Picker
  const [musicPickerVisible, setMusicPickerVisible] = useState(false);
  const [songs, setSongs] = useState<Song[]>([]);
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingSongs, setLoadingSongs] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const isTypingEmittedRef = useRef(false);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  // ===== Load user profile =====
  useEffect(() => {
    if (userId) fetchOtherUser();
  }, [userId]);

  const fetchOtherUser = async () => {
    try {
      setLoadingUser(true);
      const data = await getUserProfileAPI(userId);
      const profile = data?.profile?.profile;
      const username = data?.profile?.username;
      const isOnline = data?.profile?.status?.is_online ?? false;
      setOtherUser({
        username: username || 'Người dùng',
        display_name: profile?.display_name,
        avatar_url: profile?.avatar_url,
      });
      // Seed trạng thái online từ DB
      setIsOtherOnline(isOnline);
    } catch (e) {
      setOtherUser({ username: 'Người dùng' });
    } finally {
      setLoadingUser(false);
    }
  };

  // ===== Lấy conversation =====
  useEffect(() => {
    const initConversation = async () => {
      if (conversationId) { loadMessages(conversationId); return; }
      try {
        const result = await startChatAPI(userId);
        if (result?.conversationId) {
          setConversationId(result.conversationId);
          loadMessages(result.conversationId);
        }
      } catch (e) { console.error('Start chat error:', e); }
    };
    if (!loadingUser) initConversation();
  }, [loadingUser]);

  // ===== Load lịch sử tin nhắn =====
  const loadMessages = async (convId: string) => {
    try {
      setLoadingMessages(true);
      const data = await getMessagesAPI(convId, 50);
      setMessages([...data].reverse());
      markReadAPI(convId).catch(() => {});
    } catch (e) {
      console.error('Load messages error:', e);
    } finally {
      setLoadingMessages(false);
    }
  };

  // ===== Socket: chat room events =====
  useEffect(() => {
    if (!socket || !conversationId) return;
    socket.emit('join_chat', conversationId);

    const handleNewMessage = (msg: ChatMessage) => {
      setMessages(prev => [...prev, msg]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    };
    const handleRevoked = ({ messageId }: { messageId: string }) => {
      setMessages(prev => prev.map(m => m._id === messageId ? { ...m, is_revoked: true } : m));
    };
    const handleTyping = ({ userId: typerId, isTyping: typing }: { userId: string; isTyping: boolean }) => {
      if (typerId !== currentUserId) setIsTyping(typing);
    };
    const handleMessageEdited = (data: { messageId: string, content: string, is_edited: boolean }) => {
      setMessages(prev => prev.map(m => m._id === data.messageId ? { ...m, content: data.content, is_edited: data.is_edited } : m));
    };
    const handleMessageDeleted = (data: { messageId: string }) => {
      setMessages(prev => prev.filter(m => m._id !== data.messageId));
    };

    socket.on('new_message', handleNewMessage);
    socket.on('message_revoked', handleRevoked);
    socket.on('typing', handleTyping);
    socket.on('message_edited', handleMessageEdited);
    socket.on('message_deleted', handleMessageDeleted);

    return () => {
      socket.emit('leave_chat', conversationId);
      socket.off('new_message', handleNewMessage);
      socket.off('message_revoked', handleRevoked);
      socket.off('typing', handleTyping);
      socket.off('message_edited', handleMessageEdited);
      socket.off('message_deleted', handleMessageDeleted);
    };
  }, [socket, conversationId, currentUserId]);

  // ===== Socket: theo dõi online/offline người đang chat (tách riêng để active ngay từ đầu) =====
  useEffect(() => {
    if (!socket) return;
    const handleStatusChange = ({ userId: changedId, status }: { userId: string; status: 'online' | 'offline' }) => {
      if (changedId === userId) {
        setIsOtherOnline(status === 'online');
      }
    };
    socket.on('user_status_change', handleStatusChange);
    return () => {
      socket.off('user_status_change', handleStatusChange);
    };
  }, [socket, userId]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 100);
    }
  }, [loadingMessages]);

  // ===== Helpers =====
  const getDisplayName = () => otherUser?.display_name || otherUser?.username || 'Người dùng';

  const getAvatarSource = () => {
    const url = otherUser?.avatar_url;
    if (!url) return require('../../../assets/Icon/ava.jpg');
    if (url.startsWith('http')) return { uri: url };
    return { uri: `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}` };
  };

  const getCoverSource = (url?: string) => {
    if (!url) return require('../../../assets/Icon/ava.jpg');
    if (url.startsWith('http')) return { uri: url };
    return { uri: `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}` };
  };

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // ===== Typing =====
  const handleInputChange = (text: string) => {
    setInputText(text);
    if (!socket || !conversationId) return;
    if (!isTypingEmittedRef.current) {
      socket.emit('typing', { room: conversationId, userId: currentUserId });
      isTypingEmittedRef.current = true;
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_typing', { room: conversationId, userId: currentUserId });
      isTypingEmittedRef.current = false;
    }, 1500);
  };

  // ===== Gửi text =====
  const handleSend = async () => {
    if (editingMessage) {
      try {
        setIsSending(true);
        await editMessageAPI(editingMessage._id, inputText.trim());
        setEditingMessage(null);
        setInputText('');
      } catch (e: any) {
        console.error('Edit message error:', e);
        Alert.alert('Lỗi', 'Không thể sửa tin nhắn. Vui lòng thử lại.');
      } finally {
        setIsSending(false);
      }
      return;
    }

    const text = inputText.trim();
    if (!text || !conversationId || isSending) return;
    setInputText('');
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (socket) socket.emit('stop_typing', { room: conversationId, userId: currentUserId });
    isTypingEmittedRef.current = false;
    try {
      setIsSending(true);
      await sendMessageAPI(conversationId, text);
    } catch (e) {
      console.error('Send message error:', e);
      setInputText(text);
    } finally {
      setIsSending(false);
    }
  };

  // ===== Music Picker =====
  const openMusicPicker = async () => {
    setMusicPickerVisible(true);
    setSearchQuery('');
    setLoadingSongs(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
    try {
      const data = await getRandomSongs(30);
      setSongs(data);
      setFilteredSongs(data);
    } catch (e) {
      console.error('Load songs error:', e);
    } finally {
      setLoadingSongs(false);
    }
  };

  const closeMusicPicker = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 280,
      useNativeDriver: true,
    }).start(() => setMusicPickerVisible(false));
    setSearchQuery('');
  };

  const handleSearchSong = (query: string) => {
    setSearchQuery(query);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (!query.trim()) {
      setFilteredSongs(songs);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await searchSongs(query);
        setFilteredSongs(results);
      } catch {
        // fallback: filter local
        const q = query.toLowerCase();
        setFilteredSongs(songs.filter(s =>
          s.title.toLowerCase().includes(q) ||
          (s.artist_ids || []).some(a => a.name.toLowerCase().includes(q))
        ));
      } finally {
        setIsSearching(false);
      }
    }, 400);
  };

  const handleSelectSong = async (song: Song) => {
    if (!conversationId) return;
    closeMusicPicker();
    try {
      setIsSending(true);
      await sendMessageAPI(
        conversationId,
        song.title,
        'music_card',
        song._id,
      );
    } catch (e) {
      console.error('Send music card error:', e);
      Alert.alert('Lỗi', 'Không thể gửi bài hát. Vui lòng thử lại.');
    } finally {
      setIsSending(false);
    }
  };

  // ===== Image Picker (Camera / Gallery) =====
  const handlePickImage = async () => {
    if (!conversationId) return;
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Quyền truy cập', 'Bạn cần cấp quyền truy cập album ảnh để gửi hình.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'] as any,
        allowsEditing: false,
        quality: 0.85,
      });
      if (result.canceled || !result.assets?.length) return;
      const asset = result.assets[0];
      const fileName = asset.fileName || `photo_${Date.now()}.jpg`;
      const mimeType = asset.mimeType || 'image/jpeg';

      setIsSending(true);
      await sendImageAPI(conversationId, asset.uri, fileName, mimeType);
      // server emits 'new_message' via socket → danh sách tự cập nhật
    } catch (e: any) {
      console.error('Image send error:', e);
      Alert.alert('Lỗi', 'Không thể gửi ảnh. Vui lòng thử lại.');
    } finally {
      setIsSending(false);
    }
  };

  // ===== Menu =====
  const handleCreateGroup = () => { setMenuVisible(false); };
  const handleCreateMusicRoom = () => { setMenuVisible(false); navigation.navigate('CreateRoom'); };

  const confirmDeleteMessage = async (messageId: string) => {
    try {
      await deleteMessageAPI(messageId);
    } catch (e) {
      console.error('Delete message error:', e);
      Alert.alert('Lỗi', 'Không thể xóa tin nhắn.');
    }
  };

  const handleLongPressMessage = (item: ChatMessage) => {
    const senderId = typeof item.sender_id === 'object' ? item.sender_id._id : item.sender_id;
    if (senderId !== currentUserId) return;
    if (item.is_revoked) return;

    const buttons: any[] = [];

    if (item.type === 'text') {
      buttons.push({
        text: 'Chỉnh sửa',
        onPress: () => {
          setEditingMessage(item);
          setInputText(item.content);
        }
      });
    }

    buttons.push({
      text: 'Xóa',
      style: 'destructive',
      onPress: () => {
        Alert.alert('Xác nhận xóa', 'Bạn có chắc chắn muốn xóa tin nhắn này?', [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Xóa', style: 'destructive', onPress: () => confirmDeleteMessage(item._id) }
        ]);
      }
    });

    buttons.push({ text: 'Hủy', style: 'cancel' });

    Alert.alert('Tùy chọn tin nhắn', '', buttons);
  };

  // ===== Render message =====
  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const senderId = typeof item.sender_id === 'object' ? item.sender_id._id : item.sender_id;
    const isMe = senderId === currentUserId;

    if (item.is_revoked) {
      return (
        <View style={[styles.msgRow, isMe ? styles.msgRowRight : styles.msgRowLeft]}>
          <View style={styles.revokedBubble}>
            <Text style={styles.revokedText}>Tin nhắn đã bị thu hồi</Text>
          </View>
        </View>
      );
    }

    // Music card
    if (item.type === 'music_card' && item.music_card_data) {
      const card = item.music_card_data;
      return (
        <View style={[styles.msgRow, isMe ? styles.msgRowRight : styles.msgRowLeft]}>
          {!isMe && (
            <View style={styles.avatarSmall}>
              <Image source={getAvatarSource()} style={styles.avatarSmallImg} resizeMode="cover" />
            </View>
          )}
          <View style={styles.msgWrapper}>
            <TouchableOpacity
              activeOpacity={0.85}
              onLongPress={() => handleLongPressMessage(item)}
              onPress={() => navigation.navigate('MusicPlayer', {
                song: {
                  _id: card.song_id,
                  title: card.song_title,
                  artist_ids: [{ _id: card.song_id, name: card.artist_name }],
                  cover_image: card.cover_url,
                  file_url: card.preview_url,
                }
              })}
              style={[styles.musicCard, isMe ? styles.musicCardMe : styles.musicCardOther]}
            >
              {/* Cover art with gradient */}
              <View style={styles.musicCardCoverWrap}>
                <Image
                  source={getCoverSource(card.cover_url)}
                  style={styles.musicCardCover}
                  resizeMode="cover"
                />
              </View>

              {/* Info */}
              <View style={styles.musicCardInfo}>
                {/* Badge */}
                <View style={styles.musicCardBadge}>
                  <Ionicons name="musical-note" size={9} color="#EC4899" />
                  <Text style={styles.musicCardBadgeText}>BÀI HÁT</Text>
                </View>
                <Text style={styles.musicCardTitle} numberOfLines={1}>
                  {card.song_title}
                </Text>
                <Text style={styles.musicCardArtist} numberOfLines={1}>
                  {card.artist_name}
                </Text>
              </View>

              {/* Play icon */}
              <View style={styles.musicCardPlayWrap}>
                <View style={[styles.musicCardPlayBtn, isMe ? styles.musicCardPlayBtnMe : styles.musicCardPlayBtnOther]}>
                  <Ionicons name="play" size={14} color={isMe ? '#EC4899' : '#fff'} style={{ marginLeft: 2 }} />
                </View>
              </View>
            </TouchableOpacity>
            <Text style={[styles.msgTime, isMe ? styles.msgTimeRight : styles.msgTimeLeft]}>
              {formatTime(item.created_at)}
            </Text>
          </View>
        </View>
      );
    }

    // Image message
    if (item.type === 'image') {
      return (
        <View style={[styles.msgRow, isMe ? styles.msgRowRight : styles.msgRowLeft]}>
          {!isMe && (
            <View style={styles.avatarSmall}>
              <Image source={getAvatarSource()} style={styles.avatarSmallImg} resizeMode="cover" />
            </View>
          )}
          <View style={styles.msgWrapper}>
            <TouchableOpacity
              activeOpacity={0.9}
              onLongPress={() => handleLongPressMessage(item)}
              style={[styles.imageMsgBubble, isMe ? styles.bubbleMe : styles.bubbleOther]}
            >
              <Image source={{ uri: item.content }} style={styles.imageMsg} resizeMode="cover" />
            </TouchableOpacity>
            <Text style={[styles.msgTime, isMe ? styles.msgTimeRight : styles.msgTimeLeft]}>
              {formatTime(item.created_at)}
            </Text>
          </View>
        </View>
      );
    }

    // Text message
    return (
      <View style={[styles.msgRow, isMe ? styles.msgRowRight : styles.msgRowLeft]}>
        {!isMe && (
          <View style={styles.avatarSmall}>
            <Image source={getAvatarSource()} style={styles.avatarSmallImg} resizeMode="cover" />
          </View>
        )}
        <View style={styles.msgWrapper}>
          <TouchableOpacity 
            activeOpacity={0.8}
            onLongPress={() => handleLongPressMessage(item)}
            style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}
          >
            <Text style={styles.bubbleText}>{item.content}</Text>
          </TouchableOpacity>
          <View style={[styles.msgFooter, isMe ? styles.msgFooterRight : styles.msgFooterLeft]}>
            {item.is_edited && <Text style={styles.msgEdited}>(Đã sửa) </Text>}
            <Text style={[styles.msgTime, isMe ? styles.msgTimeRight : styles.msgTimeLeft]}>
              {formatTime(item.created_at)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // ===== Song item in picker =====
  const renderSongItem = ({ item }: { item: Song }) => {
    const artistNames = (item.artist_ids || []).map(a => a.name).join(', ') || item.artist || 'Unknown';
    return (
      <TouchableOpacity style={styles.songItem} onPress={() => handleSelectSong(item)} activeOpacity={0.7}>
        <Image source={getCoverSource(item.cover_image || item.coverUrl)} style={styles.songCover} resizeMode="cover" />
        <View style={styles.songInfo}>
          <Text style={styles.songTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.songArtist} numberOfLines={1}>{artistNames}</Text>
        </View>
        <Ionicons name="paper-plane-outline" size={18} color="#EC4899" />
      </TouchableOpacity>
    );
  };

  // ===== Loading =====
  if (loadingUser) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#EC4899" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={22} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerCenter}
          onPress={() => userId ? navigation.navigate('UserProfile', { userId }) : undefined}
          activeOpacity={0.75}
        >
          <View style={styles.headerAvatarWrap}>
            <Image source={getAvatarSource()} style={styles.headerAvatar} resizeMode="cover" />
            {isOtherOnline && <View style={styles.onlineDot} />}
          </View>
          <View>
            <Text style={styles.headerName}>{getDisplayName()}</Text>
            <Text style={[styles.headerSub, isOtherOnline && !isTyping ? styles.headerSubOnline : {}]}>
              {isTyping ? 'Đang nhập...' : isOtherOnline ? 'Đang hoạt động' : 'Ngoại tuyến'}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.headerBtn}>
          <Ionicons name="ellipsis-horizontal" size={22} color="white" />
        </TouchableOpacity>
      </View>

      {/* ── Options Menu Modal ── */}
      <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.menuOverlay}>
            <View style={styles.menuBox}>
              <TouchableOpacity onPress={handleCreateGroup} style={styles.menuItem}>
                <View style={styles.menuIcon}><Ionicons name="people-outline" size={18} color="#EC4899" /></View>
                <Text style={styles.menuText}>Tạo nhóm chat</Text>
                <Ionicons name="chevron-forward" size={16} color="#555" />
              </TouchableOpacity>
              <View style={styles.menuDivider} />
              <TouchableOpacity onPress={handleCreateMusicRoom} style={styles.menuItem}>
                <View style={styles.menuIcon}><Ionicons name="musical-notes-outline" size={18} color="#EC4899" /></View>
                <Text style={styles.menuText}>Tạo phòng nghe nhạc</Text>
                <Ionicons name="chevron-forward" size={16} color="#555" />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* ── Messages ── */}
      {loadingMessages ? (
        <View style={styles.centerFlex}>
          <ActivityIndicator size="large" color="#EC4899" />
        </View>
      ) : messages.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyAvatarWrap}>
            <Image source={getAvatarSource()} style={styles.emptyAvatar} resizeMode="cover" />
          </View>
          <Text style={styles.emptyName}>{getDisplayName()}</Text>
          <Text style={styles.emptyHint}>Hãy bắt đầu cuộc trò chuyện với {getDisplayName()}! 👋</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item._id}
          renderItem={renderMessage}
          contentContainerStyle={{ paddingVertical: 12 }}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            isTyping ? (
              <View style={styles.typingRow}>
                <View style={styles.avatarSmall}>
                  <Image source={getAvatarSource()} style={styles.avatarSmallImg} resizeMode="cover" />
                </View>
                <View style={styles.typingBubble}>
                  <View style={styles.typingDot} />
                  <View style={[styles.typingDot, { opacity: 0.7 }]} />
                  <View style={[styles.typingDot, { opacity: 0.4 }]} />
                </View>
              </View>
            ) : null
          }
        />
      )}

      {/* ── Input Bar ── */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={{ width: '100%' }}>
          {editingMessage && (
            <View style={styles.editingBar}>
              <View>
                <Text style={styles.editingLabel}>Đang chỉnh sửa</Text>
                <Text style={styles.editingPreview} numberOfLines={1}>{editingMessage.content}</Text>
              </View>
              <TouchableOpacity onPress={() => { setEditingMessage(null); setInputText(''); }}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.inputBar}>
          {/* + button */}
          <TouchableOpacity style={styles.inputAction} onPress={openMusicPicker}>
            <View style={styles.inputActionCircle}>
              <Ionicons name="add" size={20} color="#fff" />
            </View>
          </TouchableOpacity>

          {/* Camera button */}
          <TouchableOpacity style={styles.inputAction} onPress={handlePickImage}>
            <Ionicons name="camera-outline" size={24} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Text input */}
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              placeholder="Nhắn tin..."
              placeholderTextColor="#555"
              value={inputText}
              onChangeText={handleInputChange}
              onSubmitEditing={handleSend}
              multiline
            />
          </View>

          {/* Send button */}
          <TouchableOpacity
            onPress={handleSend}
            style={styles.sendBtn}
            disabled={!inputText.trim() || isSending}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#EC4899" />
            ) : (
              <Ionicons
                name={editingMessage ? "checkmark-circle" : "send"}
                size={22}
                color={inputText.trim() ? '#EC4899' : '#555'}
              />
            )}
          </TouchableOpacity>
        </View>
        </View>
      </KeyboardAvoidingView>

      {/* ── Music Picker Modal ── */}
      <Modal
        visible={musicPickerVisible}
        transparent
        animationType="none"
        onRequestClose={closeMusicPicker}
      >
        <TouchableWithoutFeedback onPress={closeMusicPicker}>
          <View style={styles.pickerOverlay} />
        </TouchableWithoutFeedback>

        <Animated.View style={[styles.pickerSheet, { transform: [{ translateY: slideAnim }] }]}>
          {/* Handle bar */}
          <View style={styles.pickerHandle} />

          {/* Title */}
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>Gửi bài hát</Text>
            <TouchableOpacity onPress={closeMusicPicker} style={styles.pickerClose}>
              <Ionicons name="close" size={22} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={styles.searchBox}>
            <Ionicons name="search" size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm bài hát..."
              placeholderTextColor="#555"
              value={searchQuery}
              onChangeText={handleSearchSong}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => handleSearchSong('')}>
                <Ionicons name="close-circle" size={18} color="#555" />
              </TouchableOpacity>
            )}
          </View>

          {/* Song list */}
          {loadingSongs || isSearching ? (
            <View style={styles.centerFlex}>
              <ActivityIndicator size="large" color="#EC4899" />
            </View>
          ) : filteredSongs.length === 0 ? (
            <View style={styles.centerFlex}>
              <Ionicons name="musical-notes-outline" size={48} color="#333" />
              <Text style={styles.emptyText}>Không tìm thấy bài hát</Text>
            </View>
          ) : (
            <FlatList
              data={filteredSongs}
              keyExtractor={item => item._id}
              renderItem={renderSongItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 30 }}
            />
          )}
        </Animated.View>
      </Modal>

    </SafeAreaView>
  );
}

// ===================== STYLES =====================
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0a0a0a' },
  loadingScreen: { flex: 1, backgroundColor: '#0a0a0a', alignItems: 'center', justifyContent: 'center' },
  centerFlex: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // ── Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
    backgroundColor: '#0a0a0a',
  },
  headerBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, gap: 10 },
  headerAvatarWrap: { position: 'relative' },
  headerAvatar: { width: 38, height: 38, borderRadius: 19 },
  onlineDot: {
    position: 'absolute', bottom: 1, right: 1,
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: '#22C55E', borderWidth: 2, borderColor: '#0a0a0a',
  },
  headerName: { color: '#fff', fontSize: 15, fontWeight: '700' },
  headerSub: { color: '#6B7280', fontSize: 11, marginTop: 1 },
  headerSubOnline: { color: '#22C55E' },

  // ── Menu Modal
  menuOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  menuBox: {
    position: 'absolute', top: 58, right: 12,
    backgroundColor: '#1a1a1a', borderRadius: 16, width: 230,
    borderWidth: 1, borderColor: '#2a2a2a',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 20,
    elevation: 10,
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 10 },
  menuIcon: {
    width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(236,72,153,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  menuText: { flex: 1, color: '#fff', fontSize: 14 },
  menuDivider: { height: 1, backgroundColor: '#2a2a2a', marginHorizontal: 16 },

  // ── Messages
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', marginVertical: 3, marginHorizontal: 12 },
  msgRowRight: { justifyContent: 'flex-end' },
  msgRowLeft: { justifyContent: 'flex-start' },
  avatarSmall: { width: 28, height: 28, borderRadius: 14, overflow: 'hidden', backgroundColor: '#2a2a2a', marginRight: 6, marginBottom: 14 },
  avatarSmallImg: { width: '100%', height: '100%' },
  msgWrapper: { maxWidth: '72%' },

  bubble: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleMe: { backgroundColor: '#EC4899' },
  bubbleOther: { backgroundColor: '#1e1e1e' },
  bubbleText: { color: '#fff', fontSize: 15, lineHeight: 21 },
  msgFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  msgFooterRight: { justifyContent: 'flex-end' },
  msgFooterLeft: { justifyContent: 'flex-start' },
  msgEdited: { fontSize: 10, color: '#9CA3AF', fontStyle: 'italic' },
  msgTime: { fontSize: 10, color: '#555' },
  msgTimeRight: { textAlign: 'right' },
  msgTimeLeft: { textAlign: 'left' },

  revokedBubble: {
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 16,
    backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#2a2a2a',
  },
  revokedText: { color: '#555', fontSize: 13, fontStyle: 'italic' },

  // Music card
  musicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    width: 272,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  musicCardMe: { backgroundColor: '#a82070', borderRadius: 18 },
  musicCardOther: { backgroundColor: '#1c1c1c', borderWidth: 1, borderColor: '#2e2e2e', borderRadius: 18 },
  musicCardCoverWrap: {
    width: 68, height: 68,
    borderRadius: 12,
    overflow: 'hidden',
    margin: 8,
  },
  musicCardCover: { width: 68, height: 68 },
  musicCardInfo: { flex: 1, paddingHorizontal: 10, paddingVertical: 9 },
  musicCardBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 5,
    backgroundColor: 'rgba(236,72,153,0.18)', alignSelf: 'flex-start',
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5,
  },
  musicCardBadgeText: { color: '#EC4899', fontSize: 8, fontWeight: '800', letterSpacing: 0.8 },
  musicCardTitle: { color: '#fff', fontSize: 13, fontWeight: '700', marginBottom: 3, letterSpacing: 0.1 },
  musicCardArtist: { color: 'rgba(255,255,255,0.55)', fontSize: 11 },
  musicCardPlayWrap: { paddingRight: 12 },
  musicCardPlayBtn: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  musicCardPlayBtnMe: { backgroundColor: 'rgba(255,255,255,0.2)' },
  musicCardPlayBtnOther: { backgroundColor: '#EC4899' },

  // Image message
  imageMsgBubble: { borderRadius: 16, overflow: 'hidden' },
  imageMsg: { width: 200, height: 150 },

  // ── Empty state
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  emptyAvatarWrap: {
    width: 72, height: 72, borderRadius: 36, overflow: 'hidden',
    backgroundColor: '#1e1e1e', marginBottom: 16,
    borderWidth: 2, borderColor: '#2a2a2a',
  },
  emptyAvatar: { width: '100%', height: '100%' },
  emptyName: { color: '#fff', fontSize: 17, fontWeight: '700', marginBottom: 6 },
  emptyHint: { color: '#555', fontSize: 14, textAlign: 'center', lineHeight: 20 },
  emptyText: { color: '#444', fontSize: 14, marginTop: 12 },

  // ── Typing
  typingRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 12, marginVertical: 4 },
  typingBubble: {
    backgroundColor: '#1e1e1e', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 12,
    flexDirection: 'row', gap: 4, alignItems: 'center',
  },
  typingDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#9CA3AF' },

  // ── Input bar
  editingBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#1a1a1a', paddingHorizontal: 16, paddingVertical: 8,
    borderTopWidth: 1, borderTopColor: '#2a2a2a', borderTopLeftRadius: 16, borderTopRightRadius: 16,
  },
  editingLabel: { color: '#EC4899', fontSize: 12, fontWeight: '700', marginBottom: 2 },
  editingPreview: { color: '#9CA3AF', fontSize: 13, maxWidth: 250 },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: 10, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: '#1a1a1a',
    backgroundColor: '#0a0a0a',
    gap: 6,
  },
  inputAction: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 1 },
  inputActionCircle: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#EC4899', alignItems: 'center', justifyContent: 'center',
  },
  inputBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1a1a1a', borderRadius: 22,
    borderWidth: 1, borderColor: '#2a2a2a',
    paddingHorizontal: 14, paddingVertical: 8, minHeight: 40,
  },
  input: { flex: 1, color: '#fff', fontSize: 15, maxHeight: 100, paddingTop: 0, paddingBottom: 0 },
  sendBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 1 },

  // ── Music Picker sheet
  pickerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  pickerSheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: SCREEN_HEIGHT * 0.72,
    backgroundColor: '#111',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 16, paddingBottom: 0,
  },
  pickerHandle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: '#333',
    alignSelf: 'center', marginTop: 10, marginBottom: 4,
  },
  pickerHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 12,
  },
  pickerTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  pickerClose: { padding: 4 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1a1a1a', borderRadius: 14,
    borderWidth: 1, borderColor: '#2a2a2a',
    paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12,
  },
  searchInput: { flex: 1, color: '#fff', fontSize: 14, padding: 0 },

  // Song item
  songItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#1a1a1a', gap: 12,
  },
  songCover: { width: 50, height: 50, borderRadius: 10, backgroundColor: '#1e1e1e' },
  songInfo: { flex: 1 },
  songTitle: { color: '#fff', fontSize: 14, fontWeight: '600', marginBottom: 3 },
  songArtist: { color: '#9CA3AF', fontSize: 12 },
});
