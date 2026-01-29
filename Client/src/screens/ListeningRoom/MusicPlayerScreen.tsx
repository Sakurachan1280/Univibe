import { useState } from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppNavigation } from "../../navigation/useAppNavigation";
import Slider from "@react-native-community/slider";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function MusicPlayerScreen() {
  const navigation = useAppNavigation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="flex-1 justify-between">
        {/* TOP SECTION */}
        <View>
          {/* HEADER */}
          <View className="px-4 pt-2 pb-4 flex-row justify-between items-center">
            <TouchableOpacity onPress={() => { navigation.goBack(); }}>
              <Ionicons name="chevron-down" size={28} color="white" />
            </TouchableOpacity>

            <Text className="text-white text-lg font-semibold">Low G</Text>

            <Ionicons name="ellipsis-horizontal" size={24} color="white" />
          </View>

          {/* ALBUM ART - Full Width */}
          <View 
            className="mt-4 bg-neutral-700 rounded-2xl mx-4" 
            style={{ width: width - 32, height: width - 32 }}
          />

          {/* TITLE */}
          <View className="px-6 mt-6">
            <Text className="text-white text-2xl font-bold">Người Đi Bao</Text>
            <Text className="text-gray-300 text-base mt-1">Low G</Text>
          </View>

          {/* SLIDER */}
          <View className="px-6 mt-6">
            <Slider
              minimumValue={0}
              maximumValue={193}
              value={currentTime}
              onValueChange={setCurrentTime}
              minimumTrackTintColor="#fff"
              maximumTrackTintColor="#777"
              thumbTintColor="#fff"
            />
            {/* TIMERS */}
            <View className="flex-row justify-between mt-2">
              <Text className="text-gray-400 text-xs">
                {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')}
              </Text>
              <Text className="text-gray-400 text-xs">3:13</Text>
            </View>
          </View>

          {/* CONTROL BUTTONS */}
          <View className="flex-row justify-center items-center mt-8 gap-8">
            <TouchableOpacity>
              <Ionicons name="play-skip-back" size={32} color="white" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setIsPlaying(!isPlaying)}>
              <Ionicons 
                name={isPlaying ? "pause-circle" : "play-circle"} 
                size={70} 
                color="white" 
              />
            </TouchableOpacity>

            <TouchableOpacity>
              <Ionicons name="play-skip-forward" size={32} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* BOTTOM ICONS */}
        <View className="flex-row justify-between items-center px-8 pb-6">
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
      </View>
    </SafeAreaView>
  );
}