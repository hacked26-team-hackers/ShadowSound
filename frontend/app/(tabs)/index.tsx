import { FlatList, StyleSheet, Text, View } from "react-native";
import { PageContainer } from "@/components/page-container";
import StatusIndicator from "@/components/ui/StatusIndicator";
import PermissionGate from "@/components/ui/PermissionGate";
import Button from "@/components/ui/Button";
import DetectionCard from "@/components/ui/DetectionCard";
import DetectionRow from "@/components/ui/DetectionRow";
import { useSoundDetection } from "@/hooks/useSoundDetection";
import type { Detection } from "@/src/services/websocket.service";

// ── Emoji map for sound types ────────────────────────────────────────────

const SOUND_ICONS: Record<string, string> = {
  emergency_siren: "🚨",
  horn: "📯",
  shouting: "🗣️",
  dog_barking: "🐕",
  alarm: "🔔",
};

const URGENCY_COLORS: Record<string, string> = {
  critical: "#FF4444",
  high: "#FF8800",
  medium: "#FFCC00",
  low: "#88CC44",
  none: "#555",
};

const getIcon = (type: string) => SOUND_ICONS[type] ?? "🔊";
const getColor = (urgency: string) => URGENCY_COLORS[urgency] ?? "#555";
const formatLabel = (type: string) => type.replace(/_/g, " ");

export default function HomeScreen() {
  const {
    hasPermission,
    isListening,
    isConnected,
    lastDetection,
    recentDetections,
    chunksSent,
    startListening,
    stopListening,
  } = useSoundDetection(undefined, true); // mock=true until model is trained

  const indicatorState = isListening
    ? "active"
    : hasPermission
      ? "idle"
      : "error";

  const statusLabel =
    hasPermission === null
      ? "Requesting mic access…"
      : !hasPermission
        ? "⚠️ Microphone permission denied"
        : isListening
          ? "Listening…"
          : "Ready";

  const subtitle = isListening
    ? `${isConnected ? "🟢 Connected" : "🔴 Connecting…"} · Chunks: ${chunksSent}`
    : undefined;

  const renderDetection = ({ item }: { item: Detection }) => (
    <DetectionRow
      icon={getIcon(item.sound_type)}
      label={formatLabel(item.sound_type)}
      confidence={item.confidence}
      urgency={item.urgency}
      urgencyColor={getColor(item.urgency)}
    />
  );

  return (
    <PageContainer>
      <View style={styles.content}>
        <StatusIndicator
          state={indicatorState}
          label={statusLabel}
          subtitle={subtitle}
        />

        {lastDetection && (
          <DetectionCard
            icon={getIcon(lastDetection.sound_type)}
            label={formatLabel(lastDetection.sound_type)}
            confidence={lastDetection.confidence}
            urgencyColor={getColor(lastDetection.urgency)}
          />
        )}

        <PermissionGate
          status={hasPermission}
          deniedMessage="Please enable microphone access in your device settings."
          pendingMessage="Requesting mic access…"
        >
          <Button
            variant={isListening ? "secondary" : "primary"}
            size="large"
            onPress={isListening ? stopListening : startListening}
          >
            {isListening ? "Stop Listening" : "Start Listening"}
          </Button>
        </PermissionGate>

        {recentDetections.length > 0 && (
          <View style={styles.recentContainer}>
            <Text style={styles.recentTitle}>Recent Alerts</Text>
            <FlatList
              data={recentDetections}
              renderItem={renderDetection}
              keyExtractor={(_, idx) => idx.toString()}
              style={styles.recentList}
              scrollEnabled
            />
          </View>
        )}
      </View>
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 24,
    paddingVertical: 32,
  },
  recentContainer: {
    width: "100%",
    paddingHorizontal: 20,
    maxHeight: 200,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ccc",
    marginBottom: 8,
  },
  recentList: {
    flexGrow: 0,
  },
});
