import { Text, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAppNavigation } from "../../navigation/useAppNavigation";

export default function LogInNoEmail() {
    const navigation = useAppNavigation();
    return (
        <SafeAreaView className="flex-1 bg-black px-5">

            <TouchableOpacity className="mt-2 w-10 h-10 justify-center" activeOpacity={0.5} onPress={() => navigation.navigate("LogInEmail")}>
                <Ionicons name="chevron-back" size={28} color="white" />
            </TouchableOpacity>

            <Text className="text-white text-base font-semibold mt-5" numberOfLines={1}>Email hoặc tên người dùng</Text>

            <TextInput
                placeholder="Email or User name"
                placeholderTextColor="#8E8E8E"
                className="bg-white text-black rounded-lg px-4 py-3 mt-2"
            />

            <Text className="text-neutral-400 text-sm mt-4">Chúng tôi sẽ gửi cho bạn một email chứa liên kết giúp bạn đăng nhập.</Text>

            <TouchableOpacity className="mt-6 py-3 rounded-full border border-white items-center" activeOpacity={0.5} onPress={() => navigation.navigate("ConfirmEmail")}>
                <Text className="text-white text-base font-semibold">Nhập liên kết</Text>
            </TouchableOpacity>

        </SafeAreaView>
    );
}
