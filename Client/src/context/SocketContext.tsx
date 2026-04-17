import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { io, Socket } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';
import { BASE_URL } from '../API/axiosClient';
import { getMeAPI } from '../API/userAPI';
import { getNotificationsAPI } from '../API/notificationAPI';

interface SocketContextType {
  socket: Socket | null;
  onlineUserIds: Set<string>;
  currentUserId: string | null;
  connectSocket: () => Promise<void>;
  disconnectSocket: () => void;
  unreadNotificationCount: number;
  setUnreadNotificationCount: React.Dispatch<React.SetStateAction<number>>;
  refreshNotificationCount: () => Promise<void>;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  onlineUserIds: new Set(),
  currentUserId: null,
  connectSocket: async () => {},
  disconnectSocket: () => {},
  unreadNotificationCount: 0,
  setUnreadNotificationCount: () => {},
  refreshNotificationCount: async () => {},
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const socketRef = useRef<Socket | null>(null);
  // socketState is the reactive version of socketRef — needed so consumers re-render when socket connects
  const [socketState, setSocketState] = useState<Socket | null>(null);
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  const connectSocket = async () => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      if (!token) return; // Khách chưa đăng nhập

      const me = await getMeAPI();
      console.log('[Socket] GetMe result:', me ? 'Success' : 'Empty');
      if (!me?._id || !mountedRef.current) return;

      setCurrentUserId(me._id);

      // Tránh kết nối lại nếu socket đã kết nối với chính user này
      if (socketRef.current && socketRef.current.connected) {
         socketRef.current.disconnect();
      }

      // Khởi tạo socket
      const socket = io(BASE_URL, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
      });

      socketRef.current = socket;
      // Expose reactive socket so consumers re-render when it becomes available
      setSocketState(socket);

      socket.on('connect', () => {
        console.log('[Socket] Connected:', socket.id);
        socket.emit('user_connected', me._id);
      });

      socket.on('disconnect', () => {
        console.log('[Socket] Disconnected');
      });

      // Nhận snapshot danh sách online ngay khi kết nối
      socket.on('online_users_list', (userIds: string[]) => {
        setOnlineUserIds(new Set(userIds));
      });

      // Lắng nghe thay đổi trạng thái online/offline
      socket.on('user_status_change', ({ userId, status }: { userId: string; status: 'online' | 'offline' }) => {
        setOnlineUserIds(prev => {
          const next = new Set(prev);
          if (status === 'online') next.add(userId);
          else next.delete(userId);
          return next;
        });
      });

      // Nhận thông báo mới realtime → tăng badge
      socket.on('new_notification', () => {
        refreshNotificationCount();
      });

      // Khi có tin nhắn mới trong bất kỳ conversation nào
      socket.on('conversation_updated', (preview: any) => {
        const senderId = preview?.lastMessage?.sender_id?._id || preview?.lastMessage?.sender_id;
        if (senderId && senderId !== me._id) {
           // Cập nhật optimistic (ngay lập tức) để UI phản hồi nhanh
           setUnreadNotificationCount(prev => prev + 1);
           refreshNotificationCount();
        }
      });

      // Khi nhận lời mời Jam → tăng badge thông báo
      socket.on('jam_invite_received', () => {
        setUnreadNotificationCount(prev => prev + 1);
      });

    } catch (err: any) {
      if (err.response) {
        console.error('[Socket] API Error (500/401):', err.response.status, err.response.data);
      } else {
        console.error('[Socket] Connection error:', err.message);
      }
    }
  };

  const refreshNotificationCount = async () => {
    try {
      const data = await getNotificationsAPI();
      setUnreadNotificationCount(data.unreadCount ?? 0);
    } catch (err: any) {
      console.error('[Socket] Update notification count error:', err.message || err);
    }
  };

  // Removed useEffect as we moved listeners directly into connectSocket

  const disconnectSocket = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setSocketState(null);
    setCurrentUserId(null);
    setOnlineUserIds(new Set());
  };

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    connectSocket();

    return () => {
      mountedRef.current = false;
      disconnectSocket();
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{
        // Use reactive socketState so consumers (MainTabs etc.) re-render when socket connects
        socket: socketState,
        onlineUserIds,
        currentUserId,
        connectSocket,
        disconnectSocket,
        unreadNotificationCount,
        setUnreadNotificationCount,
        refreshNotificationCount,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
