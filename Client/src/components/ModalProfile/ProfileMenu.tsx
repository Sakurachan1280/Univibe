import React, { useEffect, useRef, useState } from "react";
import { View, Text, Image, TouchableOpacity, Animated, PanResponder, Dimensions, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppNavigation } from "../../navigation/useAppNavigation";
import { getMeAPI, User } from "../../API/userAPI";
import { BASE_URL } from "../../API/axiosClient";

interface CustomProfileMenuProps {
  isVisible: boolean;
  onClose: () => void;
}

const MENU_WIDTH = 350;

export default function CustomProfileMenu({
  isVisible,
  onClose,
}: CustomProfileMenuProps) {
  const slideX = useRef(new Animated.Value(-MENU_WIDTH)).current;
  const screenWidth = Dimensions.get("window").width;
  const navigation = useAppNavigation();
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isVisible) {
      openMenu();
      fetchUserData();
    }
  }, [isVisible]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const data = await getMeAPI();
      setUserData(data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getAvatarSource = () => {
    if (userData?.profile?.avatar_url) {
      if (userData.profile.avatar_url.startsWith('http')) {
        return { uri: userData.profile.avatar_url };
      } else {
        return { uri: `${BASE_URL}${userData.profile.avatar_url}` };
      }
    }
    return require("../../../assets/Icon/ava.jpg");
  };

  const getDisplayName = () => {
    return userData?.profile?.display_name || userData?.username || "User";
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        isVisible && Math.abs(g.dx) > 10,
      onPanResponderMove: (_, g) => {
        if (g.dx < 0) slideX.setValue(g.dx);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dx < -50) closeMenu();
        else openMenu();
      },
    })
  ).current;

  const openMenu = () => {
    Animated.timing(slideX, {
      toValue: 0,
      duration: 280,
      useNativeDriver: true,
    }).start();
  };

  const closeMenu = () => {
    Animated.timing(slideX, {
      toValue: -MENU_WIDTH,
      duration: 250,
      useNativeDriver: true,
    }).start(onClose);
  };

  if (!isVisible) return null;

  return (
    <View className="absolute inset-0 z-50 flex-row">
      {/* Menu */}
      <Animated.View
        {...panResponder.panHandlers}
        style={{
          width: MENU_WIDTH,
          transform: [{ translateX: slideX }],
        }}
        className="bg-[#121212]"
      >
        <SafeAreaView edges={["top"]} className="flex-1">
          {/* Profile Section */}
          <TouchableOpacity
            className="px-5 pt-6 pb-5 active:bg-gray-800/30"
            onPress={() => {
              closeMenu();
              navigation.navigate("ViewProfile");
            }}
          >
            <View className="flex-row items-center">
              {loading ? (
                <View className="w-14 h-14 rounded-full bg-gray-800 items-center justify-center">
                  <ActivityIndicator size="small" color="#EC4899" />
                </View>
              ) : (
                <Image
                  source={getAvatarSource()}
                  className="w-14 h-14 rounded-full"
                />
              )}
              <View className="ml-3 flex-1">
                <Text className="text-white text-xl font-bold">
                  {loading ? "Loading..." : getDisplayName()}
                </Text>
                <Text className="text-gray-400 text-sm mt-0.5">
                  Xem hồ sơ
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Divider */}
          <View className="h-[0.5px] bg-gray-800" />

          {/* Menu Items */}
          <View className="flex-1 px-5 pt-2">
            <TouchableOpacity className="flex-row items-center justify-between py-4">
              <View className="flex-row items-center flex-1">
                <Ionicons
                  name="logo-octocat"
                  size={24}
                  color="white"
                />
                <Text className="text-white ml-4 text-[15px]">
                  Gói UniVibe của bạn
                </Text>
              </View>
              <View className="bg-[#D8B4FE] px-2.5 py-1 rounded">
                <Text className="text-black text-[11px] font-semibold">
                  Student
                </Text>
              </View>
            </TouchableOpacity>

            <MenuItem
              icon="flash-outline"
              onPress={() => {
                closeMenu();
                navigation.navigate("NewsScreen");
              }}
              text="Có gì mới"
            />
            <MenuItem
              icon="time-outline"
              onPress={() => {
                closeMenu();
                navigation.navigate("RecentScreen");
              }}
              text="Gần đây"
            />
            <MenuItem
              icon="settings-outline"
              onPress={() => {
                closeMenu();
                navigation.navigate("Settings");
              }}
              text="Cài đặt và quyền riêng tư"
            />
          </View>
        </SafeAreaView>
      </Animated.View>

      {/* Overlay */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={closeMenu}
        className="flex-1"
      />
    </View>
  );
}

function MenuItem({
  icon,
  text,
  onPress,
}: {
  icon: any;
  text: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity className="flex-row items-center py-4" onPress={onPress}>
      <Ionicons name={icon} size={24} color="white" />
      <Text className="text-white ml-4 text-[15px]">
        {text}
      </Text>
    </TouchableOpacity>
  );
}