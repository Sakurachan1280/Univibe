import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAppNavigation } from "../../navigation/useAppNavigation";

export default function LogInEmail() {
  const navigation = useAppNavigation();
  return (
    <SafeAreaView className="flex-1 bg-black px-5">

      <TouchableOpacity className="mt-2 w-10 h-10 justify-center" activeOpacity={0.5} onPress={() => navigation.navigate("SignIn")}>
        <Ionicons name="chevron-back" size={28} color="white" />
      </TouchableOpacity>

      <Text className="text-white text-base font-semibold mt-5">Email hoặc tên người dùng</Text>

      <TextInput
        placeholder="Email or User name"
        placeholderTextColor="#8E8E8E"
        className="bg-white/10 text-white rounded-lg px-4 py-3 mt-2 border border-white/20"
      />

      <Text className="text-white text-base font-semibold mt-5">Mật khẩu</Text>

      <TextInput
        placeholder="Password"
        placeholderTextColor="#8E8E8E"
        secureTextEntry={true}
        className="bg-white/10 text-white rounded-lg px-4 py-3 mt-2 border border-white/20"
      />

      <TouchableOpacity className="mt-8 py-3 rounded-full border border-white items-center" activeOpacity={0.5} onPress={() => navigation.navigate("ConfirmEmail")}>
        <Text className="text-white text-base font-semibold">Đăng nhập</Text>
      </TouchableOpacity>

      <TouchableOpacity className="mt-4 py-3 rounded-full border border-white items-center" activeOpacity={0.5} onPress={() => navigation.navigate("LogInNoEmail")}>
        <Text className="text-white text-base font-semibold">Đăng nhập không cần mật khẩu</Text>
      </TouchableOpacity>

    </SafeAreaView>
  );
}
