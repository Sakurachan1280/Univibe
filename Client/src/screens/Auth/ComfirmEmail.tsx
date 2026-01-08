import { Text, View, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAppNavigation } from "../../navigation/useAppNavigation";

export default function ConfirmEmail() {
    const navigation = useAppNavigation();
    return (
        <SafeAreaView className="flex-1 bg-black px-5">

        <TouchableOpacity className="mt-2 w-10 h-10 justify-center" activeOpacity={0.5} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={28} color="white" />
        </TouchableOpacity>

        <Text className="text-white text-center text-base font-semibold mt-10">Chúng tôi đã gửi cho bạn một email chứa liên kết để đăng nhập</Text>

        <View className="items-center mt-10">
            <Ionicons name="mail-outline" size={70} color="white" />
        </View>

        <TouchableOpacity className="mt-10 py-3 rounded-full border border-white items-center">
            <Text className="text-white text-base font-semibold">Mở ứng dụng Email</Text>
        </TouchableOpacity>

        </SafeAreaView>
    );
}
