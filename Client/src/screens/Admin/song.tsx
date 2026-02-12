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
import { createSong } from '../../API/songAPI';

// Using Artist type from artistAPI

export default function CreateSongScreen() {
    const navigation = useNavigation();
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

            Alert.alert('Success', 'Song created successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);

            // Reset form
            setTitle('');
            setDuration('');
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
        <SafeAreaView className="flex-1 bg-black">
            <View className="flex-row items-center px-4 py-2 border-b border-white/10">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-lg font-bold ml-4">Add New Song</Text>
            </View>

            <ScrollView className="flex-1 px-5 pt-6">
                {/* Cover Image Picker */}
                <View className="items-center mb-8">
                    <TouchableOpacity onPress={pickCoverImage} className="relative">
                        <View className={`w-32 h-32 rounded-xl items-center justify-center overflow-hidden border-2 border-dashed ${coverImage ? 'border-primary' : 'border-gray-500'}`}>
                            {coverImage ? (
                                <Image source={{ uri: coverImage }} className="w-full h-full" resizeMode="cover" />
                            ) : (
                                <View className="items-center justify-center bg-gray-900 w-full h-full">
                                    <Ionicons name="image" size={40} color="gray" />
                                    <Text className="text-gray-500 text-xs mt-2">Cover Image</Text>
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
                    <Text className="text-gray-400 text-sm mb-2 font-medium">Song Title *</Text>
                    <TextInput
                        value={title}
                        onChangeText={setTitle}
                        placeholder="ví dụ: Chúng Ta Của Hiện Tại"
                        placeholderTextColor="#666"
                        className="bg-white/10 text-white p-4 rounded-xl border border-white/10 text-base"
                        style={{ textAlignVertical: 'center' }}
                    />
                </View>

                {/* Duration Input */}
                <View className="mb-6">
                    <Text className="text-gray-400 text-sm mb-2 font-medium">Duration (seconds) *</Text>
                    <TextInput
                        value={duration}
                        onChangeText={setDuration}
                        placeholderTextColor="#666"
                        keyboardType="numeric"
                        className="bg-white/10 text-white p-4 rounded-xl border border-white/10 text-base"
                        style={{ textAlignVertical: 'center' }}
                    />
                </View>

                {/* Genres Input */}
                <View className="mb-6">
                    <Text className="text-gray-400 text-sm mb-2 font-medium">Genres (comma separated)</Text>
                    <TextInput
                        value={genres}
                        onChangeText={setGenres}
                        placeholder="ví dụ: Pop, Ballad, V-Pop"
                        placeholderTextColor="#666"
                        className="bg-white/10 text-white p-4 rounded-xl border border-white/10 text-base"
                        style={{ textAlignVertical: 'center' }}
                    />
                </View>

                {/* Audio File Picker */}
                <View className="mb-6">
                    <Text className="text-gray-400 text-sm mb-2 font-medium">Audio File *</Text>
                    <TouchableOpacity
                        onPress={pickAudioFile}
                        className="bg-white/10 p-4 rounded-xl border border-white/10 flex-row items-center justify-between"
                    >
                        <View className="flex-row items-center flex-1">
                            <Ionicons name="musical-notes" size={24} color={audioFile ? "#EC4899" : "#666"} />
                            <Text className={`ml-3 text-base ${audioFile ? 'text-white' : 'text-gray-500'}`} numberOfLines={1}>
                                {audioFile ? audioFile.name : 'Select audio file'}
                            </Text>
                        </View>
                        <Ionicons name="cloud-upload-outline" size={24} color="#666" />
                    </TouchableOpacity>
                </View>

                {/* Artists Selection */}
                <View className="mb-8">
                    <Text className="text-gray-400 text-sm mb-2 font-medium">Select Artists *</Text>
                    {isLoadingArtists ? (
                        <ActivityIndicator color="#EC4899" />
                    ) : (
                        <View className="bg-white/10 rounded-xl border border-white/10 p-2">
                            {artists.length === 0 ? (
                                <Text className="text-gray-500 text-center p-4">No artists available. Please create an artist first.</Text>
                            ) : (
                                artists.map((artist) => (
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
                                        <Text className="text-white ml-3 flex-1">{artist.name}</Text>
                                        {selectedArtists.includes(artist._id) && (
                                            <Ionicons name="checkmark-circle" size={24} color="#EC4899" />
                                        )}
                                    </TouchableOpacity>
                                ))
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
    );
}
