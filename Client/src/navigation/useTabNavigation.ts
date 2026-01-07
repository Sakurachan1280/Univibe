import { useNavigation } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { MainTabParamList } from "./types";

export type TabNavigationProp =
  BottomTabNavigationProp<MainTabParamList>;

export function useTabNavigation() {
  return useNavigation<TabNavigationProp>();
}
