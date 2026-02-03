import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppNavigation } from "../../navigation/useAppNavigation";
import { CommonActions, useNavigation } from "@react-navigation/native";



export default function Login() {
  const navigation = useAppNavigation();


  return (
    <SafeAreaView className="flex-1 bg-black px-6">


      <View className="flex-1 items-center justify-center">
        <View className="w-40 h-40 rounded-full bg-white items-center justify-center mb-8">
          <Image
            source={require("../../../assets/Logo/logoDark.png")}
            className="w-28 h-28"
            resizeMode="contain"
          />
        </View>

        <Text className="text-white text-3xl font-bold text-center">Hàng triệu bài hát.</Text>
        <Text className="text-white text-3xl font-bold text-center mt-2">Miễn phí trên music Xco.</Text>

      </View>

      <View className="mb-16 gap-7">
        <TouchableOpacity activeOpacity={0.5} onPress={() => navigation.navigate("SignIn")} >
          <View className="border border-white rounded-full py-4 items-center">
            <Text className="text-white text-xl font-bold">Đăng ký</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.5} onPress={() => navigation.navigate("SignUp")}>
          <View className="border border-white rounded-full py-4 items-center">
            <Text className="text-white text-xl font-bold">Đăng nhập</Text>
          </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity className="self-center" activeOpacity={0.5} onPress={() => navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: "MainTabs" }], }))}>
        <Text className="text-white mt-4">Đăng nhập</Text>
      </TouchableOpacity>
      <TouchableOpacity className="self-center" activeOpacity={0.5} onPress={() => navigation.navigate("artist")}>
        <Text className="text-white mt-4">Thêm nhạc sĩ</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
