import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View } from "react-native";

export default function Login() {
  return (
    <SafeAreaView className="flex-1 bg-black items-center justify-center">
      <Text className="text-red-500 text-3xl font-bold">
        Login
      </Text>
    </SafeAreaView>
  );
}
