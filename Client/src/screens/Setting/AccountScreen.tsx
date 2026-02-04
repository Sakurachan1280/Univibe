import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppNavigation } from "../../navigation/useAppNavigation";
import { getMeAPI, User } from "../../API/userAPI";

export default function AccountScreen() {
  const navigation = useAppNavigation();
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const data = await getMeAPI();
      setUserData(data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* HEADER */}
      <View className="flex-row items-center px-4 py-4 bg-neutral-900/90">
        <TouchableOpacity
          className="w-10 h-10 items-center justify-center rounded-full bg-white/10"
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>

        <Text className="flex-1 text-white text-lg font-semibold text-center mr-10">
          Tài khoản
        </Text>
      </View>

      <ScrollView className="flex-1 px-4 mt-4">
        {/* SECTION TITLE */}
        <Text className="text-white text-lg font-bold mb-6">
          Thông tin chi tiết về tài khoản
        </Text>

        {loading ? (
          <View className="items-center justify-center py-10">
            <ActivityIndicator size="large" color="#EC4899" />
          </View>
        ) : (
          <>
            {/* USERNAME */}
            <View className="py-5 border-b border-gray-800">
              <Text className="text-gray-400 text-sm mb-1">
                Tên người dùng
              </Text>
              <Text className="text-white text-base font-medium tracking-wide">
                {userData?.username || "N/A"}
              </Text>
            </View>

            {/* EMAIL */}
            <View className="py-5 border-b border-gray-800">
              <Text className="text-gray-400 text-sm mb-1">Email</Text>
              <Text className="text-white text-base mt-1">
                {userData?.email || "N/A"}
              </Text>
            </View>

            {/* PHONE (if available) */}
            {userData?.phone && (
              <TouchableOpacity className="py-5 border-b border-gray-800 flex-row justify-between items-center">
                <View>
                  <Text className="text-gray-400 text-sm">Số điện thoại</Text>
                  <Text className="text-white text-base mt-1">
                    {userData.phone}
                  </Text>
                </View>

                <Ionicons name="chevron-forward" size={20} color="#888" />
              </TouchableOpacity>
            )}

            {/* ACCOUNT TYPE */}
            <View className="py-5 border-b border-gray-800">
              <Text className="text-gray-400 text-sm mb-1">
                Loại tài khoản
              </Text>
              <Text className="text-white text-base font-medium">
                {userData?.role === "admin" ? "Quản trị viên" : "Người dùng"}
              </Text>
            </View>

            {/* AUTH PROVIDER */}
            <View className="py-5">
              <Text className="text-gray-400 text-sm mb-1">
                Phương thức đăng nhập
              </Text>
              <Text className="text-white text-base font-medium capitalize">
                {userData?.auth_provider === "local"
                  ? "Email/Password"
                  : userData?.auth_provider}
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
