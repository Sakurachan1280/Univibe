import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRef } from "react";
import { useAppNavigation } from "../../navigation/useAppNavigation";

export default function PhoneOTP() {
    const navigation = useAppNavigation();
    const inputs = useRef<TextInput[]>([]);
    const handleChange = (text: string, index: number) => 
    { if (text && index < 5) {
        inputs.current[index + 1]?.focus();
    }};
  const handleKeyPress = ( e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && index > 0) {
      inputs.current[index - 1]?.focus();}};
  return (
    <SafeAreaView className="flex-1 bg-black px-5">
      <TouchableOpacity className="mt-2 w-10 h-10 justify-center" activeOpacity={0.5} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={28} color="white" />
      </TouchableOpacity>

      <Text className="text-white text-2xl font-bold mt-5">Nhập mã của bạn</Text>

      <View className="flex-row justify-between mt-8">
        {[0, 1, 2, 3, 4, 5].map((_, index) => (
          <TextInput
            key={index}
            ref={(ref) => { if (ref) inputs.current[index] = ref; }}
            maxLength={1}
            keyboardType="number-pad"
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            className="w-12 h-14 bg-neutral-900 text-white text-xl text-center rounded-lg border border-neutral-600"
            placeholder=""
            placeholderTextColor="#444"/>))}
      </View>

      <Text className="text-neutral-400 text-sm mt-4">Chúng tôi đã gửi một mã gồm 6 chữ số tới số của bạn.</Text>

      <TouchableOpacity className="mt-10 py-4 rounded-full items-center bg-neutral-800 opacity-40" activeOpacity={0.5} onPress={() => navigation.navigate("")} >
        <Text className="text-neutral-400 text-base font-semibold">Tiếp</Text>
      </TouchableOpacity>

      <View className="mt-10 items-center">
        <TouchableOpacity className="flex-row items-center mb-4">
          <Ionicons name="chatbubble-outline" size={20} color="white" />
          <Text className="ml-2 text-white text-base">Gửi lại mã</Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center" activeOpacity={0.5} onPress={() => navigation.navigate("LogInSDT")}>
          <Ionicons name="pencil-outline" size={20} color="white" />
          <Text className="ml-2 text-white text-base">Chỉnh sửa số điện thoại</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
