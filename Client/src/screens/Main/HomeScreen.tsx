import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAppNavigation } from "../../navigation/useAppNavigation";
import { QUICK_PLAY } from "../../constants/quickPlay";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";


export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <SafeAreaView  className="flex-1 bg-black" edges={["top"]}>
      {/* HEADER */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <View className="flex-row items-center">
          <Image source={require("../../../assets/Icon/ava.jpg")} className="w-10 h-10 rounded-full" />
          <Text className="text-white text-2xl font-bold ml-4">Wellcome back</Text>
        </View>
        <View className="flex-row gap-4">
          <Ionicons name="notifications-outline" size={22} color="white" />
          <Ionicons name="time-outline" size={22} color="white" />
          <TouchableOpacity>
            <Ionicons name="settings-outline" size={22} color="white" />
          </TouchableOpacity>
          
        </View>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* QUICK PLAY */}
        <View className="flex-row flex-wrap px-4 gap-3 justify-between"> {QUICK_PLAY.map((item, index) => (
          <TouchableOpacity
            key={index}
            className="w-[48%] bg-neutral-800 rounded-md flex-row items-center"
            activeOpacity={0.5}
            onPress={() => navigation.navigate(item.screen)}>
            <View className="w-14 h-14 bg-green-500 rounded-l-md" />
            <Text className="text-white ml-3 font-semibold">{item.title}</Text>
          </TouchableOpacity>))}
        </View>

        <View className="mt-6">
          <Text className="text-white text-2xl font-bold px-4 mb-3">
            Nghe lại
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-4 px-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <View
                  key={i}
                  className="w-44 bg-neutral-900 rounded-lg p-3"
                >
                  <View className="w-full h-36 bg-neutral-700 rounded-md mb-2" />
                  <Text
                    className="text-white font-semibold"
                    numberOfLines={1}
                  >
                    Daily Mix {i}
                  </Text>
                  <Text
                    className="text-gray-400 text-xs"
                    numberOfLines={2}
                  >
                    Spotichat AI chọn nhạc theo gu của bạn
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        <View className="mt-6">
          <Text className="text-white text-2xl font-bold px-4 mb-3">
            Đề xuất cho bạn
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-4 px-4">
              {[1, 2, 3, 4].map((i) => (
                <View
                  key={i}
                  className="w-44 bg-neutral-900 rounded-lg p-3"
                >
                  <View className="w-full h-36 bg-neutral-700 rounded-md mb-2" />
                  <Text
                    className="text-white font-semibold"
                    numberOfLines={1}
                  >
                    Daily Mix {i}
                  </Text>
                  <Text
                    className="text-gray-400 text-xs"
                    numberOfLines={2}
                  >
                    Spotichat AI tạo playlist theo gu của bạn
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>



        <View className="mt-6">
          <Text className="text-white text-2xl font-bold px-4 mb-3">
            AI gợi ý nhạc cho bạn
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-4 px-4">
              {[1, 2, 3, 4].map((i) => (
                <View
                  key={i}
                  className="w-44 bg-neutral-900 rounded-lg p-3"
                >
                  <View className="w-full h-36 bg-neutral-700 rounded-md mb-2" />
                  <Text
                    className="text-white font-semibold"
                    numberOfLines={1}
                  >
                    Daily Mix {i}
                  </Text>
                  <Text
                    className="text-gray-400 text-xs"
                    numberOfLines={2}
                  >
                    Spotichat AI chọn nhạc theo năm
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>


        <View className="mt-6">
          <Text className="text-white text-2xl font-bold px-4 mb-3">
            AI tạo playlist cho bạn
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-4 px-4">
              {[1, 2, 3, 4].map((i) => (
                <View
                  key={i}
                  className="w-44 bg-neutral-900 rounded-lg p-3"
                >
                  <View className="w-full h-36 bg-neutral-700 rounded-md mb-2" />
                  <Text
                    className="text-white font-semibold"
                    numberOfLines={1}
                  >
                    Daily Mix {i}
                  </Text>
                  <Text
                    className="text-gray-400 text-xs"
                    numberOfLines={2}
                  >
                    Spotichat AI chọn nhạc theo gu của bạn
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        <View className="mt-6">
          <Text className="text-white text-2xl font-bold px-4 mb-3">
            Playlist thịnh hành trong năm
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-4 px-4">
              {[1, 2, 3, 4].map((i) => (
                <View
                  key={i}
                  className="w-44 bg-neutral-900 rounded-lg p-3"
                >
                  <View className="w-full h-36 bg-neutral-700 rounded-md mb-2" />
                  <Text
                    className="text-white font-semibold"
                    numberOfLines={1}
                  >
                    Daily Mix {i}
                  </Text>
                  <Text
                    className="text-gray-400 text-xs"
                    numberOfLines={2}
                  >
                    Spotichat AI chọn nhạc theo gu của bạn
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView >
  );
}
