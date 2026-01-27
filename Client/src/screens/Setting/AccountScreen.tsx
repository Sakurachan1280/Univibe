import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppNavigation } from "../../navigation/useAppNavigation";

export default function AccountScreen() {
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
          Tài khoản
        </Text>
      </View>

      <ScrollView className="flex-1 px-4 mt-4">
        {/* SECTION TITLE */}
        <Text className="text-white text-lg font-bold mb-6">
          Thông tin chi tiết về tài khoản
        </Text>

        {/* USERNAME */}
        <View className="mb-6">
          <Text className="text-gray-400 text-sm mb-1">Tên người dùng</Text>
          <Text className="text-white text-base font-medium tracking-wide">
            31h4xiih75xjntbkootx2btk7z54
          </Text>
        </View>

        {/* EMAIL */}
        <TouchableOpacity className="py-5 border-y border-gray-800 flex-row justify-between items-center">
          <View>
            <Text className="text-gray-400 text-sm">Email</Text>
            <Text className="text-white text-base mt-1">
              monchan3949@gmail.com
            </Text>
          </View>

          <Ionicons name="chevron-forward" size={20} color="#888" />
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
