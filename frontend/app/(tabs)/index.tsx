import { FlatList, StyleSheet, Text, View } from "react-native";
import { PageContainer } from "@/components/page-container";
import StatusIndicator from "@/components/ui/StatusIndicator";
import PermissionGate from "@/components/ui/PermissionGate";
import Button from "@/components/ui/Button";
import SonarPulse from "@/components/ui/SonarPulse";
import DetectionCard from "@/components/ui/DetectionCard";
import SoundCategoryGrid from "@/components/ui/SoundCategoryGrid";
import { useSoundDetection } from "@/hooks/useSoundDetection";
import type { Detection } from "@/src/services/websocket.service";

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
  } = useSoundDetection(undefined, true); // mock=true until model is ready

  // ── Status indicator state ───────────────────────────────────────
  const indicatorState = isListening
    ? "active"
    : hasPermission
      ? "idle"
      : "error";

  const statusLabel =
    hasPermission === null
      ? "Requesting mic access…"
      : !hasPermission
        ? "⚠️ Microphone access needed"
        : isListening
          ? "Listening…"
          : "Ready to monitor";

  const subtitle = isListening
    ? `${isConnected ? "🟢 Connected" : "🔴 Connecting…"} · ${chunksSent} chunks sent`
    : undefined;

  return (
    <PageContainer>
      <View style={styles.content}>
        {/* ── Header ────────────────────────────────────── */}
        <Text style={styles.header}>
          {isListening ? "Monitoring" : "Shadow-Sound"}
        </Text>

        {/* ── Sonar Visualization ───────────────────────── */}
        <View style={styles.sonarArea}>
          <SonarPulse active={isListening} size={220} />

          {/* Overlay the status on top of the sonar */}
          <View style={styles.statusOverlay}>
            <StatusIndicator
              state={indicatorState}
              label={statusLabel}
              subtitle={subtitle}
            />
          </View>
        </View>

        {/* ── Primary Detection Card ───────────────────── */}
        {lastDetection && (
          <DetectionCard detection={lastDetection} isPrimary />
        )}

        {/* ── Start / Stop Button ──────────────────────── */}
        <PermissionGate
          status={hasPermission}
          deniedMessage="Please enable microphone access in your device settings to use Shadow-Sound."
          pendingMessage="Requesting mic access…"
        >
          <Button
            variant={isListening ? "secondary" : "primary"}
            size="large"
            fullWidth
            onPress={isListening ? stopListening : startListening}
          >
            {isListening ? "⏹  Stop Monitoring" : "▶  Start Monitoring"}
          </Button>
        </PermissionGate>

        {/* ── Recent Detections ─────────────────────────── */}
        {recentDetections.length > 1 && (
          <View style={styles.recentSection}>
            <Text style={styles.recentTitle}>Recent Alerts</Text>
            <FlatList
              data={recentDetections.slice(1)} // skip the primary one
              renderItem={({ item }) => <DetectionCard detection={item} />}
              keyExtractor={(_, idx) => idx.toString()}
              style={styles.recentList}
              scrollEnabled={true}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}

        {/* ── Sound Category Grid (idle only) ──────────── */}
        {!isListening && recentDetections.length === 0 && (
          <View style={styles.categoriesSection}>
            <Text style={styles.categoriesTitle}>Sounds We Detect</Text>
            <SoundCategoryGrid />
          </View>
        )}

        {/* Bottom spacer for floating nav bar */}
        <View style={{ height: 80 }} />
      </View>
    </PageContainer>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingTop: 8,
  },
  header: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
  },
  sonarArea: {
    alignItems: "center",
    justifyContent: "center",
    height: 260,
    marginBottom: 16,
  },
  statusOverlay: {
    position: "absolute",
    bottom: 0,
    alignItems: "center",
  },

  // Recent detections
  recentSection: {
    flex: 1,
    marginTop: 20,
    maxHeight: 220,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ccc",
    marginBottom: 10,
  },
  recentList: {
    flexGrow: 0,
  },

  // Sound categories (idle)
  categoriesSection: {
    marginTop: 16,
  },
  categoriesTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#888",
    textAlign: "center",
    marginBottom: 14,
  },
});
