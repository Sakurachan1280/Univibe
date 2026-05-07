import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import * as SecureStore from "expo-secure-store";
import { loginAPI } from "../../API/authAPI";
import { CommonActions } from "@react-navigation/native";
import { useAppNavigation } from "../../navigation/useAppNavigation";
import { useSocket } from "../../context/SocketContext";

export default function LogInEmail() {
  const navigation = useAppNavigation();
  const { connectSocket } = useSocket();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      const result = await loginAPI({ email, password });
      console.log("LOGIN SUCCESS:", result);

      // LƯU TOKEN
      await SecureStore.setItemAsync("accessToken", result.token);

      // KẾT NỐI LẠI SOCKET NGAY SAU KHI LOGIN (để load currentUserId kịp thời)
      await connectSocket();

      // RESET NAVIGATION
      if (result.role === "admin") {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "AdminNavigator" }],
          })
        );
      } else {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "MainTabs" }],
          })
        );
      }
    } catch (error: any) {
      Alert.alert(
        "Đăng nhập thất bại",
        error.response?.data?.message || "Sai email hoặc mật khẩu"
      );
    }
  };
  return (
    <SafeAreaView className="flex-1 bg-black px-5">

      <TouchableOpacity className="mt-2 w-10 h-10 justify-center" activeOpacity={0.5} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={28} color="white" />
      </TouchableOpacity>

      <Text className="text-white mt-5">Email</Text>

      <TextInput
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="Email"
        placeholderTextColor="#8E8E8E"
        className="bg-white/10 text-white rounded-lg px-4 py-3 mt-2"
      />

      <Text className="text-white mt-5">Mật khẩu</Text>

      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        placeholderTextColor="#8E8E8E"
        secureTextEntry
        className="bg-white/10 text-white rounded-lg px-4 py-3 mt-2 border border-white/20"
      />

      <TouchableOpacity className="mt-8 py-3 rounded-full border border-white items-center" activeOpacity={0.5} onPress={handleLogin}>
        <Text className="text-white text-base font-semibold">Đăng nhập</Text>
      </TouchableOpacity>

    </SafeAreaView>
  );
}
