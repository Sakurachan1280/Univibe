import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SectionList,
  Animated,
  PanResponder,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { getListeningHistory, ListeningHistoryItem } from "../../API/libraryAPI";
import { useMusic } from "../../context/MusicContext";
import { format, isToday, isYesterday, isThisWeek, differenceInMinutes } from "date-fns";
import { vi } from "date-fns/locale";
import { Song } from "../../API/musicAPI";

// ─── Types ───────────────────────────────────────────────────────────────────

interface SectionData {
  title: string;
  data: ListeningHistoryItem[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Format thời gian nghe một cách thân thiện (giống Spotify)
 */
function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMins = differenceInMinutes(now, date);

  if (diffMins < 1) return "Vừa xong";
  if (diffMins < 60) return `${diffMins} phút trước`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;
  return format(date, "HH:mm", { locale: vi });
}

/**
 * Format nhãn section theo ngày (hôm nay, hôm qua, thứ, ngày tháng)
 */
function getSectionLabel(timestamp: string): string {
  const date = new Date(timestamp);
  if (isToday(date)) return "Hôm nay";
  if (isYesterday(date)) return "Hôm qua";
  if (isThisWeek(date)) return format(date, "EEEE", { locale: vi });
  return format(date, "dd MMMM yyyy", { locale: vi });
}

/**
 * Format duration bài hát (giây → mm:ss)
 */
function formatDuration(seconds?: number): string {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Deduplicate: loại bỏ các lần nghe liền kề cùng bài trong vòng 5 phút
 */
function deduplicateHistory(items: ListeningHistoryItem[]): ListeningHistoryItem[] {
  const result: ListeningHistoryItem[] = [];
  for (let i = 0; i < items.length; i++) {
    const current = items[i];
    const prev = result[result.length - 1];
    if (
      prev &&
      prev.song_id?._id === current.song_id?._id &&
      differenceInMinutes(new Date(prev.timestamp), new Date(current.timestamp)) < 5
    ) {
      continue; // skip duplicate
    }
    result.push(current);
  }
  return result;
}

/**
 * Group lịch sử theo ngày thành SectionList sections
 */
function groupByDate(items: ListeningHistoryItem[]): SectionData[] {
  const map = new Map<string, ListeningHistoryItem[]>();

  for (const item of items) {
    if (!item.song_id) continue;
    const label = getSectionLabel(item.timestamp);
    if (!map.has(label)) map.set(label, []);
    map.get(label)!.push(item);
  }

  const sections: SectionData[] = [];
  map.forEach((data, title) => {
    sections.push({ title, data });
  });
  return sections;
}

// ─── Song Row (with swipe-to-reveal) ─────────────────────────────────────────

interface SongRowProps {
  item: ListeningHistoryItem;
  isCurrentlyPlaying: boolean;
  onPress: () => void;
}

function SongRow({ item, isCurrentlyPlaying, onPress }: SongRowProps) {
  const song = item.song_id as Song & { artist_ids?: any[] };
  const artistNames =
    song.artist_ids?.map((a: any) => a.name).join(", ") || "Unknown Artist";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: isCurrentlyPlaying ? "rgba(236,72,153,0.08)" : "transparent",
      }}
    >
      {/* Album art */}
      <View style={{ position: "relative" }}>
        <Image
          source={song.cover_image || "https://via.placeholder.com/48"}
          style={{ width: 52, height: 52, borderRadius: 6 }}
          cachePolicy="memory-disk"
        />
        {isCurrentlyPlaying && (
          <View
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.45)",
              borderRadius: 6,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons name="musical-notes" size={18} color="#ec4899" />
          </View>
        )}
      </View>

      {/* Song info */}
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text
          numberOfLines={1}
          style={{
            color: isCurrentlyPlaying ? "#ec4899" : "#fff",
            fontSize: 15,
            fontWeight: "600",
          }}
        >
          {song.title}
        </Text>
        <Text numberOfLines={1} style={{ color: "#9ca3af", fontSize: 13, marginTop: 2 }}>
          {artistNames}
        </Text>
      </View>

      {/* Right side: time + duration */}
      <View style={{ alignItems: "flex-end", marginLeft: 8 }}>
        <Text style={{ color: "#6b7280", fontSize: 11 }}>
          {formatRelativeTime(item.timestamp)}
        </Text>
        {song.duration ? (
          <Text style={{ color: "#4b5563", fontSize: 11, marginTop: 2 }}>
            {formatDuration(song.duration)}
          </Text>
        ) : null}
      </View>

      {/* Chevron / play indicator */}
      <Ionicons
        name={isCurrentlyPlaying ? "pause-circle" : "play-circle-outline"}
        size={28}
        color={isCurrentlyPlaying ? "#ec4899" : "#374151"}
        style={{ marginLeft: 8 }}
      />
    </TouchableOpacity>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function HistoryScreen() {
  const navigation = useNavigation();
  const { playSong, currentSong } = useMusic();
  const [sections, setSections] = useState<SectionData[]>([]);
  const [rawHistory, setRawHistory] = useState<ListeningHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ── Load data ──────────────────────────────────────────────────────────────

  const loadHistory = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const data = await getListeningHistory();

      // Sort newest first (server might not guarantee order)
      const sorted = [...data].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      // Deduplicate consecutive same-song plays within 5 min
      const deduped = deduplicateHistory(sorted);

      setRawHistory(deduped);
      setSections(groupByDate(deduped));
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // ── Play logic ─────────────────────────────────────────────────────────────

  /**
   * Play từ history: tạo queue là toàn bộ lịch sử (unique songs), bắt đầu từ bài được chọn
   */
  const handlePlaySong = useCallback(
    async (selectedItem: ListeningHistoryItem) => {
      if (!selectedItem.song_id) return;

      // Build deduplicated song queue from history (unique by song ID, preserve order)
      const seen = new Set<string>();
      const queue: Song[] = [];
      for (const item of rawHistory) {
        if (item.song_id && !seen.has((item.song_id as Song)._id)) {
          seen.add((item.song_id as Song)._id);
          queue.push(item.song_id as Song);
        }
      }

      const targetSong = selectedItem.song_id as Song;
      await playSong(targetSong, queue);
    },
    [rawHistory, playSong]
  );

  /**
   * Play tất cả lịch sử từ đầu
   */
  const handlePlayAll = useCallback(async () => {
    if (rawHistory.length === 0) return;

    const seen = new Set<string>();
    const queue: Song[] = [];
    for (const item of rawHistory) {
      if (item.song_id && !seen.has((item.song_id as Song)._id)) {
        seen.add((item.song_id as Song)._id);
        queue.push(item.song_id as Song);
      }
    }

    if (queue.length > 0) {
      await playSong(queue[0], queue);
    }
  }, [rawHistory, playSong]);

  // ── Render ─────────────────────────────────────────────────────────────────

  const totalSongs = rawHistory.length;

  const renderSectionHeader = ({ section }: { section: SectionData }) => (
    <View
      style={{
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 8,
        backgroundColor: "#000",
      }}
    >
      <Text style={{ color: "#9ca3af", fontSize: 12, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" }}>
        {section.title}
      </Text>
    </View>
  );

  const renderItem = ({ item }: { item: ListeningHistoryItem }) => {
    if (!item.song_id) return null;
    const isPlaying = currentSong?._id === (item.song_id as Song)._id;
    return (
      <SongRow
        item={item}
        isCurrentlyPlaying={isPlaying}
        onPress={() => handlePlaySong(item)}
      />
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }} edges={["top"]}>
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <LinearGradient
        colors={["#1a0a23", "#000"]}
        style={{ paddingBottom: 0 }}
      >
        {/* Back + title row */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: 12,
          }}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ padding: 6, marginRight: 8 }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={26} color="#fff" />
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Text style={{ color: "#fff", fontSize: 22, fontWeight: "700" }}>
              Nghe gần đây
            </Text>
            {totalSongs > 0 && (
              <Text style={{ color: "#6b7280", fontSize: 13, marginTop: 2 }}>
                {totalSongs} bài đã nghe
              </Text>
            )}
          </View>
        </View>

        {/* Play All bar */}
        {totalSongs > 0 && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 16,
              paddingBottom: 16,
            }}
          >
            <Text style={{ color: "#9ca3af", fontSize: 13 }}>
              Phát theo thứ tự đã nghe
            </Text>
            <TouchableOpacity
              onPress={handlePlayAll}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#ec4899",
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                gap: 6,
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="play" size={14} color="#fff" />
              <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}>
                Phát tất cả
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </LinearGradient>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#ec4899" />
          <Text style={{ color: "#6b7280", marginTop: 12, fontSize: 14 }}>
            Đang tải lịch sử...
          </Text>
        </View>
      ) : sections.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingBottom: 80 }}>
          <Ionicons name="time-outline" size={72} color="#1f2937" />
          <Text style={{ color: "#6b7280", fontSize: 17, fontWeight: "600", marginTop: 16 }}>
            Chưa có lịch sử
          </Text>
          <Text style={{ color: "#4b5563", fontSize: 14, marginTop: 8, textAlign: "center", paddingHorizontal: 40 }}>
            Bắt đầu nghe nhạc để lịch sử của bạn xuất hiện ở đây
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          onRefresh={() => loadHistory(true)}
          refreshing={refreshing}
          stickySectionHeadersEnabled
          contentContainerStyle={{ paddingBottom: 120 }}
          ItemSeparatorComponent={() => (
            <View
              style={{
                height: 1,
                backgroundColor: "rgba(255,255,255,0.04)",
                marginLeft: 80,
              }}
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
