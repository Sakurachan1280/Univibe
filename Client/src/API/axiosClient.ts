import axios from "axios";
import * as SecureStore from "expo-secure-store";

//export const BASE_URL = "http://192.168.0.151:5000";
export const BASE_URL = "http://192.168.0.136:5000";
//export const BASE_URL = "http://192.168.1.27:5000";

const axiosClient = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  timeout: 120000, // 2 minutes for general requests
});

axiosClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Extend timeout for file uploads (multipart/form-data)
  const contentType = config.headers['Content-Type'];
  if (contentType && typeof contentType === 'string' && contentType.includes('multipart/form-data')) {
    config.timeout = 300000; // 5 minutes for file uploads
  }

  return config;
});


export default axiosClient;