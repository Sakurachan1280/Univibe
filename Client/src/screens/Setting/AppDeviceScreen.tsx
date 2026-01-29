import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppNavigation } from "../../navigation/useAppNavigation";

export default function ConnectedAppsScreen() {
  const navigation = useAppNavigation();

  return (
    <SafeAreaView className="flex-1 bg-black">
      
      {/* HEADER */}
      <View className="flex-row items-center px-4 py-4 bg-neutral-900/90">
        <TouchableOpacity
          className="w-10 h-10 items-center justify-center rounded-full bg-white/10"
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>

        <Text className="flex-1 text-white text-lg font-semibold text-center mr-10">
          Ứng dụng và thiết bị
        </Text>
      </View>


      <ScrollView className="flex-1 px-4 mt-5">

        {/* TITLE */}
        <Text className="text-white text-lg font-bold mb-6">
          Ứng dụng được kết nối
        </Text>


        {/* GOOGLE MAPS */}
        <View className="flex-row items-start mb-8">
          <Image
            source={require("../../../assets/Logo/googlemap.png")}
            className="w-12 h-12 rounded-lg"
            resizeMode="contain"
          />

          <View className="flex-1 ml-4">
            {/* Row 1: Name + Button */}
            <View className="flex-row justify-between items-center">
              <Text className="text-white text-base font-semibold">Google Maps</Text>

              <TouchableOpacity className="px-4 py-1.5 border border-white/20 rounded-full">
                <Text className="text-white text-sm font-medium">Kết nối</Text>
              </TouchableOpacity>
            </View>

            {/* DESCRIPTION */}
            <Text className="text-gray-400 text-sm mt-2 leading-5 pr-6">
              Kết nối tài khoản Spotify của bạn để phát ngay trong ứng dụng
              Google Maps.
            </Text>
          </View>
        </View>


        {/* GITHUB */}
        <View className="flex-row items-start mb-8">
          <Image
            source={require("../../../assets/Logo/images.png")}
            className="w-12 h-12 rounded-lg bg-white/10 p-2"
            resizeMode="contain"
          />

          <View className="flex-1 ml-4">
            {/* Row 1: Name + Button */}
            <View className="flex-row justify-between items-center">
              <Text className="text-white text-base font-semibold">GitHub</Text>

              <TouchableOpacity className="px-4 py-1.5 border border-white/20 rounded-full">
                <Text className="text-white text-sm font-medium">Tải ứng dụng</Text>
              </TouchableOpacity>
            </View>

            {/* DESCRIPTION */}
            <Text className="text-gray-400 text-sm mt-2 leading-5 pr-6">
              Kết nối tài khoản Spotify của bạn để phát ngay trong các tiện ích tích hợp của GitHub.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
