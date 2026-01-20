import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, SafeAreaView, KeyboardAvoidingView, Platform, Modal, TouchableWithoutFeedback, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { MOCK_USERS, Message, CURRENT_USER_ID } from '../../data/mockData';

type Props = NativeStackScreenProps<RootStackParamList, 'ChatDetail'>;

// Mock messages for a session
const MOCK_MESSAGES: Message[] = [
  { id: '1', text: 'Hello there!', senderId: 'others', timestamp: '12:00' },
  { id: '2', text: 'Hi! How are you?', senderId: CURRENT_USER_ID, timestamp: '12:01' },
  { id: '3', text: 'I am good, thanks! And you?', senderId: 'others', timestamp: '12:02' },
];

export default function ChatDetailScreen({ route, navigation }: Props) {
  const { userId } = route.params;
  const user = MOCK_USERS.find(u => u.id === userId);
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);

  const handleCreateGroup = () => {
    setMenuVisible(false);
    console.log("Create Group Chat");
    // Implement Group Chat creation logic here
  };

  const handleCreateMusicRoom = () => {
    setMenuVisible(false);
    console.log("Create Music Room");
    // Implement Music Room creation logic here
  };

  const handleSend = () => {
    if (inputText.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: inputText,
        senderId: CURRENT_USER_ID,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([...messages, newMessage]);
      setInputText('');
    }
  };

  if (!user) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <Text className="text-white">User not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 border-b border-gray-800">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <View className="items-center">
          <Image 
            source={{ uri: user.avatar }} 
            className="w-10 h-10 rounded-full mb-1"
          />
          <Text className="text-white text-sm font-bold">{user.name}</Text>
        </View>

        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <Ionicons name="ellipsis-vertical" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Options Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View className="flex-1 bg-black/50 relative">
            <View className="absolute top-16 right-4 bg-gray-800 rounded-lg p-2 w-56 shadow-lg border border-gray-700">
              <TouchableOpacity onPress={handleCreateGroup} className="p-3 border-b border-gray-700 flex-row items-center">
                <Ionicons name="people-outline" size={20} color="white" className="mr-3" />
                <Text className="text-white">Tạo nhóm chat</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCreateMusicRoom} className="p-3 flex-row items-center">
                 <Ionicons name="musical-notes-outline" size={20} color="white" className="mr-3" />
                <Text className="text-white">Tạo phòng nghe nhạc</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Messages */}
      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => {
          const isMe = item.senderId === CURRENT_USER_ID;
          return (
            <View className={`my-1 mx-4 flex-row items-end ${isMe ? 'justify-end' : 'justify-start'}`}>
              {!isMe && (
                <Image 
                  source={{ uri: user.avatar }} 
                  className="w-8 h-8 rounded-full mr-2 mb-1"
                />
              )}
              <View className={`max-w-[70%] p-3 rounded-2xl ${isMe ? 'bg-[#0084ff]' : 'bg-[#1e1e1e]'}`}> 
                <Text className="text-white text-base">{item.text}</Text>
              </View>
               <Text className="text-gray-500 text-[10px] ml-2 self-center">{item.timestamp}</Text>
            </View>
          );
        }}
        contentContainerStyle={{ paddingVertical: 10, gap: 10 }}
      />

      {/* Input */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View className="flex-row items-center p-3 mb-2 mx-2 bg-black">
           <TouchableOpacity className="mr-3">
             <Ionicons name="add" size={28} color="white" />
           </TouchableOpacity>
           <TouchableOpacity className="mr-3">
             <Ionicons name="camera-outline" size={26} color="white" />
           </TouchableOpacity>
          <View className="flex-1 flex-row items-center bg-transparent border border-gray-600 rounded-full px-4 py-2">
             <TextInput
                className="flex-1 text-white text-base pt-0 pb-0"
                placeholder="Aa"
                placeholderTextColor="#888"
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={handleSend}
              />
          </View>
          <TouchableOpacity onPress={handleSend} className="ml-3">
            <Ionicons name="send" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
