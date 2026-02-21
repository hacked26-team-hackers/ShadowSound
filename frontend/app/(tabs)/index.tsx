import { Pressable, StyleSheet, Text, View } from "react-native";
import { PageContainer } from "@/components/page-container";
import { useAudioCapture } from "@/hooks/useAudioCapture";

export default function HomeScreen() {
  const {
    hasPermission,
    isCapturing,
    startCapture,
    stopCapture,
    chunkCount,
  } = useAudioCapture();

  const getStatusText = () => {
    if (hasPermission === null) return "Requesting mic access…";
    if (!hasPermission) return "⚠️ Microphone permission denied";
    if (isCapturing) return "Listening…";
    return "Ready";
  };

  return (
    <PageContainer>
      <View style={styles.container}>
        {/* Status indicator */}
        <View
          style={[
            styles.statusDot,
            {
              backgroundColor: isCapturing
                ? "#00FF88"
                : hasPermission
                  ? "#555"
                  : "#FF4444",
            },
          ]}
        />
        <Text style={styles.statusText}>{getStatusText()}</Text>

        {/* Chunk counter */}
        {isCapturing && (
          <Text style={styles.chunkCounter}>
            Chunks captured: {chunkCount}
          </Text>
        )}

        {/* Toggle button */}
        {hasPermission && (
          <Pressable
            style={[
              styles.button,
              { backgroundColor: isCapturing ? "#FF4444" : "#00FF88" },
            ]}
            onPress={isCapturing ? stopCapture : startCapture}
          >
            <Text style={styles.buttonText}>
              {isCapturing ? "Stop Listening" : "Start Listening"}
            </Text>
          </Pressable>
        )}

        {hasPermission === false && (
          <Text style={styles.hintText}>
            Please enable microphone access in your device settings.
          </Text>
        )}
      </View>
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    paddingHorizontal: 24,
  },
  statusDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 22,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 8,
  },
  chunkCounter: {
    fontSize: 14,
    color: "#999",
    marginBottom: 24,
  },
  button: {
    marginTop: 24,
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },
  hintText: {
    fontSize: 14,
    color: "#FF8888",
    textAlign: "center",
    marginTop: 16,
  },
});
