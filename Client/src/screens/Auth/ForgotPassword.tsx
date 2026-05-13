import {
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useAppNavigation } from "../../navigation/useAppNavigation";
import axiosClient from "../../API/axiosClient";

export default function ForgotPassword() {
  const navigation = useAppNavigation();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!email.trim() || !username.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
      return;
    }

    setLoading(true);
    try {
      await axiosClient.post("/auth/forgot-password", {
        email: email.trim().toLowerCase(),
        username: username.trim(),
      });

      navigation.navigate("NewPassword", {
        email: email.trim().toLowerCase(),
      });
    } catch (error: any) {
      Alert.alert(
        "Xác minh thất bại",
        error.response?.data?.message || "Email hoặc tên đăng nhập không đúng"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black px-5">
      <TouchableOpacity
        className="mt-2 w-10 h-10 justify-center"
        activeOpacity={0.5}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="chevron-back" size={28} color="white" />
      </TouchableOpacity>

      <Text className="text-white text-xl font-bold mt-5 mb-1">
        Quên Mật Khẩu
      </Text>
      <Text className="text-white/40 text-sm mb-6">
        Nhập email và tên đăng nhập để xác minh tài khoản
      </Text>

      <Text className="text-white mt-2">Email</Text>

      <TextInput
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="Email"
        placeholderTextColor="#8E8E8E"
        className="bg-white/10 text-white rounded-lg px-4 py-3 mt-2"
      />

      <Text className="text-white mt-5">Tên đăng nhập</Text>

      <TextInput
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        placeholder="Tên đăng nhập"
        placeholderTextColor="#8E8E8E"
        className="bg-white/10 text-white rounded-lg px-4 py-3 mt-2"
      />

      <TouchableOpacity
        className="mt-8 py-3 rounded-full border border-white items-center"
        activeOpacity={0.5}
        onPress={handleVerify}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white text-base font-semibold">Tiếp tục</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}
