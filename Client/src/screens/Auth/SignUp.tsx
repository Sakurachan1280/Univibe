import { View, Text, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppNavigation } from "../../navigation/useAppNavigation";
import { Ionicons } from "@expo/vector-icons";


export default function SignUp() {
  const navigation = useAppNavigation();

  return (
    <SafeAreaView className="flex-1 bg-black px-6">
      <View className="flex-1 items-center justify-center">
          <View className="w-40 h-40 rounded-full bg-white items-center justify-center mb-8">
            <Image
              source={require("../../../assets/Logo/logoDark.png")}
              className="w-28 h-28"
              resizeMode="contain"/>
          </View>
          <Text className="text-white text-3xl font-bold text-center">Đăng ký vào music Xco</Text>
      </View>

      <View className="mb-20 gap-5">
        <TouchableOpacity activeOpacity={0.5} onPress={() => navigation.navigate("")} >
          <View className="flex-row items-center border border-white rounded-full py-4 px-5">
            <Ionicons name="call-outline" size={24} color="white" />
            <View className="flex-1 items-center"><Text className="text-white text-xl font-bold">Tiếp tục bằng số điện thoại</Text></View>
            <View className="w-6" /></View>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.5} onPress={() => navigation.navigate("")} >
          <View className="flex-row items-center border border-white rounded-full py-4 px-5">
            <Ionicons name="logo-google" size={24} color="white" />
            <View className="flex-1 items-center"> <Text className="text-white text-xl font-bold ">Tiếp tục bằng Google</Text></View>
            <View className="w-6" />
            </View>
          </TouchableOpacity>

          <Text className="text-white text-xl text-center mt-5 font-bold">Bạn đã có tài khoản?</Text>
            <TouchableOpacity className="self-center" activeOpacity={0.5} onPress={()=> navigation.goBack()}>
              <Text className="text-white mt-4">Đăng nhập</Text>
          </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
