import axiosClient from './axiosClient';
import { BASE_URL } from './axiosClient';

// ========================= TYPES =========================

export type NotificationType = 'message' | 'friend_request' | 'new_album';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  /** URL string (từ server) hoặc null */
  avatar: string | null;
  time: string; // ISO date
  unread: boolean;
  // Tuỳ loại
  conversationId?: string;
  senderId?: string;
  unreadCount?: number;
  friendshipId?: string;
  requesterId?: string;
  albumId?: string;
}

export interface NotificationsResponse {
  notifications: AppNotification[];
  unreadCount: number;
}

// ========================= HELPERS =========================

/** Chuyển avatar URL tương đối → tuyệt đối */
export const resolveAvatarUrl = (avatar: string | null): string | null => {
  if (!avatar) return null;
  if (avatar.startsWith('http')) return avatar;
  return `${BASE_URL}${avatar.startsWith('/') ? '' : '/'}${avatar}`;
};

/** Format thời gian relative dạng "5 phút trước" */
export const formatTimeAgo = (isoDate: string): string => {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ngày trước`;
  return new Date(isoDate).toLocaleDateString('vi-VN');
};

// ========================= API FUNCTIONS =========================

/** Lấy toàn bộ thông báo (tin nhắn + kết bạn + album mới) */
export const getNotificationsAPI = async (): Promise<NotificationsResponse> => {
  const res = await axiosClient.get('/notifications');
  return res.data || { notifications: [], unreadCount: 0 };
};

/** Đánh dấu đã đọc conversation (xoá badge tin nhắn) */
export const markConversationReadAPI = async (conversationId: string): Promise<void> => {
  await axiosClient.put(`/notifications/read-messages/${conversationId}`);
};

/** Phản hồi lời mời kết bạn từ màn thông báo */
export const respondFriendNotifAPI = async (
  friendshipId: string,
  action: 'accept' | 'reject'
): Promise<{ success: boolean; status: string }> => {
  const res = await axiosClient.put(`/notifications/read-friend/${friendshipId}`, { action });
  return res.data;
};

/** Đánh dấu đã xem thông báo album → server sẽ không trả lại nữa */
export const markAlbumReadAPI = async (albumId: string): Promise<void> => {
  await axiosClient.put(`/notifications/read-album/${albumId}`);
};
