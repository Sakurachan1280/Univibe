import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useAppNavigation } from "../../navigation/useAppNavigation";
import { registerAPI } from "../../API/authAPI";
import { Alert } from "react-native";
import { CommonActions } from "@react-navigation/native";

export default function RegisterScreen() {
  const navigation = useAppNavigation();
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  const renderTitle = () => {
    if (step === 1) return "Nhập Email";
    if (step === 2) return "Tạo mật khẩu";
    return "Tên tài khoản";
  };

  return (
    <SafeAreaView className="flex-1 bg-black px-6">
      {/* HEADER */}
      <View className="items-center mt-16 mb-10">
        <View className="w-32 h-32 rounded-full bg-white items-center justify-center mb-6">
          <Image
            source={require("../../../assets/Logo/logoDark.png")}
            className="w-20 h-20"
            resizeMode="contain"
          />
        </View>
        <Text className="text-white text-2xl font-bold text-center">
          {renderTitle()}
        </Text>
      </View>
      {/* STEP CONTENT */}
      <View className="gap-6">
        {step === 1 && (
          <View className="flex-row items-center border border-white rounded-full px-5 py-4">
            <Ionicons name="mail-outline" size={22} color="white" />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email của bạn"
              placeholderTextColor="#aaa"
              className="flex-1 text-white ml-3 text-lg"
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
        )}

        {step === 2 && (
          <View className="flex-row items-center border border-white rounded-full px-5 py-4">
            <Ionicons name="lock-closed-outline" size={22} color="white" />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Mật khẩu (ít nhất 6 ký tự)"
              placeholderTextColor="#aaa"
              className="flex-1 text-white ml-3 text-lg"
              secureTextEntry
            />
          </View>
        )}
        {step === 3 && (
          <View className="flex-row items-center border border-white rounded-full px-5 py-4">
            <Ionicons name="person-outline" size={22} color="white" />
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="Tên hiển thị"
              placeholderTextColor="#aaa"
              className="flex-1 text-white ml-3 text-lg"
            />
          </View>
        )}

        {/* ACTION BUTTONS */}
        <View className="flex-row gap-4 mt-4">
          {step > 1 && (
            <TouchableOpacity
              className="flex-1 border border-white rounded-full py-4"
              onPress={() => setStep(step - 1)}
            >
              <Text className="text-white text-center text-lg font-bold">
                Quay lại
              </Text>
            </TouchableOpacity>
          )}
           <TouchableOpacity
            className="flex-1 bg-white rounded-full py-4"
            onPress={async () => {
            if (step < 3) {
                setStep(step + 1);
            } else {
                try {
                const result = await registerAPI({
                    email,
                    password,
                    username,
                });

                console.log("REGISTER SUCCESS:", result);

                Alert.alert("Thành công", "Đăng ký tài khoản thành công");

                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [{ name: "MainTabs" }],
                  })
                );

                } catch (error: any) {
                console.log("REGISTER ERROR:", error.response?.data || error.message);

                Alert.alert(
                    "Lỗi",
                    error.response?.data?.message || "Đăng ký thất bại"
                );
                }
            }
            }}
          >
            <Text className="text-black text-center text-lg font-bold">
              {step < 3 ? "Tiếp tục" : "Hoàn tất"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}