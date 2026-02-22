import { StyleSheet, Text, View } from "react-native";
import type { Detection } from "@/src/services/websocket.service";

// ── Visual maps ──────────────────────────────────────────────────────────

const SOUND_ICONS: Record<string, string> = {
    emergency_siren: "🚨",
    horn: "📯",
    shouting: "🗣️",
    dog_barking: "🐕",
    vehicle_approaching: "🚗",
    bicycle_bell: "🔔",
    tire_screech: "⚠️",
    footsteps_running: "👟",
    glass_breaking: "💥",
    car_alarm: "🚨",
    construction_noise: "🔨",
    door_slam: "🚪",
    train: "🚂",
    aircraft: "✈️",
    alarm: "🔔",
};

const URGENCY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
    critical: { bg: "#3D0A0A", border: "#FF4444", text: "#FF6666" },
    high: { bg: "#3D2200", border: "#FF8800", text: "#FFAA44" },
    medium: { bg: "#3D3300", border: "#FFCC00", text: "#FFE066" },
    low: { bg: "#1A3D1A", border: "#88CC44", text: "#AADE77" },
    none: { bg: "#1A1A1A", border: "#555555", text: "#999999" },
};

interface DetectionCardProps {
    detection: Detection;
    /** Whether this is the primary (latest) detection — render larger */
    isPrimary?: boolean;
}

/**
 * High-contrast detection alert card.
 * Color-coded by urgency, with large icon and text for accessibility.
 */
export default function DetectionCard({ detection, isPrimary = false }: DetectionCardProps) {
    const icon = SOUND_ICONS[detection.sound_type] ?? "🔊";
    const colors = URGENCY_COLORS[detection.urgency] ?? URGENCY_COLORS.none;
    const label = detection.sound_type.replace(/_/g, " ");
    const confidencePct = Math.round(detection.confidence * 100);

    return (
        <View
            style={[
                styles.card,
                { backgroundColor: colors.bg, borderColor: colors.border },
                isPrimary && styles.primaryCard,
            ]}
        >
            <Text style={isPrimary ? styles.iconLarge : styles.icon}>{icon}</Text>

            <View style={styles.info}>
                <Text
                    style={[
                        isPrimary ? styles.labelLarge : styles.label,
                        { color: colors.text },
                    ]}
                    numberOfLines={1}
                >
                    {label}
                </Text>

                {/* Confidence bar */}
                <View style={styles.confidenceRow}>
                    <View style={styles.barTrack}>
                        <View
                            style={[
                                styles.barFill,
                                {
                                    width: `${confidencePct}%`,
                                    backgroundColor: colors.border,
                                },
                            ]}
                        />
                    </View>
                    <Text style={styles.confidenceText}>{confidencePct}%</Text>
                </View>
            </View>

            {/* Urgency badge */}
            <View style={[styles.badge, { backgroundColor: colors.border }]}>
                <Text style={styles.badgeText}>{detection.urgency.toUpperCase()}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1.5,
        borderRadius: 16,
        paddingVertical: 14,
        paddingHorizontal: 16,
        marginBottom: 10,
    },
    primaryCard: {
        paddingVertical: 20,
        paddingHorizontal: 20,
        borderWidth: 2,
        borderRadius: 20,
    },
    icon: {
        fontSize: 28,
        marginRight: 14,
    },
    iconLarge: {
        fontSize: 40,
        marginRight: 16,
    },
    info: {
        flex: 1,
    },
    label: {
        fontSize: 16,
        fontWeight: "700",
        textTransform: "capitalize",
        marginBottom: 6,
    },
    labelLarge: {
        fontSize: 22,
        fontWeight: "800",
        textTransform: "capitalize",
        marginBottom: 8,
    },
    confidenceRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    barTrack: {
        flex: 1,
        height: 6,
        backgroundColor: "#222",
        borderRadius: 3,
        overflow: "hidden",
    },
    barFill: {
        height: "100%",
        borderRadius: 3,
    },
    confidenceText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#999",
        width: 36,
        textAlign: "right",
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        marginLeft: 10,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: "800",
        color: "#000",
        letterSpacing: 0.5,
    },
});
