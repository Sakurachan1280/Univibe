/**
 * JamInviteContext
 * Lưu trữ các lời mời Jam dạng notification và callback để
 * NotificationScreen có thể trigger join Jam từ xa.
 */
import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

export interface JamInviteNotif {
  id: string;               // unique ID
  roomId: string;
  hostName: string;
  jamName: string;
  hostAvatar?: string;
  receivedAt: number;       // timestamp (ms)
  expiresAt: number;        // receivedAt + 60 000
  expired: boolean;
}

interface JamInviteContextType {
  inviteNotifs: JamInviteNotif[];
  /** Thêm lời mời mới (gọi từ MainTabs khi nhận socket) */
  addInvite: (payload: Omit<JamInviteNotif, 'id' | 'receivedAt' | 'expiresAt' | 'expired'>) => void;
  /** Đánh dấu đã hết hạn */
  expireInvite: (id: string) => void;
  /** Callback join Jam — được set bởi MainTabs */
  onJoinJam: ((invite: JamInviteNotif) => void) | null;
  setOnJoinJam: (fn: (invite: JamInviteNotif) => void) => void;
}

const JamInviteContext = createContext<JamInviteContextType>({
  inviteNotifs: [],
  addInvite: () => {},
  expireInvite: () => {},
  onJoinJam: null,
  setOnJoinJam: () => {},
});

export const JamInviteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [inviteNotifs, setInviteNotifs] = useState<JamInviteNotif[]>([]);
  const onJoinJamRef = useRef<((invite: JamInviteNotif) => void) | null>(null);
  const [, forceUpdate] = useState(0);

  const addInvite = useCallback(
    (payload: Omit<JamInviteNotif, 'id' | 'receivedAt' | 'expiresAt' | 'expired'>) => {
      const now = Date.now();
      const notif: JamInviteNotif = {
        ...payload,
        id: `jam-${now}-${Math.random().toString(36).slice(2, 7)}`,
        receivedAt: now,
        expiresAt: now + 60_000, // 1 phút
        expired: false,
      };
      setInviteNotifs(prev => [notif, ...prev]);
    },
    []
  );

  const expireInvite = useCallback((id: string) => {
    setInviteNotifs(prev =>
      prev.map(n => n.id === id ? { ...n, expired: true } : n)
    );
  }, []);

  const setOnJoinJam = useCallback((fn: (invite: JamInviteNotif) => void) => {
    onJoinJamRef.current = fn;
    forceUpdate(v => v + 1);
  }, []);

  return (
    <JamInviteContext.Provider
      value={{
        inviteNotifs,
        addInvite,
        expireInvite,
        onJoinJam: onJoinJamRef.current,
        setOnJoinJam,
      }}
    >
      {children}
    </JamInviteContext.Provider>
  );
};

export const useJamInvite = () => useContext(JamInviteContext);
