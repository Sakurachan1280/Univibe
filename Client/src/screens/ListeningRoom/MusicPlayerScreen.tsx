import { View, Text, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppNavigation } from "../../navigation/useAppNavigation";
import Slider from "@react-native-community/slider";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MusicPlayerScreen() {
  const navigation = useAppNavigation();
  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* HEADER */}
      <View className="px-4 pt-10 pb-4 flex-row justify-between items-center">
        <TouchableOpacity onPress={() => { navigation.goBack(); }}>
          <Ionicons name="chevron-down" size={28} color="white" />
        </TouchableOpacity>

        <Text className="text-white text-lg font-semibold">Low G</Text>

        <Ionicons name="ellipsis-horizontal" size={24} color="white" />
      </View>

      {/* ALBUM ART */}
      <View className="mt-9 bg-neutral-700 w-80 h-80 rounded-2xl mx-auto"> </View>

      {/* TITLE */}
      <View className="px-6 mt-8">
        <Text className="text-white text-2xl font-bold">Người Đi Bao</Text>
        <Text className="text-gray-300 text-base">Low G</Text>
      </View>

      {/* SLIDER */}
      <View className="px-6 mt-6">
        <Slider
          minimumValue={0}
          maximumValue={100}
          value={30}
          minimumTrackTintColor="#fff"
          maximumTrackTintColor="#777"
          thumbTintColor="#fff"
        />
        {/* TIMERS */}
        <View className="flex-row justify-between mt-2">
          <Text className="text-gray-400 text-xs">0:00</Text>
          <Text className="text-gray-400 text-xs">3:13</Text>
        </View>
      </View>

      {/* CONTROL BUTTONS */}
      <View className="flex-row justify-center items-center mt-10 gap-8">
        <Ionicons name="play-skip-back" size={32} color="white" />

        <TouchableOpacity>
          <Ionicons name={"play-circle"} size={70} color="white" />
        </TouchableOpacity>

        <Ionicons name="play-skip-forward" size={32} color="white" />
      </View>

      {/* BOTTOM ICONS */}
      <View className="flex-row justify-between items-center px-8 mt-8">
        <TouchableOpacity activeOpacity={0.5} onPress={() => navigation.navigate("CreateRoom")}>
          <Ionicons name="tv-outline" size={30} color="white" />
        </TouchableOpacity>

        <View className="flex-row gap-6">
          <TouchableOpacity>
            <Ionicons name="share-outline" size={30} color="white" />
          </TouchableOpacity>

          <TouchableOpacity>
            <Ionicons name="list" size={30} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
