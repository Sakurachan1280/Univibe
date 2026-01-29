import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppNavigation } from "../../navigation/useAppNavigation";

export default function AboutScreen() {
  const navigation = useAppNavigation();

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* HEADER */}
      <View className="flex-row items-center px-4 py-4 bg-neutral-900/90">
        <TouchableOpacity
          className="w-10 h-10 justify-center items-center rounded-full bg-white/10"
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>

        <Text className="flex-1 text-white text-lg font-semibold text-center mr-10">
          Giới thiệu
        </Text>
      </View>

      {/* BODY */}
      <ScrollView className="mt-4 px-4">
        
        {/* PHIÊN BẢN */}
        <View className="flex-row justify-between items-center py-4 border-b border-white/10">
          <Text className="text-white text-base">Phiên bản</Text>
          <Text className="text-gray-400 text-base">test1</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
