import React, { useState } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { createPlaylist, Playlist } from "../../API/playlistAPI";

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

    const handleClose = () => {
        if (loading) return;
        setName("");
        setDescription("");
        setIsPublic(false);
        setError(null);
        onClose();
    };

    const handleCreate = async () => {
        if (!name.trim()) {
            setError("Vui lòng nhập tên playlist");
            return;
        }
        try {
            setLoading(true);
            setError(null);
            const playlist = await createPlaylist(name.trim(), description.trim() || undefined);
            setName("");
            setDescription("");
            setIsPublic(false);
            onCreated(playlist);
            onClose();
        } catch (err: any) {
            setError(err?.response?.data?.message ?? err?.message ?? "Không thể tạo playlist");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={handleClose}
        >
            <TouchableWithoutFeedback onPress={handleClose}>
                <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "flex-end" }} />
            </TouchableWithoutFeedback>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                }}
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

                        {/* Cover placeholder */}
                        <View style={{ alignItems: "center", marginBottom: 24 }}>
                            <LinearGradient
                                colors={["#EC4899", "#06B6D4"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={{
                                    width: 100,
                                    height: 100,
                                    borderRadius: 14,
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Ionicons name="musical-notes" size={44} color="rgba(255,255,255,0.9)" />
                            </LinearGradient>
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
        </Modal>
    );
}
