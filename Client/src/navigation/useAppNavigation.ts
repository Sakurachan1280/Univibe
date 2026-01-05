import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "./types";

// Navigation dùng chung cho toàn app
export type AppNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

export const useAppNavigation = () => {
  return useNavigation<AppNavigationProp>();
};
