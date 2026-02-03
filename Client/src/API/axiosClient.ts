import axios from "axios";
import * as SecureStore from "expo-secure-store";

const axiosClient = axios.create({
  baseURL: "http://192.168.0.107:5000/api/v1",
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