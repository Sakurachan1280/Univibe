import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { CommonActions, useRoute, RouteProp } from "@react-navigation/native";
import { useAppNavigation } from "../../navigation/useAppNavigation";
import axiosClient from "../../API/axiosClient";
import { RootStackParamList } from "../../navigation/types";
import * as SecureStore from "expo-secure-store";
import { useSocket } from "../../context/SocketContext";

type NewPasswordRouteProp = RouteProp<RootStackParamList, "NewPassword">;

export default function NewPassword() {
  const navigation = useAppNavigation();
  const route = useRoute<NewPasswordRouteProp>();
  const { email } = route.params;
  const { connectSocket } = useSocket();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu nhập lại không khớp");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Lỗi", "Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    setLoading(true);
    try {
      const result = await axiosClient.post("/auth/reset-password", {
        email,
        newPassword,
      });

      const data = result.data;

      if (data.samePassword) {
        // Mật khẩu trùng mật khẩu cũ → hỏi người dùng
        Alert.alert(
          "Mật khẩu bị trùng",
          "Mật khẩu mới trùng với mật khẩu cũ. Bạn có muốn giữ mật khẩu cũ và vào app không?",
          [
            {
              text: "Đổi mật khẩu mới",
              style: "cancel",
              // Chỉ đóng alert, người dùng tiếp tục chỉnh sửa
            },
            {
              text: "Dùng mật khẩu cũ",
              onPress: async () => {
                await SecureStore.setItemAsync("accessToken", data.token);
                await connectSocket();
                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [
                      {
                        name: data.role === "admin" ? "AdminNavigator" : "MainTabs",
                      },
                    ],
                  })
                );
              },
            },
          ]
        );
        return;
      }

      // Đổi mật khẩu mới thành công
      await SecureStore.setItemAsync("accessToken", data.token);
      await connectSocket();

      Alert.alert("Thành công 🎉", "Đổi mật khẩu thành công!", [
        {
          text: "Vào app",
          onPress: () =>
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [
                  {
                    name: data.role === "admin" ? "AdminNavigator" : "MainTabs",
                  },
                ],
              })
            ),
        },
      ]);
    } catch (error: any) {
      const msg: string = error.response?.data?.message || "";
      Alert.alert("Thất bại", msg || "Đã xảy ra lỗi. Vui lòng thử lại.");
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
        Đặt Mật Khẩu Mới
      </Text>
      <Text className="text-white/40 text-sm mb-6">
        Tài khoản: <Text className="text-white/60">{email}</Text>
      </Text>

      <Text className="text-white mt-2">Mật khẩu mới</Text>

      <View className="flex-row items-center bg-white/10 rounded-lg px-4 mt-2">
        <TextInput
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="Ít nhất 6 ký tự"
          placeholderTextColor="#8E8E8E"
          secureTextEntry={!showNew}
          className="flex-1 text-white py-3"
        />
        <TouchableOpacity onPress={() => setShowNew(!showNew)} activeOpacity={0.6}>
          <Ionicons
            name={showNew ? "eye-off-outline" : "eye-outline"}
            size={20}
            color="#8E8E8E"
          />
        </TouchableOpacity>
      </View>

      <Text className="text-white mt-5">Nhập lại mật khẩu mới</Text>

      <View className="flex-row items-center bg-white/10 rounded-lg px-4 mt-2">
        <TextInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Nhập lại mật khẩu"
          placeholderTextColor="#8E8E8E"
          secureTextEntry={!showConfirm}
          className="flex-1 text-white py-3"
        />
        <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} activeOpacity={0.6}>
          <Ionicons
            name={showConfirm ? "eye-off-outline" : "eye-outline"}
            size={20}
            color="#8E8E8E"
          />
        </TouchableOpacity>
      </View>

      {/* Match indicator */}
      {confirmPassword.length > 0 && (
        <View className="flex-row items-center mt-2 ml-1">
          <Ionicons
            name={newPassword === confirmPassword ? "checkmark-circle" : "close-circle"}
            size={14}
            color={newPassword === confirmPassword ? "#1DB954" : "#FF4444"}
          />
          <Text
            className="text-xs ml-1"
            style={{ color: newPassword === confirmPassword ? "#1DB954" : "#FF4444" }}
          >
            {newPassword === confirmPassword ? "Mật khẩu khớp" : "Mật khẩu không khớp"}
          </Text>
        </View>
      )}

      <TouchableOpacity
        className="mt-8 py-3 rounded-full border border-white items-center"
        activeOpacity={0.5}
        onPress={handleResetPassword}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white text-base font-semibold">
            Xác nhận đổi mật khẩu
          </Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}
