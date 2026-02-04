import axios from "axios";
import * as SecureStore from "expo-secure-store";

export const BASE_URL = "http://192.168.0.151:5000";

const axiosClient = axios.create({
  baseURL: `${BASE_URL}/api/v1`,

  timeout: 10000,
});

axiosClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


export default axiosClient;