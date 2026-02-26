import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    TouchableWithoutFeedback,
    ScrollView,
    ActivityIndicator,
    Alert,
    Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { getMyPlaylists, addSongToPlaylist, Playlist } from "../../API/playlistAPI";

interface AddToPlaylistModalProps {
    visible: boolean;
    songId: string | null;
    songTitle?: string;
    onClose: () => void;
}

export default function AddToPlaylistModal({
    visible,
    songId,
    songTitle,
    onClose,
}: AddToPlaylistModalProps) {
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [loading, setLoading] = useState(false);
    const [adding, setAdding] = useState<string | null>(null); // playlistId being added

    useEffect(() => {
        if (visible) {
            fetchPlaylists();
        }
    }, [visible]);

    const fetchPlaylists = async () => {
        try {
            setLoading(true);
            const data = await getMyPlaylists();
            setPlaylists(data);
        } catch (err) {
            Alert.alert("Lỗi", "Không thể tải danh sách playlist.");
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (playlist: Playlist) => {
        if (!songId || adding) return;
        try {
            setAdding(playlist._id);
            await addSongToPlaylist(playlist._id, songId);
            Alert.alert("✅ Thành công", `Đã thêm vào "${playlist.name}"`);
            onClose();
        } catch (err: any) {
            const msg = err?.response?.data?.message ?? "Không thể thêm bài hát vào playlist.";
            Alert.alert("Lỗi", msg);
        } finally {
            setAdding(null);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.7)" }} />
            </TouchableWithoutFeedback>

            <View
                style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: "#111",
                    borderTopLeftRadius: 24,
                    borderTopRightRadius: 24,
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.08)",
                    paddingBottom: Platform.OS === "ios" ? 40 : 28,
                    maxHeight: "70%",
                }}
            >
                {/* Handle bar */}
                <View style={{ alignItems: "center", paddingTop: 12, marginBottom: 4 }}>
                    <View style={{ width: 36, height: 4, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 2 }} />
                </View>

                {/* Header */}
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingHorizontal: 20,
                        paddingVertical: 14,
                        borderBottomWidth: 1,
                        borderBottomColor: "rgba(255,255,255,0.07)",
                    }}
                >
                    <View style={{ flex: 1, marginRight: 12 }}>
                        <Text style={{ color: "white", fontSize: 17, fontWeight: "800" }}>
                            Thêm vào Playlist
                        </Text>
                        {songTitle ? (
                            <Text
                                style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginTop: 2 }}
                                numberOfLines={1}
                            >
                                {songTitle}
                            </Text>
                        ) : null}
                    </View>
                    <TouchableOpacity onPress={onClose}>
                        <Ionicons name="close" size={24} color="rgba(255,255,255,0.6)" />
                    </TouchableOpacity>
                </View>

                {/* Body */}
                {loading ? (
                    <View style={{ paddingVertical: 40, alignItems: "center" }}>
                        <ActivityIndicator size="large" color="#EC4899" />
                        <Text style={{ color: "rgba(255,255,255,0.4)", marginTop: 12, fontSize: 14 }}>
                            Đang tải playlist...
                        </Text>
                    </View>
                ) : playlists.length === 0 ? (
                    <View style={{ paddingVertical: 48, alignItems: "center", paddingHorizontal: 32 }}>
                        <Ionicons name="list-outline" size={48} color="#374151" />
                        <Text style={{ color: "white", fontSize: 16, fontWeight: "700", marginTop: 16, textAlign: "center" }}>
                            Chưa có playlist nào
                        </Text>
                        <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, textAlign: "center", marginTop: 6 }}>
                            Hãy tạo playlist trước trong thư viện của bạn
                        </Text>
                    </View>
                ) : (
                    <ScrollView
                        keyboardShouldPersistTaps="handled"
                        style={{ flexGrow: 0 }}
                        contentContainerStyle={{ paddingVertical: 8 }}
                        showsVerticalScrollIndicator={false}
                    >
                        {playlists.map((playlist) => {
                            const isAdding = adding === playlist._id;
                            return (
                                <TouchableOpacity
                                    key={playlist._id}
                                    onPress={() => handleAdd(playlist)}
                                    disabled={!!adding}
                                    activeOpacity={0.65}
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        paddingHorizontal: 20,
                                        paddingVertical: 14,
                                        gap: 14,
                                        opacity: adding && !isAdding ? 0.4 : 1,
                                    }}
                                >
                                    {/* Icon */}
                                    <LinearGradient
                                        colors={["#EC4899", "#9333EA"]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: 10,
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <Ionicons name="musical-notes" size={22} color="white" />
                                    </LinearGradient>

                                    {/* Info */}
                                    <View style={{ flex: 1 }}>
                                        <Text
                                            style={{ color: "white", fontSize: 15, fontWeight: "600" }}
                                            numberOfLines={1}
                                        >
                                            {playlist.name}
                                        </Text>
                                        <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginTop: 2 }}>
                                            {playlist.tracks?.length ?? 0} bài hát
                                        </Text>
                                    </View>

                                    {/* Action */}
                                    {isAdding ? (
                                        <ActivityIndicator size="small" color="#EC4899" />
                                    ) : (
                                        <View
                                            style={{
                                                width: 32,
                                                height: 32,
                                                borderRadius: 16,
                                                backgroundColor: "rgba(236,72,153,0.12)",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                borderWidth: 1,
                                                borderColor: "rgba(236,72,153,0.3)",
                                            }}
                                        >
                                            <Ionicons name="add" size={20} color="#EC4899" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                )}
            </View>
        </Modal>
    );
}
