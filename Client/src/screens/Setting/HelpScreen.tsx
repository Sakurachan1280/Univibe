import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function HelpScreen() {
  const navigation = useNavigation();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [feedbackText, setFeedbackText] = useState('');

  const faqs = [
    {
      question: 'Làm thế nào để tạo phòng nghe nhạc?',
      answer: 'Vào tab Phòng, nhấn nút "+" ở góc trên bên phải, chọn bài hát và mời bạn bè tham gia.',
    },
    {
      question: 'Tôi có thể nghe nhạc offline không?',
      answer: 'Hiện tại Spotichat chỉ hỗ trợ streaming online. Tính năng offline sẽ được cập nhật trong phiên bản tới.',
    },
    {
      question: 'Làm sao để tạo playlist?',
      answer: 'Vào tab Thư viện, chọn "Tạo playlist mới", đặt tên và thêm các bài hát yêu thích.',
    },
    {
      question: 'AI gợi ý nhạc hoạt động như thế nào?',
      answer: 'AI phân tích lịch sử nghe nhạc, sở thích của bạn và đề xuất các bài hát phù hợp.',
    },
    {
      question: 'Tôi quên mật khẩu, phải làm sao?',
      answer: 'Tại màn hình đăng nhập, chọn "Quên mật khẩu" và làm theo hướng dẫn để đặt lại.',
    },
  ];

  const supportOptions = [
    { icon: 'chatbubbles', title: 'Chat trực tiếp', desc: 'Trò chuyện với đội hỗ trợ', color: '#EC4899' },
    { icon: 'mail', title: 'Email hỗ trợ', desc: 'support@spotichat.com', color: '#06B6D4' },
    { icon: 'call', title: 'Hotline', desc: '1900-xxxx (8:00 - 22:00)', color: '#8B5CF6' },
    { icon: 'logo-facebook', title: 'Facebook', desc: 'fb.com/spotichat', color: '#3B82F6' },
  ];

  const handleSendFeedback = () => {
    if (feedbackText.trim()) {
      Alert.alert('Cảm ơn!', 'Phản hồi của bạn đã được gửi thành công.');
      setFeedbackText('');
    } else {
      Alert.alert('Lỗi', 'Vui lòng nhập nội dung phản hồi.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Header */}
      <View className="px-6 py-4 border-b border-white/10 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-2xl font-bold">Trợ Giúp & Hỗ Trợ</Text>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-6 py-6">
        {/* Support Options */}
        <View className="mb-6">
          <Text className="text-white text-xl font-bold mb-4">Liên Hệ Hỗ Trợ</Text>
          {supportOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              className="bg-white/5 rounded-xl p-4 mb-3 border border-white/10 flex-row items-center"
              activeOpacity={0.7}
            >
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: `${option.color}20` }}
              >
                <Ionicons name={option.icon as any} size={24} color={option.color} />
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold mb-1">{option.title}</Text>
                <Text className="text-gray-400 text-sm">{option.desc}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          ))}
        </View>

        {/* FAQs */}
        <View className="mb-6">
          <Text className="text-white text-xl font-bold mb-4">Câu Hỏi Thường Gặp</Text>
          {faqs.map((faq, index) => (
            <TouchableOpacity
              key={index}
              className="bg-white/5 rounded-xl p-4 mb-3 border border-white/10"
              activeOpacity={0.7}
              onPress={() => setExpandedFaq(expandedFaq === index ? null : index)}
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-white font-semibold flex-1 mr-2">{faq.question}</Text>
                <Ionicons
                  name={expandedFaq === index ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#EC4899"
                />
              </View>
              {expandedFaq === index && (
                <Text className="text-gray-400 text-sm mt-3 leading-5">{faq.answer}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Feedback Form */}
        <View className="mb-6">
          <Text className="text-white text-xl font-bold mb-4">Gửi Phản Hồi</Text>
          <View className="bg-white/5 rounded-2xl p-5 border border-white/10">
            <TextInput
              className="bg-white/10 rounded-xl p-4 text-white mb-4"
              placeholder="Nhập phản hồi của bạn..."
              placeholderTextColor="#666"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={feedbackText}
              onChangeText={setFeedbackText}
            />
            <TouchableOpacity
              className="bg-pink-600 rounded-xl p-4 items-center"
              activeOpacity={0.8}
              onPress={handleSendFeedback}
            >
              <Text className="text-white font-bold">Gửi Phản Hồi</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Links */}
        <View className="mb-8">
          <Text className="text-white text-xl font-bold mb-4">Liên Kết Hữu Ích</Text>
          <TouchableOpacity className="bg-white/5 rounded-xl p-4 mb-3 border border-white/10 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons name="document-text" size={20} color="#EC4899" />
              <Text className="text-white font-semibold ml-3">Điều khoản sử dụng</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity className="bg-white/5 rounded-xl p-4 mb-3 border border-white/10 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons name="shield-checkmark" size={20} color="#06B6D4" />
              <Text className="text-white font-semibold ml-3">Chính sách bảo mật</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity className="bg-white/5 rounded-xl p-4 border border-white/10 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons name="book" size={20} color="#8B5CF6" />
              <Text className="text-white font-semibold ml-3">Hướng dẫn sử dụng</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
