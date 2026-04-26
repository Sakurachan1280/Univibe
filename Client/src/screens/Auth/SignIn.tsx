import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppNavigation } from "../../navigation/useAppNavigation";
import { Ionicons } from "@expo/vector-icons";

import { CommonActions } from "@react-navigation/native";
import { googleLoginAPI } from "../../API/authAPI";
import { useGoogleAuth } from "../../hooks/useGoogleAuth";
import * as SecureStore from "expo-secure-store";
import { useSocket } from "../../context/SocketContext";

export default function SignIn() {
  const navigation = useAppNavigation();
  const { connectSocket } = useSocket();
  const [googleLoading, setGoogleLoading] = useState(false);

  // Xử lý sau khi Google OAuth thành công → nhận code + redirectUri
  const handleGoogleSuccess = async (code: string, redirectUri: string) => {
    setGoogleLoading(true);
    try {
      const result = await googleLoginAPI({ code, redirectUri });

      // Lưu token vào SecureStore
      await SecureStore.setItemAsync("accessToken", result.token);

      // Kết nối socket ngay lập tức
      await connectSocket();

      // Navigate theo role
      if (result.role === "admin") {
        navigation.dispatch(
          CommonActions.reset({ index: 0, routes: [{ name: "AdminNavigator" }] })
        );
      } else {
        navigation.dispatch(
          CommonActions.reset({ index: 0, routes: [{ name: "MainTabs" }] })
        );
      }
    } catch (error: any) {
      Alert.alert(
        "Đăng nhập Google thất bại",
        error.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại"
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  const { promptAsync, requestReady } = useGoogleAuth(handleGoogleSuccess);

  return (
    <SafeAreaView className="flex-1 bg-black px-6">

      <View className="flex-1 items-center justify-center">
        <View className="w-40 h-40 rounded-full bg-white items-center justify-center mb-8">
          <Image
            source={require("../../../assets/Logo/logoDark.png")}
            className="w-28 h-28"
            resizeMode="contain" />
        </View>

        <Text className="text-white text-3xl font-bold text-center">Đăng nhập vào UniVibe</Text>
      </View>

      <View className="mb-20 flex-1 justify-between max-h-80 gap-4">
        <TouchableOpacity activeOpacity={0.5} onPress={() => navigation.navigate("LogInEmail")} >
          <View className="flex-row items-center border border-white rounded-full py-4 px-5">
            <Ionicons name="mail-outline" size={24} color="white" />
            <View className="flex-1 items-center"><Text className="text-white text-xl font-bold">Tiếp tục bằng Email</Text></View>
            <View className="w-6" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.5} onPress={() => navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: "MainTabs" }], }))}>
          <View className="flex-row items-center border border-white rounded-full py-4 px-5">
            <Ionicons name="person-outline" size={24} color="white" />
            <View className="flex-1 items-center"><Text className="text-white text-xl font-bold">Tiếp tục bằng Tài khoản khách</Text></View>
          </View>
          <View className="w-6" />
        </TouchableOpacity>

        {/* NÚT GOOGLE */}
        <TouchableOpacity
          activeOpacity={0.5}
          disabled={!requestReady || googleLoading}
          onPress={() => promptAsync()}
        >
          <View className={`flex-row items-center border rounded-full py-4 px-5 ${(!requestReady || googleLoading) ? "border-white/40" : "border-white"
            }`}>
            {googleLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="logo-google" size={24} color="white" />
            )}
            <View className="flex-1 items-center">
              <Text className={`text-xl font-bold ${(!requestReady || googleLoading) ? "text-white/50" : "text-white"
                }`}>
                {googleLoading ? "Đang xử lý..." : "Tiếp tục bằng Google"}
              </Text>
            </View>
          </View>
          <View className="w-6" />
        </TouchableOpacity>

        <Text className="text-white text-xl text-center mt-3 font-bold">
          Bạn chưa có tài khoản?
        </Text>
        <TouchableOpacity className="self-center" activeOpacity={0.5} onPress={() => navigation.navigate("SignUp")}>
          <Text className="text-white">Đăng ký</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
