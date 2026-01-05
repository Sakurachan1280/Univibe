import { View, Text, Pressable } from "react-native";
import { useTheme } from "../../components/Darkmode";

export default function HomeScreen() {
  const { dark, toggleTheme } = useTheme();

  return (
    <View className="flex-1 bg-white dark:bg-black items-center justify-center">
      <Text className="text-black dark:text-white text-xl">
        {dark ? "Dark Mode" : "Light Mode"}
      </Text>

      <Pressable
        onPress={toggleTheme}
        className="mt-4 px-6 py-2 rounded-full bg-black dark:bg-white"
      >
        <Text className="text-white dark:text-black">
          Toggle Theme
        </Text>
      </Pressable>
    </View>
  );
}
