import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  TextInput,
  Image,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';


export default function AdminSong() {
  const [isAddMode, setIsAddMode] = useState(false);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [audioFile, setAudioFile] = useState<any>(null);
  const [coverFile, setCoverFile] = useState<any>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);

  const songs = Array(10).fill({
    title: 'Tên bài hát',
    artist: 'Tên ca sĩ',
  });

  /* ========== PICK IMAGE ========== */
    const pickCoverImage = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            type: 'image/*',
            copyToCacheDirectory: true,
        });

        if (result.canceled) return;

        const file = result.assets[0];
        setCoverFile({
            uri: file.uri,
            name: file.name || 'cover.jpg',
            type: file.mimeType || 'image/jpeg',
        });

        setImagePreview(file.uri);
    };



  /* ========== PICK AUDIO ========== */
  const pickAudioFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
            type: 'audio/*',
            copyToCacheDirectory: true,
    });

        if (result.canceled) return;

        const file = result.assets[0];

        setAudioFile({
            uri: file.uri,
            name: file.name || 'song.mp3',
            type: file.mimeType || 'audio/mpeg',
        });
    };


  /* ========== SUBMIT ========== */
  const handleSubmit = async () => {
  if (!title || !artist || !audioFile || !coverFile) {
    Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
    return;
  }

  try {
    setLoading(true);

    await createSongAPI({
      title,
      artist,
      audio: audioFile,
      cover: coverFile,
    });

    Alert.alert('Thành công', 'Thêm bài hát thành công');
    setIsAddMode(false);

    setTitle('');
    setArtist('');
    setAudioFile(null);
    setCoverFile(null);
    setImagePreview('');
  } catch (err: any) {
    console.log('UPLOAD ERROR:', err?.response?.data || err.message);
    Alert.alert('Lỗi', 'Upload thất bại');
  } finally {
    setLoading(false);
  }
};



  const renderSongItem = ({ item }: any) => (
    <View className="flex-row items-center px-4 py-4 border-b border-gray-200 bg-white">
      <View className="w-14 h-14 bg-gray-300 rounded-lg mr-3" />
      <View className="flex-1">
        <Text className="text-base font-semibold">{item.title}</Text>
        <Text className="text-sm text-gray-600">{item.artist}</Text>
      </View>
    </View>
  );
   return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <StatusBar barStyle="light-content" />

        <View className="bg-[#4fc3dc] px-4 py-3">
          <Text className="text-white text-xl font-medium">Spotichat</Text>
        </View>

        {isAddMode ? (
          <ScrollView className="px-4 py-4 bg-gray-50">
            <TextInput
              className="bg-white border border-gray-300 rounded-lg px-4 py-3 mb-4"
              placeholder="Tên bài hát"
              value={title}
              onChangeText={setTitle}
            />

            <TextInput
              className="bg-white border border-gray-300 rounded-lg px-4 py-3 mb-4"
              placeholder="Ca sĩ"
              value={artist}
              onChangeText={setArtist}
            />

            <TouchableOpacity
              onPress={pickCoverImage}
              className="bg-white border border-gray-300 rounded-lg px-4 py-3 mb-4"
            >
              <Text>{coverFile ? coverFile.name : 'Chọn ảnh bìa'}</Text>
            </TouchableOpacity>

            {imagePreview && (
              <Image
                source={{ uri: imagePreview }}
                className="w-full h-48 rounded-lg mb-4"
              />
            )}
            <TouchableOpacity
              onPress={pickAudioFile}
              className="bg-white border border-gray-300 rounded-lg px-4 py-3 mb-6"
            >
              <Text>{audioFile ? audioFile.name : 'Chọn file nhạc'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              className="bg-[#4fc3dc] rounded-lg py-4 mb-3"
            >
              <Text className="text-white text-center font-bold">
                {loading ? 'Đang upload...' : 'Thêm bài hát'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIsAddMode(false)}
              className="border border-gray-400 rounded-lg py-4"
            >
              <Text className="text-center">Hủy</Text>
            </TouchableOpacity>
          </ScrollView>
        ) : (
          <View className="flex-1">
            <TouchableOpacity
              onPress={() => setIsAddMode(true)}
              className="px-4 py-4 border-b border-gray-200"
            >
              <Text className="font-semibold">+ Thêm bài hát</Text>
            </TouchableOpacity>

            <FlatList
              data={songs}
              renderItem={renderSongItem}
              keyExtractor={(_, i) => i.toString()}
            />
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}