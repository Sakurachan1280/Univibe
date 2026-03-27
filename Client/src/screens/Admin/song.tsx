import React, { useState, useEffect } from 'react';
import {
    View, Text,
    TextInput,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
    ScrollView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useNavigation } from '@react-navigation/native';
import { BASE_URL } from '../../API/axiosClient';
import { getAllArtists, Artist as ArtistType } from '../../API/artistAPI';
import { createSong, checkDuplicateSong } from '../../API/songAPI';
import { useAdminTheme } from '../../context/AdminThemeContext';
import { Animated } from 'react-native';

// Using Artist type from artistAPI

export default function CreateSongScreen() {
    const navigation = useNavigation();
    const theme = useAdminTheme();
    const [title, setTitle] = useState('');
    const [duration, setDuration] = useState('300');
    const [genres, setGenres] = useState('');
    const [coverImage, setCoverImage] = useState<string | null>(null);
    const [audioFile, setAudioFile] = useState<any>(null);
    const [selectedArtists, setSelectedArtists] = useState<string[]>([]);
    const [artists, setArtists] = useState<ArtistType[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingArtists, setIsLoadingArtists] = useState(true);

    useEffect(() => {
        fetchArtists();
    }, []);

    const fetchArtists = async () => {
        try {
            const artistsData = await getAllArtists();
            setArtists(artistsData);
        } catch (error: any) {
            console.error('Error fetching artists:', error);
            Alert.alert('Error', 'Failed to load artists. Please try again.');
        } finally {
            setIsLoadingArtists(false);
        }
    };

    const pickCoverImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to make this work!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setCoverImage(result.assets[0].uri);
        }
    };

    const pickAudioFile = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'audio/*',
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setAudioFile(result.assets[0]);
                Alert.alert('Success', `Selected: ${result.assets[0].name}`);
            }
        } catch (error) {
            console.error('Error picking audio file:', error);
            Alert.alert('Error', 'Failed to pick audio file');
        }
    };

    const toggleArtist = (artistId: string) => {
        if (selectedArtists.includes(artistId)) {
            setSelectedArtists(selectedArtists.filter(id => id !== artistId));
        } else {
            setSelectedArtists([...selectedArtists, artistId]);
        }
    };

    const handleCreateSong = async () => {
        // Validation
        if (!title.trim()) {
            Alert.alert('Error', 'Please enter a song title.');
            return;
        }
        if (selectedArtists.length === 0) {
            Alert.alert('Error', 'Please select at least one artist.');
            return;
        }
        if (!duration.trim() || isNaN(Number(duration))) {
            Alert.alert('Error', 'Please enter a valid duration in seconds.');
            return;
        }
        if (!audioFile) {
            Alert.alert('Error', 'Please select an audio file.');
            return;
        }

        // Kiểm tra bài hát trùng lặp (cả title và artist)
        try {
            const duplicateCheck = await checkDuplicateSong(title.trim(), selectedArtists);
            if (duplicateCheck.isDuplicate) {
                const artistNames = duplicateCheck.existingSong?.artist_ids?.map(a => a.name).join(', ') || 'các ca sĩ đã chọn';
                Alert.alert(
                    'Bài hát đã tồn tại',
                    `Bài hát "${title.trim()}" với ${artistNames} đã có trong hệ thống. Vui lòng kiểm tra lại.`,
                    [{ text: 'OK' }]
                );
                return;
            }
        } catch (error) {
            console.error('Error checking duplicate:', error);
            // Tiếp tục tạo bài hát nếu có lỗi khi check duplicate
        }

        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('duration', duration);
            formData.append('artist_ids', selectedArtists.join(','));

            if (genres.trim()) {
                const genresArray = genres.split(',').map(g => g.trim()).filter(g => g);
                genresArray.forEach(genre => {
                    formData.append('genres[]', genre);
                });
            }

            // Audio file
            // @ts-ignore
            formData.append('audio', {
                uri: audioFile.uri,
                name: audioFile.name,
                type: audioFile.mimeType || 'audio/mpeg',
            });

            // Cover image
            if (coverImage) {
                const filename = coverImage.split('/').pop() || 'cover.jpg';
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : 'image/jpeg';

                // @ts-ignore
                formData.append('cover', {
                    uri: coverImage,
                    name: filename,
                    type,
                });
            }

            console.log('Creating song via songAPI');

            await createSong(formData);

            Alert.alert('Thành công', 'Đã thêm bài hát!');

            // Reset form để thêm bài tiếp
            setTitle('');
            setDuration('300');
            setGenres('');
            setCoverImage(null);
            setAudioFile(null);
            setSelectedArtists([]);

        } catch (error: any) {
            console.error('Error creating song:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Something went wrong. Please check your connection and try again.';
            Alert.alert('Error', errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Animated.View style={{ flex: 1, backgroundColor: theme.animBg }}>
        <SafeAreaView style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.bgCardBorder }}>
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
                    <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
                </TouchableOpacity>
                <Text style={{ color: theme.textPrimary, fontSize: 18, fontWeight: 'bold', marginLeft: 16 }}>Add New Song</Text>
            </View>

            <ScrollView className="flex-1 px-5 pt-6">
                {/* Cover Image Picker */}
                <View className="items-center mb-8">
                    <TouchableOpacity onPress={pickCoverImage} className="relative">
                        <View className={`w-32 h-32 rounded-xl items-center justify-center overflow-hidden border-2 border-dashed ${coverImage ? 'border-primary' : ''}`} style={!coverImage ? { borderColor: theme.textSecondary } : {}}>
                            {coverImage ? (
                                <Image source={{ uri: coverImage }} className="w-full h-full" resizeMode="cover" />
                            ) : (
                                <View style={{ alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', backgroundColor: theme.bgInput }}>
                                    <Ionicons name="image" size={40} color={theme.textSecondary} />
                                    <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 8 }}>Cover Image</Text>
                                </View>
                            )}
                        </View>
                        {!coverImage && (
                            <View className="absolute bottom-0 right-0 bg-white rounded-full p-2">
                                <Ionicons name="add" size={16} color="black" />
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Title Input */}
                <View className="mb-6">
                    <Text style={{ color: theme.textSecondary, fontSize: 14, marginBottom: 8, fontWeight: '500' }}>Song Title *</Text>
                    <TextInput
                        value={title}
                        onChangeText={setTitle}
                        placeholder="ví dụ: Chúng Ta Của Hiện Tại"
                        placeholderTextColor={theme.textSecondary}
                        style={{ color: theme.textPrimary, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: theme.bgCardBorder, backgroundColor: theme.bgInput, fontSize: 16 }}
                    />
                </View>

                {/* Duration Input */}
                <View className="mb-6">
                    <Text style={{ color: theme.textSecondary, fontSize: 14, marginBottom: 8, fontWeight: '500' }}>Duration (seconds) *</Text>
                    <TextInput
                        value={duration}
                        onChangeText={setDuration}
                        placeholderTextColor={theme.textSecondary}
                        keyboardType="numeric"
                        style={{ color: theme.textPrimary, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: theme.bgCardBorder, backgroundColor: theme.bgInput, fontSize: 16 }}
                    />
                </View>

                {/* Genres Input */}
                <View className="mb-6">
                    <Text style={{ color: theme.textSecondary, fontSize: 14, marginBottom: 8, fontWeight: '500' }}>Genres (comma separated)</Text>
                    <TextInput
                        value={genres}
                        onChangeText={setGenres}
                        placeholder="ví dụ: Pop, Ballad, V-Pop"
                        placeholderTextColor={theme.textSecondary}
                        style={{ color: theme.textPrimary, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: theme.bgCardBorder, backgroundColor: theme.bgInput, fontSize: 16 }}
                    />
                </View>

                {/* Audio File Picker */}
                <View className="mb-6">
                    <Text style={{ color: theme.textSecondary, fontSize: 14, marginBottom: 8, fontWeight: '500' }}>Audio File *</Text>
                    <TouchableOpacity
                        onPress={pickAudioFile}
                        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: theme.bgCardBorder, backgroundColor: theme.bgInput }}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                            <Ionicons name="musical-notes" size={24} color={audioFile ? "#EC4899" : theme.textSecondary} />
                            <Text style={{ marginLeft: 12, fontSize: 16, color: audioFile ? theme.textPrimary : theme.textSecondary }} numberOfLines={1}>
                                {audioFile ? audioFile.name : 'Select audio file'}
                            </Text>
                        </View>
                        <Ionicons name="cloud-upload-outline" size={24} color={theme.textSecondary} />
                    </TouchableOpacity>
                </View>

                {/* Artists Selection */}
                <View className="mb-8">
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text style={{ color: theme.textSecondary, fontSize: 14, fontWeight: '500' }}>Select Artists *</Text>
                        {artists.length > 7 && (
                            <Text style={{ color: theme.textSecondary, fontSize: 12 }}>({artists.length} ca sĩ - scroll để xem thêm)</Text>
                        )}
                    </View>
                    {isLoadingArtists ? (
                        <ActivityIndicator color="#EC4899" />
                    ) : (
                        <View style={{ backgroundColor: theme.bgInput, borderRadius: 12, borderWidth: 1, borderColor: theme.bgCardBorder, padding: 8 }}>
                            {artists.length === 0 ? (
                                <Text style={{ color: theme.textSecondary, textAlign: 'center', padding: 16 }}>No artists available. Please create an artist first.</Text>
                            ) : (
                                <ScrollView
                                    style={{ maxHeight: 280 }}
                                    showsVerticalScrollIndicator={true}
                                    nestedScrollEnabled={true}
                                >
                                    {artists.map((artist) => (
                                        <TouchableOpacity
                                            key={artist._id}
                                            onPress={() => toggleArtist(artist._id)}
                                            className={`flex-row items-center p-3 rounded-lg mb-1 ${selectedArtists.includes(artist._id) ? 'bg-pink-600/30' : 'bg-transparent'
                                                }`}
                                        >
                                            {artist.avatar ? (
                                                <Image
                                                    source={{
                                                        uri: artist.avatar.startsWith('http')
                                                            ? artist.avatar
                                                            : `${BASE_URL}${artist.avatar}`
                                                    }}
                                                    className="w-10 h-10 rounded-full"
                                                />
                                            ) : (
                                                <View className="w-10 h-10 rounded-full bg-gray-700 items-center justify-center">
                                                    <Ionicons name="person" size={20} color="gray" />
                                                </View>
                                            )}
                                            <Text style={{ color: theme.textPrimary, marginLeft: 12, flex: 1 }}>{artist.name}</Text>
                                            {selectedArtists.includes(artist._id) && (
                                                <Ionicons name="checkmark-circle" size={24} color="#EC4899" />
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            )}
                        </View>
                    )}
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    onPress={handleCreateSong}
                    disabled={isLoading}
                    className={`py-4 rounded-xl items-center justify-center mb-10 ${isLoading ? 'bg-gray-700' : 'bg-pink-600'}`}
                >
                    {isLoading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-bold text-lg">Create Song</Text>
                    )}
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
        </Animated.View>
    );
}
