import axios from "axios";
import * as SecureStore from "expo-secure-store";

/**
 * ============================================================================
 * CẤU HÌNH BASE URL CHO API
 * ============================================================================
 * 
 * NGROK URL (Cho phép truy cập từ internet/thiết bị khác mạng):
 * - Sử dụng khi: Test trên điện thoại thật, chia sẻ với người khác, hoặc 
 *   thiết bị không cùng mạng LAN với server
 * - URL ngrok hiện tại: https://jena-unmistrustful-yael.ngrok-free.dev
 * - Lưu ý: URL ngrok sẽ thay đổi mỗi khi restart ngrok (trừ khi dùng tài khoản trả phí)
 * 
 * LOCAL IP (Chỉ hoạt động trong cùng mạng LAN):
 * - Sử dụng khi: Test trên emulator/simulator hoặc thiết bị cùng mạng WiFi
 * - Ví dụ: http://192.168.1.32:5000
 * - Lưu ý: IP có thể thay đổi khi kết nối mạng khác
 * 
 * LOCALHOST (Chỉ cho emulator/simulator):
 * - Android Emulator: http://10.0.2.2:5000
 * - iOS Simulator: http://localhost:5000
 */

// 🟢 QUAY LẠI DÙNG LOCALTUNNEL:
// 1. Chạy: npx localtunnel --port 5000
// 2. Dán mã link chữ (ví dụ: https://abcd.loca.lt) vào đây:
// export const BASE_URL = "https://red-sides-call.loca.lt"; 


export const BASE_URL = "http://192.168.0.102:5000";

/**
 * Hàm helper để lấy BASE_URL hiện tại
 * @returns {string} URL của server đang được sử dụng
 */
export const getServerURL = () => BASE_URL;

/**
 * ============================================================================
 * AXIOS CLIENT CONFIGURATION
 * ============================================================================
 * 
 * Axios instance được cấu hình sẵn với:
 * - baseURL: Tự động thêm BASE_URL + /api/v1 vào mọi request
 * - timeout: Thời gian chờ tối đa cho mỗi request
 * - interceptors: Tự động thêm token vào header
 */
const axiosClient = axios.create({
  baseURL: `${BASE_URL}/api/v1`, // Tất cả API sẽ có prefix /api/v1
  timeout: 120000, // 2 phút cho các request thông thường
  // Không set Content-Type mặc định: để axios tự set đúng (json vs multipart)
});

/**
 * ============================================================================
 * REQUEST INTERCEPTOR
 * ============================================================================
 * 
 * Chạy trước mỗi request để:
 * 1. Tự động thêm JWT token vào header Authorization
 * 2. Tăng timeout cho các request upload file
 */
axiosClient.interceptors.request.use(async (config) => {
  // Lấy access token từ SecureStore (nơi lưu token sau khi login)
  const token = await SecureStore.getItemAsync("accessToken");

  // Nếu có token, thêm vào header Authorization
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Bỏ qua trang cảnh báo của ngrok và localtunnel
  config.headers['ngrok-skip-browser-warning'] = 'true';
  config.headers['Bypass-Tunnel-Reminder'] = 'true';

  // Tăng timeout lên 5 phút cho các request upload file (ảnh, video, audio)
  const contentType = config.headers['Content-Type'];
  if (contentType && typeof contentType === 'string' && contentType.includes('multipart/form-data')) {
    config.timeout = 300000; // 5 phút cho upload file
  }

  return config;
});

/**
 * ============================================================================
 * CÁCH SỬ DỤNG
 * ============================================================================
 * 
 * Import vào file API:
 * import axiosClient from './axiosClient';
 * 
 * Ví dụ GET request:
 * const response = await axiosClient.get('/songs'); 
 * // → Gọi: https://jena-unmistrustful-yael.ngrok-free.dev/api/v1/songs
 * 
 * Ví dụ POST request:
 * const response = await axiosClient.post('/auth/login', { email, password });
 * // → Gọi: https://jena-unmistrustful-yael.ngrok-free.dev/api/v1/auth/login
 * 
 * Ví dụ upload file:
 * const formData = new FormData();
 * formData.append('file', file);
 * const response = await axiosClient.post('/upload', formData, {
 *   headers: { 'Content-Type': 'multipart/form-data' }
 * });
 */

/**
 * ============================================================================
 * RESPONSE INTERCEPTOR
 * ============================================================================
 *
 * Xử lý lỗi 401 (Unauthorized) khi user chưa đăng nhập:
 * - Các API browse (nhạc, album hệ thống) đã public → không bao giờ 401
 * - Các API cần đăng nhập (users/me, library, playlists...) trả về null
 *   thay vì throw error → tránh crash khi guest dùng app
 */
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      // Trả về object mặc định thay vì null để tránh gây crash (TypeError) cho các màn hình
      return Promise.resolve({ data: { success: false, data: [] } });
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
