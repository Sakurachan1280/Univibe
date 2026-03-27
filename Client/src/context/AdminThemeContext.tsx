import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import { Animated, Easing } from 'react-native';

interface AdminThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  // Static tokens (for non-animated usage like text color, icon color)
  textPrimary: string;
  textSecondary: string;
  bgCardBorder: string;
  bgInput: string;
  tabBarBg: string;
  tabBarBorder: string;
  // Animated interpolated colors (use with Animated.View)
  animBg: Animated.AnimatedInterpolation<string>;
  animCard: Animated.AnimatedInterpolation<string>;
  animCardBorder: Animated.AnimatedInterpolation<string>;
}

const AdminThemeContext = createContext<AdminThemeContextType>({} as AdminThemeContextType);

export const useAdminTheme = () => useContext(AdminThemeContext);

export const AdminThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDark, setIsDark] = useState(true);
  // 0 = dark, 1 = light
  const progress = useRef(new Animated.Value(0)).current;

  const toggleTheme = useCallback(() => {
    const toValue = isDark ? 1 : 0;
    Animated.timing(progress, {
      toValue,
      duration: 350,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: false, // color interpolation needs JS driver
    }).start();
    setIsDark(prev => !prev);
  }, [isDark, progress]);

  // Animated interpolated colors
  const animBg = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['#000000', '#F3F4F6'],
  });
  const animCard = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255,255,255,0.05)', '#FFFFFF'],
  });
  const animCardBorder = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255,255,255,0.10)', '#E5E7EB'],
  });

  // Static tokens (snap immediately — text/icons)
  const textPrimary = isDark ? '#FFFFFF' : '#111827';
  const textSecondary = isDark ? '#9CA3AF' : '#6B7280';
  const bgCardBorder = isDark ? 'rgba(255,255,255,0.10)' : '#E5E7EB';
  const bgInput = isDark ? 'rgba(255,255,255,0.07)' : '#F9FAFB';
  const tabBarBg = isDark ? '#000000' : '#FFFFFF';
  const tabBarBorder = isDark ? '#282828' : '#E5E7EB';

  return (
    <AdminThemeContext.Provider
      value={{
        isDark,
        toggleTheme,
        textPrimary,
        textSecondary,
        bgCardBorder,
        bgInput,
        tabBarBg,
        tabBarBorder,
        animBg,
        animCard,
        animCardBorder,
      }}
    >
      {children}
    </AdminThemeContext.Provider>
  );
};
