import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Modal,
    TouchableWithoutFeedback,
    ActivityIndicator,
    Switch,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Image,
    Alert,
    Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { createPlaylistWithCover, Playlist } from "../../API/playlistAPI";

interface CreatePlaylistModalProps {
    visible: boolean;
    onClose: () => void;
    onCreated: (playlist: Playlist) => void;
}

export default function CreatePlaylistModal({
    visible,
    onClose,
    onCreated,
}: CreatePlaylistModalProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isPublic, setIsPublic] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [coverUri, setCoverUri] = useState<string | null>(null);

    // Smooth animation
    const slideAnim = useRef(new Animated.Value(600)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [rendered, setRendered] = useState(false);

    useEffect(() => {
        if (visible) {
            setRendered(true);
            Animated.parallel([
                Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 20, stiffness: 180 }),
                Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(slideAnim, { toValue: 600, duration: 240, useNativeDriver: true }),
                Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
            ]).start(() => setRendered(false));
        }
    }, [visible]);

    const handleClose = () => {
        if (loading) return;
        setName("");
        setDescription("");
        setIsPublic(false);
        setError(null);
        setCoverUri(null);
        onClose();
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("Cần quyền truy cập", "Vui lòng cấp quyền truy cập thư viện ảnh để chọn ảnh bìa.");
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.85,
        });
        if (!result.canceled && result.assets.length > 0) {
            setCoverUri(result.assets[0].uri);
        }
    };

    const handleCreate = async () => {
        if (!name.trim()) {
            setError("Vui lòng nhập tên playlist");
            return;
        }
        try {
            setLoading(true);
            setError(null);
            const playlist = await createPlaylistWithCover(
                name.trim(),
                description.trim() || undefined,
                coverUri ?? undefined
            );
            setName("");
            setDescription("");
            setIsPublic(false);
            setCoverUri(null);
            onCreated(playlist);
            onClose();
        } catch (err: any) {
            setError(err?.response?.data?.message ?? err?.message ?? "Không thể tạo playlist");
        } finally {
            setLoading(false);
        }
    };

    if (!rendered && !visible) return null;

    return (
        <Modal
            visible
            transparent
            animationType="none"
            statusBarTranslucent
            onRequestClose={handleClose}
        >
            {/* Animated backdrop */}
            <Animated.View
                style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.65)', opacity: fadeAnim }}
            >
                <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={handleClose} />
            </Animated.View>

            <Animated.View
                style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    transform: [{ translateY: slideAnim }],
                }}
            >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <View
                    style={{
                        backgroundColor: "#111",
                        borderTopLeftRadius: 24,
                        borderTopRightRadius: 24,
                        borderWidth: 1,
                        borderColor: "rgba(255,255,255,0.08)",
                        paddingBottom: Platform.OS === "ios" ? 36 : 24,
                    }}
                >
                    {/* Handle bar */}
                    <View style={{ alignItems: "center", paddingTop: 12, marginBottom: 4 }}>
                        <View style={{ width: 36, height: 4, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 2 }} />
                    </View>

                    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 24 }}>
                        {/* Header */}
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                            <Text style={{ color: "white", fontSize: 20, fontWeight: "800" }}>Tạo Playlist Mới</Text>
                            <TouchableOpacity onPress={handleClose} disabled={loading}>
                                <Ionicons name="close" size={24} color="rgba(255,255,255,0.6)" />
                            </TouchableOpacity>
                        </View>

                        {/* Cover Picker */}
                        <View style={{ alignItems: "center", marginBottom: 24 }}>
                            <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
                                {coverUri ? (
                                    <View style={{ position: "relative" }}>
                                        <Image
                                            source={{ uri: coverUri }}
                                            style={{ width: 120, height: 120, borderRadius: 16 }}
                                        />
                                        {/* Edit overlay */}
                                        <View style={{
                                            position: "absolute",
                                            bottom: 0,
                                            right: 0,
                                            backgroundColor: "#EC4899",
                                            borderRadius: 20,
                                            padding: 6,
                                            margin: 4,
                                        }}>
                                            <Ionicons name="camera" size={16} color="white" />
                                        </View>
                                    </View>
                                ) : (
                                    <LinearGradient
                                        colors={["#EC4899", "#06B6D4"]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={{
                                            width: 120,
                                            height: 120,
                                            borderRadius: 16,
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <Ionicons name="camera-outline" size={36} color="rgba(255,255,255,0.9)" />
                                        <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 11, marginTop: 6, fontWeight: "600" }}>
                                            Chọn ảnh bìa
                                        </Text>
                                    </LinearGradient>
                                )}
                            </TouchableOpacity>
                            <Text style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, marginTop: 8 }}>
                                Bấm vào ảnh để thay đổi
                            </Text>
                        </View>

                        {/* Name Input */}
                        <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: "600", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.8 }}>
                            Tên playlist *
                        </Text>
                        <TextInput
                            value={name}
                            onChangeText={(t) => { setName(t); setError(null); }}
                            placeholder="VD: Nhạc thư giãn buổi tối..."
                            placeholderTextColor="rgba(255,255,255,0.25)"
                            maxLength={60}
                            style={{
                                color: "white",
                                backgroundColor: "rgba(255,255,255,0.07)",
                                borderRadius: 12,
                                paddingHorizontal: 16,
                                paddingVertical: 14,
                                fontSize: 16,
                                marginBottom: 4,
                                borderWidth: 1,
                                borderColor: error && !name.trim() ? "#EC4899" : "rgba(255,255,255,0.1)",
                            }}
                        />
                        <Text style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, textAlign: "right", marginBottom: 16 }}>
                            {name.length}/60
                        </Text>

                        {/* Description Input */}
                        <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: "600", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.8 }}>
                            Mô tả (tùy chọn)
                        </Text>
                        <TextInput
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Mô tả ngắn về playlist của bạn..."
                            placeholderTextColor="rgba(255,255,255,0.25)"
                            multiline
                            maxLength={200}
                            numberOfLines={3}
                            style={{
                                color: "white",
                                backgroundColor: "rgba(255,255,255,0.07)",
                                borderRadius: 12,
                                paddingHorizontal: 16,
                                paddingVertical: 14,
                                fontSize: 15,
                                marginBottom: 4,
                                borderWidth: 1,
                                borderColor: "rgba(255,255,255,0.1)",
                                textAlignVertical: "top",
                                minHeight: 80,
                            }}
                        />
                        <Text style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, textAlign: "right", marginBottom: 20 }}>
                            {description.length}/200
                        </Text>

                        {/* Public toggle */}
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                backgroundColor: "rgba(255,255,255,0.05)",
                                borderRadius: 14,
                                padding: 16,
                                marginBottom: 20,
                                borderWidth: 1,
                                borderColor: "rgba(255,255,255,0.08)",
                            }}
                        >
                            <View style={{ flex: 1 }}>
                                <Text style={{ color: "white", fontSize: 15, fontWeight: "600" }}>Công khai</Text>
                                <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, marginTop: 2 }}>
                                    {isPublic ? "Mọi người có thể xem playlist này" : "Chỉ bạn mới thấy playlist này"}
                                </Text>
                            </View>
                            <Switch
                                value={isPublic}
                                onValueChange={setIsPublic}
                                trackColor={{ false: "rgba(255,255,255,0.15)", true: "#EC4899" }}
                                thumbColor="white"
                            />
                        </View>

                        {/* Error */}
                        {error && (
                            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16, gap: 6 }}>
                                <Ionicons name="alert-circle" size={16} color="#EC4899" />
                                <Text style={{ color: "#EC4899", fontSize: 13 }}>{error}</Text>
                            </View>
                        )}

                        {/* Submit Button */}
                        <TouchableOpacity
                            onPress={handleCreate}
                            disabled={loading || !name.trim()}
                            activeOpacity={0.8}
                            style={{ borderRadius: 16, overflow: "hidden" }}
                        >
                            <LinearGradient
                                colors={loading || !name.trim() ? ["#555", "#444"] : ["#EC4899", "#06B6D4"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    paddingVertical: 16,
                                    gap: 10,
                                }}
                            >
                                {loading ? (
                                    <ActivityIndicator color="white" size="small" />
                                ) : (
                                    <Ionicons name="add-circle" size={22} color="white" />
                                )}
                                <Text style={{ color: "white", fontWeight: "800", fontSize: 16 }}>
                                    {loading ? "Đang tạo..." : "Tạo Playlist"}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
            </Animated.View>
        </Modal>
    );
}
