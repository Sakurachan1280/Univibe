import React, { useEffect, useRef } from "react";
import { View, Text, Image, TouchableOpacity, Animated, PanResponder, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

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

  useEffect(() => {
    if (isVisible) openMenu();
  }, [isVisible]);

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
          <View className="px-5 pt-6 pb-5">
            <View className="flex-row items-center">
              <Image
                source={require("../../../assets/Icon/ava.jpg")}
                className="w-14 h-14 rounded-full"
              />
              <View className="ml-3 flex-1">
                <Text className="text-white text-xl font-bold">
                  Sakura
                </Text>
                <Text className="text-gray-400 text-sm mt-0.5">
                  Xem hồ sơ
                </Text>
              </View>
            </View>
          </View>

          {/* Divider */}
          <View className="h-[0.5px] bg-gray-800" />

          {/* Menu Items */}
          <View className="flex-1 px-5 pt-2">
            <MenuItem
              icon="add-circle-outline"
              text="Thêm tài khoản"
            />

            <TouchableOpacity className="flex-row items-center justify-between py-4">
              <View className="flex-row items-center flex-1">
                <Ionicons
                  name="logo-octocat"
                  size={24}
                  color="white"
                />
                <Text className="text-white ml-4 text-[15px]">
                  Gói Premium của bạn
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
              text="Có gì mới"
            />
            <MenuItem
              icon="time-outline"
              text="Gần đây"
            />
            <MenuItem
              icon="settings-outline"
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
}: {
  icon: any;
  text: string;
}) {
  return (
    <TouchableOpacity className="flex-row items-center py-4">
      <Ionicons name={icon} size={24} color="white" />
      <Text className="text-white ml-4 text-[15px]">
        {text}
      </Text>
    </TouchableOpacity>
  );
}