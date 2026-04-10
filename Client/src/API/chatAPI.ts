import axiosClient from './axiosClient';

// ==================== TYPES ====================

export interface ChatMessage {
  _id: string;
  conversation_id: string;
  sender_id: {
    _id: string;
    username: string;
    profile: {
      display_name: string;
      avatar_url: string;
    };
  };
  type: 'text' | 'image' | 'music_card' | 'sticker';
  content: string;
  music_card_data?: {
    song_id: string;
    song_title: string;
    artist_name: string;
    artist_id?: string;
    cover_url: string;
    preview_url: string;
  };
  read_by: string[];
  is_revoked: boolean;
  is_edited?: boolean;
  created_at: string;
  updated_at: string;
}

// ==================== API FUNCTIONS ====================

/** Lấy lịch sử tin nhắn của 1 conversation */
export const getMessagesAPI = async (
  conversationId: string,
  limit = 50,
  beforeId?: string
): Promise<ChatMessage[]> => {
  const params: Record<string, any> = { limit };
  if (beforeId) params.beforeId = beforeId;
  const res = await axiosClient.get(`/chat/${conversationId}/messages`, { params });
  return res.data || [];
};

/** Gửi tin nhắn text */
export const sendMessageAPI = async (
  conversationId: string,
  content: string,
  type: 'text' | 'music_card' = 'text',
  songId?: string
): Promise<ChatMessage> => {
  const res = await axiosClient.post('/chat/send', {
    conversationId,
    type,
    content,
    songId,
  });
  return res.data;
};

/** Gửi tin nhắn hình ảnh */
export const sendImageAPI = async (
  conversationId: string,
  imageUri: string,
  fileName: string,
  mimeType: string = 'image/jpeg'
): Promise<ChatMessage> => {
  const formData = new FormData();
  formData.append('conversationId', conversationId);
  formData.append('type', 'image');
  // @ts-ignore — React Native FormData accepts { uri, name, type }
  formData.append('image', { uri: imageUri, name: fileName, type: mimeType });

  const res = await axiosClient.post('/chat/send', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

/** Thu hồi tin nhắn */
export const revokeMessageAPI = async (messageId: string): Promise<void> => {
  await axiosClient.put(`/chat/messages/${messageId}/revoke`);
};

/** Đánh dấu đã đọc */
export const markReadAPI = async (conversationId: string): Promise<void> => {
  await axiosClient.put(`/chat/${conversationId}/read`);
};

/** Chỉnh sửa tin nhắn */
export const editMessageAPI = async (messageId: string, content: string): Promise<ChatMessage> => {
  const res = await axiosClient.put(`/chat/messages/${messageId}/edit`, { content });
  return res.data;
};

/** Xóa tin nhắn (cho người gửi) */
export const deleteMessageAPI = async (messageId: string): Promise<void> => {
  await axiosClient.delete(`/chat/messages/${messageId}`);
};

