export interface User {
    id: string;
    name: string;
    avatar: string; // URL or local require
    isOnline: boolean;
}

export interface Message {
    id: string;
    text: string;
    senderId: string;
    timestamp: string;
}

export interface ChatSession {
    id: string;
    user: User;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount?: number;
}

export const CURRENT_USER_ID = 'me';

export const MOCK_USERS: User[] = [
    {
        id: '1',
        name: 'anh da đen',
        avatar: 'https://i.pravatar.cc/150?u=1',
        isOnline: true,
    },
    {
        id: '2',
        name: 'sakura',
        avatar: 'https://i.pravatar.cc/150?u=2',
        isOnline: true,
    },
    {
        id: '3',
        name: 'Vinh rau',
        avatar: 'https://i.pravatar.cc/150?u=3',
        isOnline: true,
    },
    {
        id: '4',
        name: 'hpde ngon luon',
        avatar: 'https://i.pravatar.cc/150?u=4',
        isOnline: false,
    },
    {
        id: '5',
        name: 'Bá Minh',
        avatar: require('../../assets/Icon/ava.jpg'),
        isOnline: true,
    },
    {
        id: '6',
        name: 'Khoa Đăng',
        avatar: 'https://i.pravatar.cc/150?u=6',
        isOnline: false,
    },
    {
        id: '7',
        name: 'Quang Vinh',
        avatar: 'https://i.pravatar.cc/150?u=7',
        isOnline: true,
    },
    {
        id: '8',
        name: 'Khải Hưng',
        avatar: 'https://i.pravatar.cc/150?u=8',
        isOnline: false,
    },
];

export const MOCK_CHATS: ChatSession[] = [
    {
        id: 'c1',
        user: MOCK_USERS[4], // Bá Minh
        lastMessage: 'Xin chào',
        lastMessageTime: '12:50',
    },
    {
        id: 'c2',
        user: MOCK_USERS[5], // Khoa Đăng
        lastMessage: 'Xin chào',
        lastMessageTime: '1:50',
    },
    {
        id: 'c3',
        user: MOCK_USERS[6], // Quang Vinh
        lastMessage: 'Xin chào',
        lastMessageTime: '2:50',
    },
    {
        id: 'c4',
        user: MOCK_USERS[7], // Khải Hưng
        lastMessage: 'Xin chào',
        lastMessageTime: '3:50',
    },
];
