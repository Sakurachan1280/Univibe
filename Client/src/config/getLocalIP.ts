import * as Network from 'expo-network';

/**
 * Tự động lấy địa chỉ IP local của máy chủ
 * Sử dụng cho development khi server chạy trên cùng mạng LAN
 */
export const getLocalIP = async (): Promise<string> => {
    try {
        const ip = await Network.getIpAddressAsync();
        return ip;
    } catch (error) {
        console.error('Không thể lấy địa chỉ IP:', error);
        // Fallback về localhost nếu không lấy được IP
        return 'localhost';
    }
};

/**
 * Lấy BASE_URL với IP tự động
 * @param port - Port của server (mặc định 5000)
 * @returns URL đầy đủ của server
 */
export const getBaseURL = async (port: number = 5000): Promise<string> => {
    const ip = await getLocalIP();
    return `http://${ip}:${port}`;
};
