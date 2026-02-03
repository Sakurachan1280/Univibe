import React, { useState } from 'react';
import {
    View,
    Text,
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
import { useNavigation } from '@react-navigation/native';

// TODO: IF RUNNING ON PHYSICAL DEVICE, REPLACE 'localhost' WITH YOUR COMPUTER'S LAN IP (e.g. 192.168.1.10)
// ANDROID EMULATOR: Use '10.0.2.2'
// IOS SIMULATOR: Use 'localhost'
const API_URL =
    Platform.OS === "android"
        ? "http://192.168.1.27:5000"
        : "http://localhost:5000";


// TODO: Replace this with your actual method of retrieving the auth token (e.g., AsyncStorage)
const USER_TOKEN = "REPLACE_WITH_VALID_BEARER_TOKEN";

export default function CreateArtistScreen() {
    const navigation = useNavigation();
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [avatar, setAvatar] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const pickImage = async () => {
        // Request permissions
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
            setAvatar(result.assets[0].uri);
        }
    };

    const handleCreateArtist = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Please enter an artist name.');
            return;
        }

        // Warn about missing token if it's the default placeholder
        if (USER_TOKEN === "REPLACE_WITH_VALID_BEARER_TOKEN") {
            Alert.alert("Development Warning", "Please set a valid User Token in the code to test the API.");
            // We continue just to try the request, but it will likely fail 401
        }

        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('bio', bio);

            if (avatar) {
                const filename = avatar.split('/').pop() || 'avatar.jpg';
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : 'image/jpeg';

                // @ts-ignore: FormData expects specific object shape for files in React Native
                formData.append('avatar', {
                    uri: avatar,
                    name: filename,
                    type,
                });
            }

            console.log(`Sending request to ${API_URL}/api/music/artists`);

            const response = await fetch(`${API_URL}/api/music/artists`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${USER_TOKEN}`,
                },
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message || 'Failed to create artist');
            }

            Alert.alert('Success', 'Artist created successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);

            // Reset form
            setName('');
            setBio('');
            setAvatar(null);

        } catch (error: any) {
            console.error('Error creating artist:', error);
            Alert.alert('Error', error.message || 'Something went wrong. Please check your connection and try again.');
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
                <Text className="text-white text-lg font-bold ml-4">Add New Artist</Text>
            </View>

            <ScrollView className="flex-1 px-5 pt-6">
                {/* Avatar Picker */}
                <View className="items-center mb-8">
                    <TouchableOpacity onPress={pickImage} className="relative">
                        <View className={`w-32 h-32 rounded-full items-center justify-center overflow-hidden border-2 border-dashed ${avatar ? 'border-primary' : 'border-gray-500'}`}>
                            {avatar ? (
                                <Image source={{ uri: avatar }} className="w-full h-full" resizeMode="cover" />
                            ) : (
                                <View className="items-center justify-center bg-gray-900 w-full h-full">
                                    <Ionicons name="camera" size={40} color="gray" />
                                    <Text className="text-gray-500 text-xs mt-2">Upload Photo</Text>
                                </View>
                            )}
                        </View>
                        {!avatar && (
                            <View className="absolute bottom-0 right-0 bg-white rounded-full p-2">
                                <Ionicons name="add" size={16} color="black" />
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Name Input */}
                <View className="mb-6">
                    <Text className="text-gray-400 text-sm mb-2 font-medium">Artist Name *</Text>
                    <TextInput
                        value={name}
                        onChangeText={setName}
                        placeholder="ví dụ: Sơn Tùng M-TP"
                        placeholderTextColor="#666"
                        className="bg-white/10 text-white p-4 rounded-xl border border-white/10 text-base"
                        multiline={false}
                        textAlignVertical="top"
                        style={{ textAlignVertical: 'center' }}
                    />
                </View>

                {/* Bio Input */}
                <View className="mb-8">
                    <Text className="text-gray-400 text-sm mb-2 font-medium">Biography</Text>
                    <TextInput
                        value={bio}
                        onChangeText={setBio}
                        placeholder="Giới thiệu về nghệ sĩ..."
                        placeholderTextColor="#666"
                        className="bg-white/10 text-white p-4 rounded-xl border border-white/10 focus:border-white/50 text-base h-32"
                        multiline
                        textAlignVertical="top"
                    />
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    onPress={handleCreateArtist}
                    disabled={isLoading}
                    className={`py-4 rounded-xl items-center justify-center mb-10 ${isLoading ? 'bg-gray-700' : 'bg-green-600'}`}
                >
                    {isLoading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-bold text-lg">Create Artist</Text>
                    )}
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}
