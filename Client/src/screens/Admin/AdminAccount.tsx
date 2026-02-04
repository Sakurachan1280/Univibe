import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';

export default function AdminAccount() {
  const navigation = useNavigation();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = React.useState(true);

  const settingsSections = [
    {
      title: 'Tài Khoản',
      items: [
        { id: 'profile', label: 'Thông tin cá nhân', icon: 'person-outline', color: '#EC4899' },
        { id: 'security', label: 'Bảo mật', icon: 'shield-checkmark-outline', color: '#EC4899' },
        { id: 'privacy', label: 'Quyền riêng tư', icon: 'lock-closed-outline', color: '#EC4899' },
      ],
    },
    {
      title: 'Hệ Thống',
      items: [
        { id: 'database', label: 'Quản lý Database', icon: 'server-outline', color: '#06B6D4' },
        { id: 'backup', label: 'Sao lưu & Khôi phục', icon: 'cloud-upload-outline', color: '#06B6D4' },
        { id: 'logs', label: 'Nhật ký hệ thống', icon: 'document-text-outline', color: '#06B6D4' },
      ],
    },
    {
      title: 'Ứng Dụng',
      items: [
        { id: 'about', label: 'Về Spotichat', icon: 'information-circle-outline', color: '#EC4899' },
        { id: 'help', label: 'Trợ giúp & Hỗ trợ', icon: 'help-circle-outline', color: '#EC4899' },
        { id: 'version', label: 'Phiên bản 1.0.0', icon: 'code-outline', color: '#666' },
      ],
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Header */}
      <View className="px-6 py-4 border-b border-white/10">
        <Text className="text-white text-3xl font-bold">Cài Đặt</Text>
        <Text className="text-gray-400 text-sm mt-1">Quản lý hệ thống</Text>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-6 py-6">
        {/* Admin Profile Card */}
        <View className="bg-gradient-to-r from-pink-500 to-cyan-500 rounded-2xl p-6 mb-6" style={{ backgroundColor: '#EC4899' }}>
          <View className="flex-row items-center">
            <View className="w-16 h-16 rounded-full bg-white/20 items-center justify-center mr-4">
              <Ionicons name="person" size={32} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-white text-xl font-bold">Admin</Text>
              <Text className="text-white/80 text-sm mt-1">Quản trị viên hệ thống</Text>
            </View>
            <TouchableOpacity className="bg-white/20 rounded-full p-2">
              <Ionicons name="create-outline" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Preferences */}
        <View className="mb-6">
          <Text className="text-white text-xl font-bold mb-4">Tùy Chỉnh</Text>

          <View className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
            <View className="flex-row items-center justify-between p-5 border-b border-white/10">
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 rounded-full bg-pink-600/20 items-center justify-center mr-3">
                  <Ionicons name="notifications-outline" size={20} color="#EC4899" />
                </View>
                <Text className="text-white font-semibold">Thông báo</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#3e3e3e', true: '#EC4899' }}
                thumbColor={notificationsEnabled ? '#fff' : '#f4f3f4'}
              />
            </View>

            <View className="flex-row items-center justify-between p-5">
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 rounded-full bg-pink-600/20 items-center justify-center mr-3">
                  <Ionicons name="moon-outline" size={20} color="#06B6D4" />
                </View>
                <Text className="text-white font-semibold">Chế độ tối</Text>
              </View>
              <Switch
                value={darkModeEnabled}
                onValueChange={setDarkModeEnabled}
                trackColor={{ false: '#3e3e3e', true: '#EC4899' }}
                thumbColor={darkModeEnabled ? '#fff' : '#f4f3f4'}
              />
            </View>
          </View>
        </View>

        {/* Settings Sections */}
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} className="mb-6">
            <Text className="text-white text-xl font-bold mb-4">{section.title}</Text>

            <View className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={item.id}
                  className={`flex-row items-center justify-between p-5 ${itemIndex < section.items.length - 1 ? 'border-b border-white/10' : ''
                    }`}
                  activeOpacity={0.7}
                  disabled={item.id === 'version'}
                >
                  <View className="flex-row items-center flex-1">
                    <View
                      className="w-10 h-10 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: `${item.color}20` }}
                    >
                      <Ionicons name={item.icon as any} size={20} color={item.color} />
                    </View>
                    <Text className="text-white font-semibold">{item.label}</Text>
                  </View>
                  {item.id !== 'version' && (
                    <Ionicons name="chevron-forward" size={20} color="#666" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Danger Zone */}
        <View className="mb-8">
          <Text className="text-white text-xl font-bold mb-4">Vùng Nguy Hiểm</Text>

          <TouchableOpacity
            className="bg-red-600/10 rounded-2xl p-5 border border-red-600/30"
            activeOpacity={0.8}
            onPress={() => navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: "Welcone" }], }))}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                <Text className="text-red-500 font-semibold ml-3">Đăng xuất</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#EF4444" />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}