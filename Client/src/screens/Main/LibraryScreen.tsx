import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";



export default function LibraryScreen() {
  return (
    <SafeAreaView  className="flex-1 bg-black" edges={["top"]}>
      <View className="flex-row items-center justify-between px-4 py-3">
          <View className="flex-row items-center">
            <Image
              source={require("../../../assets/Icon/ava.jpg")}
              className="w-10 h-10 rounded-full"/>
          <Text className="text-white text-2xl font-bold ml-4">Thư viện</Text>
        </View>

        <View className="flex-row gap-4">
          <Ionicons name="notifications-outline" size={22} color="white" />
            <Ionicons name="time-outline" size={22} color="white" />
            <Ionicons name="settings-outline" size={22} color="white" />
        </View>
      </View>
    </SafeAreaView>
  );
}

