import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Switch,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CommonActions } from '@react-navigation/native';
import { getMeAPI, User } from '../../API/userAPI';
import { AdminTabParamList } from '../../navigation/types';
import { useAdminTheme } from '../../context/AdminThemeContext';

type AdminAccountNavigationProp = NativeStackNavigationProp<AdminTabParamList>;

export default function AdminAccount() {
  const navigation = useNavigation<AdminAccountNavigationProp>();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [userData, setUserData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const theme = useAdminTheme();

  useEffect(() => { fetchUserData(); }, []);

  const fetchUserData = async () => {
    try {
      const data = await getMeAPI();
      setUserData(data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigation = (screen: keyof AdminTabParamList) => navigation.navigate(screen);

  const settingsSections = [
    {
      title: 'Ứng Dụng',
      items: [
        { id: 'about', label: 'Về UniVibe', icon: 'information-circle-outline', color: '#EC4899', screen: 'AboutScreen' },
        { id: 'logs', label: 'Nhật ký hệ thống', icon: 'document-text-outline', color: '#06B6D4', screen: 'SystemLogsScreen' },
        { id: 'version', label: 'Phiên bản 1.0.0', icon: 'code-outline', color: theme.isDark ? '#666' : '#9CA3AF', screen: null },
      ],
    },
  ];

  return (
    // Animated.View handles smooth bg color
    <Animated.View style={{ flex: 1, backgroundColor: theme.animBg }}>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar
          barStyle={theme.isDark ? 'light-content' : 'dark-content'}
          backgroundColor="transparent"
          translucent
        />

        {/* Header */}
        <View style={{ paddingHorizontal: 24, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: theme.bgCardBorder }}>
          <Text style={{ color: theme.textPrimary, fontSize: 30, fontWeight: 'bold' }}>Cài Đặt</Text>
          <Text style={{ color: theme.textSecondary, fontSize: 14, marginTop: 4 }}>Quản lý hệ thống</Text>
        </View>

        <ScrollView style={{ flex: 1, paddingHorizontal: 24, paddingTop: 24 }}>
          {/* Admin Profile Card */}
          <View style={{ backgroundColor: '#EC4899', borderRadius: 16, padding: 24, marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                <Ionicons name="person" size={32} color="white" />
              </View>
              <View style={{ flex: 1 }}>
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>
                      Admin {userData?.username ? `• ${userData.username}` : ''}
                    </Text>
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 4 }}>Quản trị viên hệ thống</Text>
                  </>
                )}
              </View>
            </View>
          </View>

          {/* Preferences */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ color: theme.textPrimary, fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>Tùy Chỉnh</Text>
            <Animated.View style={{ backgroundColor: theme.animCard, borderRadius: 16, borderWidth: 1, borderColor: theme.bgCardBorder, overflow: 'hidden' }}>
              {/* Notifications */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: theme.bgCardBorder }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(236,72,153,0.15)', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                    <Ionicons name="notifications-outline" size={20} color="#EC4899" />
                  </View>
                  <Text style={{ color: theme.textPrimary, fontWeight: '600' }}>Thông báo</Text>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: theme.isDark ? '#3e3e3e' : '#D1D5DB', true: '#EC4899' }}
                  thumbColor={notificationsEnabled ? '#fff' : '#f4f3f4'}
                />
              </View>

              {/* Dark mode */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(6,182,212,0.15)', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                    <Ionicons name={theme.isDark ? 'moon-outline' : 'sunny-outline'} size={20} color="#06B6D4" />
                  </View>
                  <Text style={{ color: theme.textPrimary, fontWeight: '600' }}>Chế độ tối</Text>
                </View>
                <Switch
                  value={theme.isDark}
                  onValueChange={theme.toggleTheme}
                  trackColor={{ false: '#D1D5DB', true: '#EC4899' }}
                  thumbColor={theme.isDark ? '#fff' : '#f4f3f4'}
                />
              </View>
            </Animated.View>
          </View>

          {/* Settings Sections */}
          {settingsSections.map((section, sectionIndex) => (
            <View key={sectionIndex} style={{ marginBottom: 24 }}>
              <Text style={{ color: theme.textPrimary, fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>{section.title}</Text>
              <Animated.View style={{ backgroundColor: theme.animCard, borderRadius: 16, borderWidth: 1, borderColor: theme.bgCardBorder, overflow: 'hidden' }}>
                {section.items.map((item, itemIndex) => (
                  <TouchableOpacity
                    key={item.id}
                    style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: itemIndex < section.items.length - 1 ? 1 : 0, borderBottomColor: theme.bgCardBorder }}
                    activeOpacity={0.7}
                    disabled={item.id === 'version'}
                    onPress={() => item.screen && handleNavigation(item.screen as any)}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: `${item.color}20`, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                        <Ionicons name={item.icon as any} size={20} color={item.color} />
                      </View>
                      <Text style={{ color: theme.textPrimary, fontWeight: '600' }}>{item.label}</Text>
                    </View>
                    {item.id !== 'version' && (
                      <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
                    )}
                  </TouchableOpacity>
                ))}
              </Animated.View>
            </View>
          ))}

          {/* Danger Zone */}
          <View style={{ marginBottom: 32 }}>
            <TouchableOpacity
              style={{ backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' }}
              activeOpacity={0.8}
              onPress={() => navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Welcone' }] }))}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                  <Text style={{ color: '#EF4444', fontWeight: '600', marginLeft: 12 }}>Đăng xuất</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#EF4444" />
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Animated.View>
  );
}