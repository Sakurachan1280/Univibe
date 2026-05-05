import axiosClient from "./axiosClient";

// ==================== TYPES ====================

export interface SearchUser {
  _id: string;
  username: string;
  profile: {
    display_name: string;
    avatar_url: string;
  };
  status?: {
    is_online: boolean;
  };
}

export interface FriendshipStatus {
  status: 'none' | 'friends' | 'pending_sent' | 'pending_received' | 'blocked';
  friendshipId: string | null;
}

export interface UserProfileData {
  profile: {
    _id: string;
    username: string;
    email: string;
    role: string;
    profile: {
      display_name: string;
      avatar_url: string;
      cover_url: string;
      bio: string;
      dob?: string;
      genres_interest: string[];
      social_links: {
        instagram: string;
        spotify: string;
        facebook: string;
      };
    };
    status: {
      is_online: boolean;
      last_active: string;
    };
  };
  playlists: any[];
}

export interface Conversation {
  _id: string;
  participants: SearchUser[];
  otherParticipants?: SearchUser[]; // Server đã filter sẵn người còn lại
  last_message?: {
    content: string;
    created_at: string;
    sender_id: string | { username: string };
  };
  updated_at: string;
}

// ==================== API FUNCTIONS ====================

/** Tìm kiếm người dùng (chỉ role: user) */
export const searchUsersAPI = async (keyword: string): Promise<SearchUser[]> => {
  const res = await axiosClient.get(`/social/search?keyword=${encodeURIComponent(keyword)}`);
  return res.data || [];
};

/** Gửi lời mời kết bạn */
export const sendFriendRequestAPI = async (recipientId: string) => {
  const res = await axiosClient.post('/social/request', { recipientId });
  return res.data;
};

/** Phản hồi lời mời kết bạn (accept / reject) */
export const respondFriendRequestAPI = async (requestId: string, action: 'accept' | 'reject') => {
  const res = await axiosClient.post('/social/request/respond', { requestId, action });
  return res.data;
};

/** Hủy kết bạn / Block / Hủy lời mời */
export const modifyRelationAPI = async (
  targetUserId: string,
  action: 'unfriend' | 'block' | 'cancel_request'
) => {
  const res = await axiosClient.post('/social/relation/modify', { targetUserId, action });
  return res.data;
};

/** Xem profile người khác */
export const getUserProfileAPI = async (userId: string): Promise<UserProfileData> => {
  const res = await axiosClient.get(`/social/profile/${userId}`);
  return res.data;
};

/** Lấy danh sách bạn bè */
export const getFriendsAPI = async (): Promise<SearchUser[]> => {
  const res = await axiosClient.get('/social/friends');
  return res.data || [];
};

/** Lấy trạng thái quan hệ với 1 người */
export const getFriendshipStatusAPI = async (targetUserId: string): Promise<FriendshipStatus> => {
  const res = await axiosClient.get(`/social/status/${targetUserId}`);
  return res.data;
};

/** Lấy danh sách cuộc trò chuyện */
export const getConversationsAPI = async (): Promise<Conversation[]> => {
  const res = await axiosClient.get('/chat/conversations');
  return res.data || [];
};

/** Bắt đầu / tạo cuộc trò chuyện 1-1 */
export const startChatAPI = async (receiverId: string): Promise<{ conversationId: string }> => {
  const res = await axiosClient.post('/chat/start', { receiverId });
  // Server trả về conversation object, lấy _id làm conversationId
  return { conversationId: res.data?._id || res.data?.conversationId };
};

/** Lấy danh sách lời mời kết bạn đang chờ (pending_received) */
export const getPendingFriendRequestsAPI = async (): Promise<{
  _id: string;
  requester: SearchUser;
  created_at: string;
}[]> => {
  const res = await axiosClient.get('/social/requests/pending');
  return res.data || [];
};
