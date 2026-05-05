import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Modal,
    ActivityIndicator,
    Switch,
    Platform,
    ScrollView,
    Image,
    Alert,
    Animated,
    Keyboard,
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

    // Fade + scale animation for dialog open/close
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.92)).current;
    // Keyboard slide: translateY lên khi bàn phím mở
    const keyboardOffsetAnim = useRef(new Animated.Value(0)).current;
    const [rendered, setRendered] = useState(false);

    useEffect(() => {
        if (visible) {
            setRendered(true);
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
                Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, damping: 18, stiffness: 220 }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
                Animated.timing(scaleAnim, { toValue: 0.92, duration: 160, useNativeDriver: true }),
            ]).start(() => setRendered(false));
        }
    }, [visible]);

    // Lắng nghe bàn phím → trượt modal lên mượt
    useEffect(() => {
        const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
        const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

        const onShow = (e: any) => {
            Animated.timing(keyboardOffsetAnim, {
                toValue: -(e.endCoordinates.height / 2.2),
                duration: Platform.OS === 'ios' ? e.duration || 250 : 200,
                useNativeDriver: true,
            }).start();
        };
        const onHide = (e: any) => {
            Animated.timing(keyboardOffsetAnim, {
                toValue: 0,
                duration: Platform.OS === 'ios' ? e.duration || 220 : 180,
                useNativeDriver: true,
            }).start();
        };

        const showSub = Keyboard.addListener(showEvent, onShow);
        const hideSub = Keyboard.addListener(hideEvent, onHide);
        return () => { showSub.remove(); hideSub.remove(); };
    }, []);

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
            {/* Backdrop */}
            <Animated.View
                style={{
                    position: 'absolute', top: 0, bottom: 0, left: 0, right: 0,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    opacity: fadeAnim,
                }}
            >
                <TouchableWithoutFeedback onPress={handleClose}>
                    <View style={{ flex: 1 }} />
                </TouchableWithoutFeedback>
            </Animated.View>

            {/* Container căn giữa — modal trượt lên mượt theo bàn phím */}
            <View
                style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 20 }}
                pointerEvents="box-none"
            >
                <Animated.View
                    style={{
                        width: "100%",
                        opacity: fadeAnim,
                        transform: [
                            { scale: scaleAnim },
                            { translateY: keyboardOffsetAnim },
                        ],
                    }}
                >
                    <View
                        style={{
                            backgroundColor: "#161616",
                            borderRadius: 24,
                            borderWidth: 1,
                            borderColor: "rgba(255,255,255,0.09)",
                            overflow: "hidden",
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 12 },
                            shadowOpacity: 0.5,
                            shadowRadius: 24,
                            elevation: 20,
                        }}
                    >
                        <ScrollView
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                            bounces={false}
                            contentContainerStyle={{ padding: 24 }}
                        >
                            {/* Header */}
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                                <Text style={{ color: "white", fontSize: 20, fontWeight: "800" }}>Tạo Playlist Mới</Text>
                                <TouchableOpacity onPress={handleClose} disabled={loading}
                                    style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" }}
                                >
                                    <Ionicons name="close" size={18} color="rgba(255,255,255,0.7)" />
                                </TouchableOpacity>
                            </View>

                            {/* Cover Picker */}
                            <View style={{ alignItems: "center", marginBottom: 20 }}>
                                <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
                                    {coverUri ? (
                                        <View style={{ position: "relative" }}>
                                            <Image
                                                source={{ uri: coverUri }}
                                                style={{ width: 100, height: 100, borderRadius: 16 }}
                                            />
                                            <View style={{
                                                position: "absolute", bottom: 0, right: 0,
                                                backgroundColor: "#EC4899", borderRadius: 18,
                                                padding: 6, margin: 4,
                                            }}>
                                                <Ionicons name="camera" size={14} color="white" />
                                            </View>
                                        </View>
                                    ) : (
                                        <LinearGradient
                                            colors={["#EC4899", "#06B6D4"]}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                            style={{ width: 100, height: 100, borderRadius: 16, alignItems: "center", justifyContent: "center" }}
                                        >
                                            <Ionicons name="camera-outline" size={30} color="rgba(255,255,255,0.9)" />
                                            <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 10, marginTop: 4, fontWeight: "600" }}>
                                                Chọn ảnh bìa
                                            </Text>
                                        </LinearGradient>
                                    )}
                                </TouchableOpacity>
                            </View>

                            {/* Name Input */}
                            <Text style={{ color: "rgba(255,255,255,0.55)", fontSize: 11, fontWeight: "700", marginBottom: 7, textTransform: "uppercase", letterSpacing: 0.8 }}>
                                Tên playlist *
                            </Text>
                            <TextInput
                                value={name}
                                onChangeText={(t) => { setName(t); setError(null); }}
                                placeholder="VD: Nhạc thư giãn buổi tối..."
                                placeholderTextColor="rgba(255,255,255,0.22)"
                                maxLength={60}
                                style={{
                                    color: "white",
                                    backgroundColor: "rgba(255,255,255,0.07)",
                                    borderRadius: 12,
                                    paddingHorizontal: 14,
                                    paddingVertical: 13,
                                    fontSize: 15,
                                    marginBottom: 4,
                                    borderWidth: 1,
                                    borderColor: error && !name.trim() ? "#EC4899" : "rgba(255,255,255,0.1)",
                                }}
                            />
                            <Text style={{ color: "rgba(255,255,255,0.25)", fontSize: 11, textAlign: "right", marginBottom: 14 }}>
                                {name.length}/60
                            </Text>

                            {/* Description Input */}
                            <Text style={{ color: "rgba(255,255,255,0.55)", fontSize: 11, fontWeight: "700", marginBottom: 7, textTransform: "uppercase", letterSpacing: 0.8 }}>
                                Mô tả (tùy chọn)
                            </Text>
                            <TextInput
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Mô tả ngắn về playlist của bạn..."
                                placeholderTextColor="rgba(255,255,255,0.22)"
                                multiline
                                maxLength={200}
                                numberOfLines={3}
                                style={{
                                    color: "white",
                                    backgroundColor: "rgba(255,255,255,0.07)",
                                    borderRadius: 12,
                                    paddingHorizontal: 14,
                                    paddingVertical: 13,
                                    fontSize: 14,
                                    marginBottom: 4,
                                    borderWidth: 1,
                                    borderColor: "rgba(255,255,255,0.1)",
                                    textAlignVertical: "top",
                                    minHeight: 72,
                                }}
                            />
                            <Text style={{ color: "rgba(255,255,255,0.25)", fontSize: 11, textAlign: "right", marginBottom: 16 }}>
                                {description.length}/200
                            </Text>

                            {/* Public toggle */}
                            <View style={{
                                flexDirection: "row", alignItems: "center",
                                backgroundColor: "rgba(255,255,255,0.05)",
                                borderRadius: 14, padding: 14, marginBottom: 20,
                                borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
                            }}>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ color: "white", fontSize: 14, fontWeight: "600" }}>Công khai</Text>
                                    <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginTop: 2 }}>
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
                                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 14, gap: 6 }}>
                                    <Ionicons name="alert-circle" size={15} color="#EC4899" />
                                    <Text style={{ color: "#EC4899", fontSize: 13 }}>{error}</Text>
                                </View>
                            )}

                            {/* Submit Button */}
                            <TouchableOpacity
                                onPress={handleCreate}
                                disabled={loading || !name.trim()}
                                activeOpacity={0.8}
                                style={{ borderRadius: 14, overflow: "hidden" }}
                            >
                                <LinearGradient
                                    colors={loading || !name.trim() ? ["#444", "#333"] : ["#EC4899", "#06B6D4"]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 15, gap: 8 }}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="white" size="small" />
                                    ) : (
                                        <Ionicons name="add-circle" size={20} color="white" />
                                    )}
                                    <Text style={{ color: "white", fontWeight: "800", fontSize: 15 }}>
                                        {loading ? "Đang tạo..." : "Tạo Playlist"}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}
